/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 26/07/2011
 * Time: 14:14
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainMap = function( renderer ) {

	this.initialize( renderer );
};

LIGHTS.TerrainMap.size = 512;
LIGHTS.TerrainMap.uvOffset = 0.2;

LIGHTS.TerrainMap.prototype = {

	post:       true,
    opacity:    0.98,
    subtract:   0.005,

    // _______________________________________________________________________________________ Constructor

	initialize: function( renderer ) {

        this.renderer = renderer;

        var size = LIGHTS.TerrainMap.size,
	        sizeHalf = size / 2,
            postSize = size * (1 + 2 * LIGHTS.TerrainMap.uvOffset),
            postSizeHalf = postSize * 0.5,
            postTextureParams = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat },
            textureParams = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearMipMapLinearFilter, format: THREE.RGBFormat },
            screenShader, screenUniforms, screenFragmentShader, texturedUniforms, texturedFragmentShader, combinedUniforms, combinedMaterial, texturedQuad, planeGeometry;

        this.offset = size * LIGHTS.TerrainMap.uvOffset;
        this.viewRadius = postSizeHalf;

        this.camera = new THREE.Camera();
        this.camera.projectionMatrix = THREE.Matrix4.makeOrtho( -postSizeHalf, postSizeHalf, postSizeHalf, -postSizeHalf, -10000, 10000 ),
        this.camera.position.z = 100;

		this.scene = new THREE.Scene();
        this.postTexture = new THREE.WebGLRenderTarget( postSize, postSize, postTextureParams );

        // Postprocessing
        this.postCamera = new THREE.Camera();
        this.postCamera.projectionMatrix = THREE.Matrix4.makeOrtho( -sizeHalf, sizeHalf, sizeHalf, -sizeHalf, -10000, 10000 ),
        this.postCamera.position.z = 100;

        this.postScene = new THREE.Scene();
        this.glowScene = new THREE.Scene();

		// Textures
        this.texture = new THREE.WebGLRenderTarget( size, size, textureParams );
		this.combinedTexture = new THREE.WebGLRenderTarget( size, size, postTextureParams );
        this.canvasTexture = new THREE.WebGLRenderTarget( size, size, postTextureParams );

        // Screen Material
        screenShader = THREE.ShaderUtils.lib["screen"];
		screenUniforms = { tDiffuse: { type: "t", value: 0, texture: this.postTexture }	};

		screenFragmentShader = [

			"varying vec2 vUv;",
			"uniform sampler2D tDiffuse;",

			"void main() {",

				"gl_FragColor = texture2D( tDiffuse, vUv );",
			"}"

		].join("\n");

        this.screenMaterial = new THREE.MeshShaderMaterial( {

            uniforms: screenUniforms,
            vertexShader: screenShader.vertexShader,
            fragmentShader: screenFragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        // Textured Material
        texturedUniforms = {

            tDiffuse:   { type: "t", value: 0, texture: this.canvasTexture },
            opacity:    { type: "f", value: this.opacity },
            subtract:   { type: "f", value: this.subtract }
        };

        texturedFragmentShader = [

            "varying vec2 vUv;",
            "uniform sampler2D tDiffuse;",
            "uniform float opacity;",
            "uniform float subtract;",

            "void main() {",

                "vec4 texel = texture2D( tDiffuse, vUv );",
                "texel.r = min( texel.r - subtract, texel.r * opacity );",
                "texel.g = min( texel.g - subtract, texel.g * opacity );",
                "texel.b = min( texel.b - subtract, texel.b * opacity );",
                "gl_FragColor = texel;",
            "}"

        ].join("\n");

        this.texturedMaterial = new THREE.MeshShaderMaterial( {

            uniforms: texturedUniforms,
            vertexShader: screenShader.vertexShader,
            fragmentShader: texturedFragmentShader
        } );

		// Combined Material
        combinedUniforms = THREE.UniformsUtils.clone( screenUniforms );
        combinedUniforms["tDiffuse"].texture = this.combinedTexture;

		combinedMaterial = new THREE.MeshShaderMaterial( {

		    uniforms: combinedUniforms,
		    vertexShader: screenShader.vertexShader,
		    fragmentShader: screenFragmentShader
		} );

		// Quads
		planeGeometry = new THREE.PlaneGeometry( size, size );
        texturedQuad = new THREE.Mesh( planeGeometry, this.texturedMaterial );
        texturedQuad.position.z = -10;
        this.postScene.addObject( texturedQuad );

        // Tiled quads
        this.setupTiledQuad();

        // Combined
        this.combinedScene = new THREE.Scene();

		// Combined Quad
        this.combinedQuad = new THREE.Mesh( planeGeometry, combinedMaterial );
		this.combinedScene.addObject( this.combinedQuad );

		var canvasQuad = new THREE.Mesh( new THREE.PlaneGeometry( postSize, postSize ), new THREE.MeshBasicMaterial( { map: this.canvasTexture } ) );
		canvasQuad.z = -10;
		this.glowScene.addObject( canvasQuad );

		// Combined Black
		this.combinedColor = new THREE.Mesh( planeGeometry, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
		this.combinedColor.position.z = 10;
		this.combinedColor.visible = false;
		this.combinedScene.addObject( this.combinedColor );

        // Test
//        this.tests = [];
//        var colors = [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ];
//
//        for( var i = 0; i < colors.length; i++ ) {
//
//            var test = new THREE.Mesh( new THREE.SphereGeometry( 300, 10, 10 ), new THREE.MeshBasicMaterial( {wireframe: true, color: colors[ i ] } ) );
//            test.position.x = Math.random() * 200 - 100;
//            test.position.y = Math.random() * 200 - 100;
//            test.speed = 0.005 * Math.random();
//            this.scene.addChild( test );
//            this.tests.push( test );
//        }
    },

    // _______________________________________________________________________________________ Setup

	setupTiledQuad: function() {

		var s = LIGHTS.TerrainMap.size,
			v1 = s / 2,
			u0 = LIGHTS.TerrainMap.uvOffset,
			u1 = 1 - LIGHTS.TerrainMap.uvOffset,
			v0 = (0.5 - LIGHTS.TerrainMap.uvOffset) * v1,
			quad, combined;

		// Center
		combined = new THREE.PlaneGeometry( s, s );
		this.setQuadUVs( combined, u0, u0, u0, u1, u1, u1, u1, u0 );

		// Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, v1, v0, -v1, v1, -v1, v1, v1 );
		this.setQuadUVs( quad, 0, u0, 0, u1, u0, u1, u0, u0 );
		GeometryUtils.merge( combined, quad );

		// Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, -v1, -v0, -v1, -v0, v1 );
		this.setQuadUVs( quad, u1, u0, u1, u1, 1, u1, 1, u0 );
		GeometryUtils.merge( combined, quad );

		// Top
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, v0, v1, v0, v1, v1 );
		this.setQuadUVs( quad, u0, u1, u0, 1, u1, 1, u1, u1 );
		GeometryUtils.merge( combined, quad );

		// Bottom
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, -v0, -v1, -v1, v1, -v1, v1, -v0 );
		this.setQuadUVs( quad, u0, 0, u0, u0, u1, u0, u1, 0 );
		GeometryUtils.merge( combined, quad );

		// Top Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, v1, v0, v0, v1, v0, v1, v1 );
		this.setQuadUVs( quad, 0, u1, 0, 1, u0, 1, u0, u1 );
		GeometryUtils.merge( combined, quad );

		// Top Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, v0, -v0, v0, -v0, v1 );
		this.setQuadUVs( quad, u1, u1, u1, 1, 1, 1, 1, u1 );
		GeometryUtils.merge( combined, quad );

		// Bottom Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, -v0, v0, -v1, v1, -v1, v1, -v0 );
		this.setQuadUVs( quad, 0, 0, 0, u0, u0, u0, u0, 0 );
		GeometryUtils.merge( combined, quad );

		// Bottom Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, -v0, -v1, -v1, -v0, -v1, -v0, -v0 );
		this.setQuadUVs( quad, u1, 0, u1, u0, 1, u0, 1, 0 );
		GeometryUtils.merge( combined, quad );

		// Add to scene
        this.postScene.addObject( new THREE.Mesh( combined, this.screenMaterial ) );
	},
/*
    setupTiledQuads: function() {

        var v1 = LIGHTS.TerrainMap.size / 2,
            u0 = LIGHTS.TerrainMap.uvOffset,
            u1 = 1 - LIGHTS.TerrainMap.uvOffset,
            v0 = (0.5 - LIGHTS.TerrainMap.uvOffset) * v1,
            quad;

        // Center
        quad = this.createQuad();
        this.setQuadUVs( quad, u0, u0, u0, u1, u1, u1, u1, u0 );

        // Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, v1, v0, -v1, v1, -v1, v1, v1 );
        this.setQuadUVs( quad, 0, u0, 0, u1, u0, u1, u0, u0 );

        // Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, -v1, -v0, -v1, -v0, v1 );
        this.setQuadUVs( quad, u1, u0, u1, u1, 1, u1, 1, u0 );

        // Top
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, v0, v1, v0, v1, v1 );
        this.setQuadUVs( quad, u0, u1, u0, 1, u1, 1, u1, u1 );

        // Bottom
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, -v0, -v1, -v1, v1, -v1, v1, -v0 );
        this.setQuadUVs( quad, u0, 0, u0, u0, u1, u0, u1, 0 );

        // Top Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, v1, v0, v0, v1, v0, v1, v1 );
        this.setQuadUVs( quad, 0, u1, 0, 1, u0, 1, u0, u1 );

        // Top Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, v0, -v0, v0, -v0, v1 );
        this.setQuadUVs( quad, u1, u1, u1, 1, 1, 1, 1, u1 );

        // Bottom Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, -v0, v0, -v1, v1, -v1, v1, -v0 );
        this.setQuadUVs( quad, 0, 0, 0, u0, u0, u0, u0, 0 );

        // Bottom Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, -v0, -v1, -v1, -v0, -v1, -v0, -v0 );
        this.setQuadUVs( quad, u1, 0, u1, u0, 1, u0, 1, 0 );
    },

    createQuad: function() {

        var screenQuad = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, LIGHTS.TerrainMap.size ), this.screenMaterial );
        this.postScene.addObject( screenQuad );

        return screenQuad;
    },
*/
    setQuadVertices: function( quad, x0, y0, x1, y1, x2, y2, x3, y3 ) {

        var geo = (quad instanceof THREE.Mesh)? quad.geometry : quad;
	        vertices = geo.vertices,
            face = geo.faces[0],
            a = vertices[ face.a ].position,
            b = vertices[ face.b ].position,
            c = vertices[ face.c ].position,
            d = vertices[ face.d ].position;

        a.x = x0;
        a.y = y0;
        b.x = x1;
        b.y = y1;
        c.x = x2;
        c.y = y2;
        d.x = x3;
        d.y = y3;
    },

    setQuadUVs: function( quad, u0, v0, u1, v1, u2, v2, u3, v3 ) {

	    var geo = (quad instanceof THREE.Mesh)? quad.geometry : quad;
		    uvs = geo.faceVertexUvs[ 0 ][ 0 ];

        uvs[ 0 ].u = u0;
        uvs[ 0 ].v = v0;
        uvs[ 1 ].u = u1;
        uvs[ 1 ].v = v1;
        uvs[ 2 ].u = u2;
        uvs[ 2 ].v = v2;
        uvs[ 3 ].u = u3;
        uvs[ 3 ].v = v3;
    },

   // _______________________________________________________________________________________ Update

    update: function() {

	    if( this.post ) {

	        // Render scene
	        this.renderer.render( this.scene, this.camera, this.postTexture, true );

			// Postprocessing
	        this.texturedMaterial.uniforms.opacity.value = this.opacity;
	        this.texturedMaterial.uniforms.subtract.value = this.subtract;
			this.renderer.render( this.postScene, this.postCamera, this.combinedTexture, true );

			// Render canvas
			this.renderer.render( this.combinedScene, this.postCamera, this.canvasTexture, true );

			// Render glows
		    this.renderer.render( this.glowScene, this.camera, this.texture, true );
	    }
	    else {

	        // Render scene
		    this.renderer.render( this.scene, this.camera, this.texture, true );
	    }
    },

    clear: function( color ) {

	    if( color === undefined ) color = 0x000000;

	    this.combinedColor.materials[ 0 ].color.setHex( color );
	    this.combinedColor.visible = true;
	    this.combinedQuad.visible = false;

        this.renderer.render( this.combinedScene, this.postCamera, this.canvasTexture, true );

	    this.combinedColor.visible = false;
	    this.combinedQuad.visible = true;
    }
};
