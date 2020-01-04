/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 23/07/2011
 * Time: 13:27
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Skybox = function( director ) {

	this.initialize( director );
};

LIGHTS.Skybox.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.view = director.view;
        this.cameraPosition = director.player.camera.position;

        var geometry, material, texture;

		// Geometry
        geometry = new LIGHTS.CapsuleGeometry( 1280, 1280, 640, 16, [ 0, 1 ], true, 640, 8, false );
		THREE.MeshUtils.translateVertices( geometry, 0, -640, 0 );
		THREE.MeshUtils.transformUVs( geometry, 0, 1, 1, -1 );

		// Texture
		texture = new THREE.Texture( LIGHTS.images.skybox );
		texture.needsUpdate = true;
		texture.repeat.x = 4;
		texture.wrapS = THREE.RepeatWrapping;
//        texture.magFilter = THREE.LinearMipMapLinearFilter;
//        texture.minFilter = THREE.LinearMipMapLinearFilter;

		// Material
        material = new THREE.MeshBasicMaterial( {

//	        wireframe: true,
            map: texture,
            color: 0xFF0000
//            color: 0x808080
//            color: 0x000000
        } );

		this.color = material.color;

		// Mesh
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.flipSided = true;

        this.view.renderer.initMaterial( material, {}, null, null );

		if( ! LIGHTS.View.prototype.options.debugView )
            this.view.scene.addChild( this.mesh );
	},

    update: function() {

        this.mesh.position.copy( this.cameraPosition );

//	    var colorPhase = (Math.sin( LIGHTS.time * rad360 * 0.5 ) + 1) * 0.5;

	    var colorPhase = (LIGHTS.time * 0.3) % 2;

	    if( colorPhase > 1 )
	        colorPhase = 1 - (colorPhase - 1);

	    this.color.setHSV( 0.6 + colorPhase * 0.35, 1, 1 );
//	    this.color.r *= 2;
//	    this.color.g *= 2;
//	    this.color.b *= 2;
    }
};
