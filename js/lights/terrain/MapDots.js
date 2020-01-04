/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 27/07/2011
 * Time: 11:32
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapDots = function( map ) {

	this.initialize( map );
};

LIGHTS.MapDots.prototype = {

//    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
	colors:         [ 0x808000, 0x008080, 0x800080, 0x800000, 0x008000, 0x000080 ],
//    colors:         [ 0xFF1561, 0x1a0209, 0x1a1002, 0xFF9D14 ],
	dotCount:       64,

	colorIndex:     0,
	drawCount:      0,
	dots:           [],
	dotMaterials:   [],
	addDot:         false,
	removeDot:      false,

	// _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

	    this.map = map;

	    // Dot texture
	    var r = LIGHTS.TerrainMap.size * 0.5,
	        i, dot, dotMaterial, texture;

		texture = new THREE.Texture( LIGHTS.images.dot );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearMipMapLinearFilter;
	    texture.needsUpdate = true;

	    // Plane
	    for( i = 0; i < this.dotCount; i++ ) {

	        dotMaterial = new THREE.MeshBasicMaterial( {
		        color:          0xFFFFFF,
		        map:            texture,
		        blending:       THREE.AdditiveBlending,
		        transparent:    true
	        } );

	        dot = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, LIGHTS.TerrainMap.size ), dotMaterial  );

	        this.dots.push( dot );
	        this.dotMaterials.push( dotMaterial );
	    }
	},

	// _______________________________________________________________________________________ Update

	drawDots: function( count ) {

	    this.drawCount = count;

	    var i, dot, scale, size, posMax;

	    for( i = 0; i < count; i++ ) {

	        scale = 0.05 + 0.15 * Math.random(),
	        size = LIGHTS.TerrainMap.size * scale,
	        posMax = this.map.viewRadius - size * 0.5;

	        dot = this.dots[ i ];
	        dot.position.x = Math.random() * 2 * posMax - posMax;
	        dot.position.y = Math.random() * 2 * posMax - posMax;
	        dot.scale.x = dot.scale.y = scale;

	        this.map.scene.addChild( dot );
	        this.dotMaterials[ i ].color.setHex( this.colors[ (this.colorIndex++) % this.colors.length ] );
	    }

		this.addDot = true;
		this.removeDot = false;
	},

	clear: function() {

		for( var i = 0; i < this.dotCount; i++ )
		    this.map.scene.removeChild( this.dots[ i ] );
	},

	update: function() {

	    if( this.addDot ) {

		    this.addDot = false;
	        this.removeDot = true;
	    }
	    else if( this.removeDot ) {

	        for( var i = 0; i < this.drawCount; i++ )
	            this.map.scene.removeChild( this.dots[ i ] );

	        this.removeDot = false;
	    }
	}
};