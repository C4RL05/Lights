/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 16/07/2011
 * Time: 13:54
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.View = function( renderManager ) {

	this.initialize( renderManager );
};

LIGHTS.View.prototype = {

    // _______________________________________________________________________________________ Constructor

    options: {

        debugView:      false,
//        debugView:      true,
	    debugViewY:     5000,

	    antialias:      false,
//        fog:            false,
        fog:            true,
        fogAmount:      0.002
    },

    postprocessing: {

//        enabled:        false,
        enabled:        true,
        blurAmount:     0.0015
    },

	initialize: function( renderManager ) {

		this.renderManager = renderManager;
		this.renderer = renderManager.renderer;

        // Camera
        if( this.options.debugView ) {

	        this.camera = new THREE.Camera( 33, window.innerWidth / window.innerHeight, 1, 16000 );
	        this.camera.position.x = 0;
	        this.camera.position.y = this.options.debugViewY;
	        this.camera.position.z = 700;
	        this.camera.rotation.x = -rad90;
            this.camera.useTarget = false;
        }
        else {

	        this.camera = new THREE.Camera( 30, window.innerWidth / window.innerHeight, 1, 1600 );
        }

        // Scene
        this.scene = new THREE.Scene();

        if( ! this.options.debugView && this.options.fog )
            this.scene.fog = new THREE.FogExp2( 0x000000, this.options.fogAmount );
//            this.scene.fog = new THREE.Fog( 0x000000, this.camera.near, this.camera.far );

		this.sceneVox = new THREE.Scene();

        this.initPostprocessing();

		this.onWindowResizeListener = bind( this, this.onWindowResize );
	},

    // _______________________________________________________________________________________ Public

    clear: function() {

        this.renderer.clear();
    },

    setFog: function( fogAmount ) {

        if( ! this.options.debugView && this.options.fog )
            this.scene.fog.fogAmount = fogAmount;
    },

	start: function() {

		window.addEventListener( 'resize', this.onWindowResizeListener, false );
		this.onWindowResize();
	},

	stop: function() {

		window.removeEventListener( 'resize', this.onWindowResizeListener, false );
	},

    update: function() {

        if( this.postprocessing.enabled ) {

            // Render scene into texture
            this.renderer.render( this.scene, this.camera, this.postprocessing.rtTexture1, true );
            this.renderManager.update();

            // Render quad with blured scene into texture (convolution pass 1)
            this.postprocessing.quad.materials[ 0 ] = this.postprocessing.materialConvolution;
            this.postprocessing.materialConvolution.uniforms.tDiffuse.texture = this.postprocessing.rtTexture1;
            this.postprocessing.materialConvolution.uniforms.uImageIncrement.value = this.postprocessing.blurx;
            this.renderer.render( this.postprocessing.scene, this.postprocessing.camera, this.postprocessing.rtTexture2, true );

            // Render quad with blured scene into texture (convolution pass 2)
            this.postprocessing.materialConvolution.uniforms.tDiffuse.texture = this.postprocessing.rtTexture2;
            this.postprocessing.materialConvolution.uniforms.uImageIncrement.value = this.postprocessing.blury;
            this.renderer.render( this.postprocessing.scene, this.postprocessing.camera, this.postprocessing.rtTexture3, true );

            // Render original scene with superimposed blur to texture
            this.postprocessing.quad.materials[ 0 ] = this.postprocessing.materialScreen;
            this.postprocessing.materialScreen.uniforms.tDiffuse.texture = this.postprocessing.rtTexture3;
            this.postprocessing.materialScreen.uniforms.opacity.value = 1.3;
            this.renderer.render( this.postprocessing.scene, this.postprocessing.camera, this.postprocessing.rtTexture1, false );

            // Render to screen
	        this.postprocessing.materialVignette.uniforms.tDiffuse.texture = this.postprocessing.rtTexture1;
            this.renderer.render( this.postprocessing.sceneScreen, this.postprocessing.camera );

	        // Render vox
	        this.renderer.render( this.sceneVox, this.camera );

        } else {

            this.renderer.render( this.scene, this.camera );
	        this.renderer.render( this.sceneVox, this.camera );
            this.renderManager.update();
        }
    },

    initPostprocessing: function() {

        this.postprocessing.scene = new THREE.Scene();
        this.postprocessing.sceneScreen = new THREE.Scene();

        this.postprocessing.camera = new THREE.Camera();
	    this.postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	    this.postprocessing.camera.position.z = 100;

        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
//	    var pars = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearMipMapLinearFilter, format: THREE.RGBFormat };

        this.postprocessing.rtTexture1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
        this.postprocessing.rtTexture2 = new THREE.WebGLRenderTarget( 512, 512, pars );
        this.postprocessing.rtTexture3 = new THREE.WebGLRenderTarget( 512, 512, pars );

        var screen_shader = THREE.ShaderUtils.lib["screen"];
        var screen_uniforms = THREE.UniformsUtils.clone( screen_shader.uniforms );

        screen_uniforms["tDiffuse"].texture = this.postprocessing.rtTexture1;
        screen_uniforms["opacity"].value = 1.0;

        this.postprocessing.materialScreen = new THREE.MeshShaderMaterial( {

            uniforms: screen_uniforms,
            vertexShader: screen_shader.vertexShader,
            fragmentShader: screen_shader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

		// Vignette
		var vignetteFragmentShader = [

			"varying vec2 vUv;",
			"uniform sampler2D tDiffuse;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec2 coords = (vUv - 0.5) * 2.0;",
				"float coordDot = dot (coords,coords);",
				"float mask = 1.0 - coordDot * 0.3;",
				"gl_FragColor = texel * mask;",
			"}"

		].join("\n");

	    this.postprocessing.materialVignette = new THREE.MeshShaderMaterial( {

	        uniforms: screen_uniforms,
	        vertexShader: screen_shader.vertexShader,
	        fragmentShader: vignetteFragmentShader,
		    blending: THREE.AdditiveBlending,
		    transparent: true
	    } );

		// Convolution
        var convolution_shader = THREE.ShaderUtils.lib["convolution"];
        var convolution_uniforms = THREE.UniformsUtils.clone( convolution_shader.uniforms );

        this.postprocessing.blurx = new THREE.Vector2( this.postprocessing.blurAmount, 0.0 ),
        this.postprocessing.blury = new THREE.Vector2( 0.0, this.postprocessing.blurAmount );

        convolution_uniforms["tDiffuse"].texture = this.postprocessing.rtTexture1;
        convolution_uniforms["uImageIncrement"].value = this.postprocessing.blurx;
        convolution_uniforms["cKernel"].value = THREE.ShaderUtils.buildKernel( 8 );

        this.postprocessing.materialConvolution = new THREE.MeshShaderMaterial( {

            uniforms: convolution_uniforms,
            vertexShader:   "#define KERNEL_SIZE 25.0\n" + convolution_shader.vertexShader,
            fragmentShader: "#define KERNEL_SIZE 25\n"   + convolution_shader.fragmentShader
        } );

        this.postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), this.postprocessing.materialConvolution );
	    this.postprocessing.quad.scale.x = window.innerWidth;
	    this.postprocessing.quad.scale.y = window.innerHeight;
        this.postprocessing.quad.position.z = -500;
        this.postprocessing.scene.addObject( this.postprocessing.quad );

        this.postprocessing.quadScreen = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), this.postprocessing.materialVignette );
	    this.postprocessing.quadScreen.scale.x = window.innerWidth;
	    this.postprocessing.quadScreen.scale.y = window.innerHeight;
        this.postprocessing.quadScreen.position.z = -500;
        this.postprocessing.sceneScreen.addObject( this.postprocessing.quadScreen );
    },

	onWindowResize: function() {

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		// Postprocessing
		this.postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
		this.postprocessing.quad.scale.x = window.innerWidth;
		this.postprocessing.quad.scale.y = window.innerHeight;
		this.postprocessing.quadScreen.scale.x = window.innerWidth;
		this.postprocessing.quadScreen.scale.y = window.innerHeight;

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		this.postprocessing.rtTexture1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
	}
};