/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 15/08/2011
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */


LIGHTS.MaterialCache = function( director ) {

	this.initialize( director );
};

LIGHTS.MaterialCache.prototype = {

    // _______________________________________________________________________________________ Vars

    materials:      [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.container = new THREE.Object3D();
		this.container.position = director.player.targetPosition;
        director.view.scene.addChild( this.container );
    },

    addMaterial: function( material ) {

		var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0, 0 ), material );
		this.container.addChild( mesh );
    }
};