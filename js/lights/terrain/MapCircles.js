/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 01/09/2011
 * Time: 13:54
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapCircles = function( map ) {

	this.initialize( map );
};

LIGHTS.MapCircles.prototype = {

	circleCount:    64,

//    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
//    colors:         [ 0x808000, 0x008080, 0x800080, 0x800000, 0x008000, 0x000080 ],
//    colors:         [ 0x404000, 0x004040, 0x400040, 0x400000, 0x004000, 0x000040 ],
    colors:         [ 0x303000, 0x003030, 0x300030, 0x300000, 0x003000, 0x000030 ],

    circles:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;

        // Circle texture
        var mapSize = LIGHTS.TerrainMap.size,
            i, mesh, materials, material, texture, geometry;

		texture = new THREE.Texture( LIGHTS.images.circle );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearMipMapLinearFilter;
        texture.needsUpdate = true;

		// Materials
		materials = [];

		for( i = 0; i < this.colors.length; i++ ) {

			materials.push( new THREE.MeshBasicMaterial( {

				color:          this.colors[ i ],
				map:            texture,
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} ) );
		}

        // Planes
		geometry = new THREE.PlaneGeometry( mapSize, mapSize );

        for( i = 0; i < this.circleCount; i++ ) {

	        material = materials[ Math.floor( Math.random() * materials.length ) ];
            mesh = new THREE.Mesh( geometry, material );
            this.circles.push( new LIGHTS.MapCircle( mesh, material ) );
        }
    },

    // _______________________________________________________________________________________ Public

    launch: function() {

	    var circles = this.circles,
	        mapSize = LIGHTS.TerrainMap.size,
		    i, il, circle, size, posMax;

		for( i = 0, il = this.circleCount; i < il; i++ ) {

			size = 0.05 + 0.15 * Math.random();
            posMax = this.map.viewRadius - mapSize * size * 0.5;

            circle = this.circles[ i ];
			circle.size = size;
			circle.posMax = posMax;

			this.resetCircle( circle );

            this.map.scene.addChild( circle.mesh );
        }
    },

	clear: function() {

		var circles = this.circles,
			i, il;

	    for( i = 0, il = this.circleCount; i < il; i++ )
	        this.map.scene.removeChild( circles[ i ].mesh );
	},

    update: function() {

	    var circles = this.circles,
	        deltaTime = LIGHTS.deltaTime,
		    i, il;

        for( i = 0, il = this.circleCount; i < il; i++ ) {

	        circle = this.circles[ i ];

	        circle.life -= deltaTime;

	        if( circle.life < 0 )
	            this.resetCircle( circle );

	        circle.radius += deltaTime * circle.speed;
	        circle.scale.x = circle.scale.y = circle.radius * circle.size;
        }
    },

    // _______________________________________________________________________________________ Private

	resetCircle: function( circle ) {

		var posMax = circle.posMax;

		circle.life = Math.random() * 4 + 4;
		circle.position.x = Math.random() * 2 * posMax - posMax;
		circle.position.y = Math.random() * 2 * posMax - posMax;
		circle.radius = 0.001;
		circle.scale.x = circle.scale.y = circle.radius * circle.size;
		circle.speed = Math.random() * 0.15 + 0.15;
	}
};

LIGHTS.MapCircle = function( mesh ) {

	this.mesh = mesh;
	this.position = mesh.position;
	this.scale = mesh.scale;

	this.life =
	this.size =
	this.posMax =
	this.radius =
	this.speed = 0;
};