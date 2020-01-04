/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 15/08/2011
 * Time: 09:21
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.CannonManager = function( director ) {

	this.initialize( director );
};

LIGHTS.CannonManager.prototype = {

    // _______________________________________________________________________________________ Vars

    countPerTile:           8,
	cannonRadius:           8,

	spotColors:             [ 0xFF4040,
							  0x40FF40,
							  0x4040FF,
							  0xFFFF40,
							  0x40FFFF,
							  0xFF40FF ],

    active:                 false,

    tiles:                  [],
	cannons:                [],
	spots:                  [],
	positions:              [],
	normals:                [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		var terrain = director.terrain,
			cannonColor = new THREE.Color( 0x000000 ),
			whiteColor = new THREE.Color( 0xFFFFFF ),
			i, il, faces, material;

		// Geometry
		this.cannonGeometry = new LIGHTS.CapsuleGeometry( this.cannonRadius, this.cannonRadius, this.cannonRadius, 16, [ 0, 1 ], true, this.cannonRadius, 3, true, this.cannonRadius, 4 );
		faces = this.cannonGeometry.faces;

		for( i = 0, il = faces.length; i < il; i++ )
			faces[ i ].color = cannonColor;

		for( i = 16 * 3, il = 16 * 4; i < il; i++ )
			faces[ i ].color = whiteColor;

		// Materials
		var envMap = new THREE.Texture( [

			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapTop,
			LIGHTS.images.envMapBottom,
			LIGHTS.images.envMapFrontBack,
			LIGHTS.images.envMapFrontBack
		] );

		envMap.needsUpdate = true;

		this.cannonMaterial = new THREE.MeshBasicMaterial( {

			color:          0xFFFFFF,
			vertexColors:   THREE.FaceColors,
			envMap:         envMap,
			reflectivity:   0.4,
			combine:        THREE.MultiplyOperation,
			shading:        THREE.SmoothShading
		} );

		director.materialCache.addMaterial( this.cannonMaterial );

		// Spot
		this.spotGeometry = new LIGHTS.SpotGeometry( this.cannonRadius * 1.5, this.cannonRadius * 3, 192 );
//		THREE.MeshUtils.createVertexColorGradient( this.spotGeometry, [ 0xFFFFFF, 0x000000 ] );
		this.moveVertexY( this.spotGeometry.vertices, this.cannonRadius );

		this.spotMaterials = [];

		var texture = new THREE.Texture( LIGHTS.images.spot );
		texture.needsUpdate = true;

		for( i = 0, il = this.spotColors.length; i < il; i++ ) {

			material = new THREE.MeshBasicMaterial( {

//				wireframe:      true,
				map:            texture,
				color:          this.spotColors[ i ],
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} );

			this.spotMaterials.push( material );
			director.materialCache.addMaterial( material );
		}

 		// Cannon positions
		terrain.selectCenterTile();

		for( i = 0, il = this.countPerTile; i < il; i++ ) {

			terrain.selectTerrainRandomVertex( true, 3 );
			this.positions.push( terrain.randomVertex.position );
			this.normals.push( terrain.randomNormal );
		}
	},

    // _______________________________________________________________________________________ Events

    launch: function() {

	    var geo = this.geometries;

        switch( LIGHTS.Music.phase.index ) {

	        case 17: // C3
				this.resetSpotMaterials();
		        this.cannonMaterial.color.setHex( 0xFFFFFF );
		        this.cannonMaterial.reflectivity = 0.4;
		        this.rotationActive = false;
                break;

	        case 19: // D2
		        this.rotationActive = true;
		        this.rotationTime = 0;
                break;

	        case 22: // A2
		        this.cannonMaterial.reflectivity = 0;
	            break;
        }
    },

	resetSpotMaterials: function() {

		var materials = this.spotMaterials,
			colors = this.spotColors,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].color.setHex( colors[ i ] );
	},

	fadeMaterials: function() {

		var materials = this.spotMaterials,
			dark = 1 - LIGHTS.deltaTime * 8,
			i, il, color;

		for( i = 0, il = materials.length; i < il; i++ ) {

			color = materials[ i ].color;
			color.r *= dark;
			color.g *= dark;
			color.b *= dark;
		}

		color = this.cannonMaterial.color;
		color.r *= dark;
		color.g *= dark;
		color.b *= dark;
	},

	// _______________________________________________________________________________________ Update

	update: function() {

		if( this.rotationActive ) {

			this.rotationTime += LIGHTS.deltaTime;

			var tiles = this.tiles,
				il = tiles.length,
				i;

			for( i = 0; i < il; i++ )
				tiles[ i ].update();

			if( LIGHTS.time >= 208 )
				this.fadeMaterials();
		}
	},

	// _______________________________________________________________________________________ Private

	moveVertexY: function( vertices, dy ) {

		for( var v = 0; v < vertices.length; v++ )
			vertices[ v ].position.y += dy;
	}
};

// ___________________________________________________________________________________________ Tile

LIGHTS.CannonsTile = function( manager ) {

	this.initialize( manager );
};

LIGHTS.CannonsTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

        this.manager = manager;
//		this.containerPosition = container.position;

        this.children = [];
        this.cannons = [];
        this.spots = [];
		this.groups = [ [], [] ];

        var i, j, child, mesh, visible, groupIndex, rotX, leftRight;

        for( i = 0; i < manager.countPerTile; i++ ) {

	        leftRight = (Math.random() > 0.5);
	        rotX = leftRight? rad45 : -rad45;
	        mesh = new THREE.Mesh( manager.cannonGeometry, manager.cannonMaterial );
	        mesh.position = manager.positions[ i ];
	        mesh.rotation.x = rotX;
	        this.children.push( mesh );
	        this.cannons.push( mesh );
	        manager.cannons.push( mesh );

	        mesh.offset = leftRight? rad90 : -rad90;
	        mesh.freq = Math.random() + 0.5;
	        mesh.rotX = rotX;

	        mesh = new THREE.Mesh( manager.spotGeometry, manager.spotMaterials[ Math.floor( Math.random() * manager.spotMaterials.length ) ] );
	        mesh.doubleSided = true;
	        mesh.position = manager.positions[ i ];
	        mesh.rotation.x = rotX;
	        this.children.push( mesh );
	        this.spots.push( mesh );
	        manager.spots.push( mesh );
        }

        manager.tiles.push( this );
    },

    // _______________________________________________________________________________________ Update

    update: function() {

	    var cannons = this.cannons,
		    spots = this.spots,
		    rotationTime = this.manager.rotationTime,
		    rotX, i, il, cannon;

		for( i = 0, il = cannons.length; i < il; i++ ) {

			cannon = cannons[ i ];
			rotX = Math.sin( cannon.offset + rotationTime * cannon.freq ) * rad45;

			cannon.rotation.x = rotX;
			spots[ i ].rotation.x = rotX;
		}
    }
};
