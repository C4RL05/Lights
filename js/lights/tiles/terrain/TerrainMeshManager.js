/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 13:45
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainMeshManager = function( director ) {

	this.initialize( director );
};

LIGHTS.TerrainMeshManager.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

	colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],

    beats:          0,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

		this.director = director;

        this.geometry = director.terrain.terrainPlane;

        this.terrainMap = new LIGHTS.TerrainMap( director.view.renderer );
		this.terrainMap.texture.wrapS = this.terrainMap.texture.wrapT = THREE.RepeatWrapping;

//		var texture = new THREE.Texture( LIGHTS.images.lines );
//		texture.needsUpdate = true;


//		texture = new THREE.Texture( LIGHTS.images.candy );
//		texture.needsUpdate = true;
//		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//		texture.repeat.x = texture.repeat.y = 4;


//        texture.magFilter = THREE.LinearMipMapLinearFilter;
//        texture.minFilter = THREE.LinearMipMapLinearFilter;

		var envMap = new THREE.Texture( [

			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapTop,
			LIGHTS.images.envMapBottom,
			LIGHTS.images.envMapFrontBack,
			LIGHTS.images.envMapFrontBack
		] );

		envMap.needsUpdate = true;

		this.material = new THREE.MeshBasicMaterial( {
			color: 0x000000,
			map: this.terrainMap.texture,
//			map: texture,
			envMap: envMap,
			reflectivity: 1,
			combine: THREE.MultiplyOperation,
			shading: THREE.SmoothShading
		} );

		director.materialCache.addMaterial( this.material );

        this.mapDots = new LIGHTS.MapDots( this.terrainMap );
        this.mapLines = new LIGHTS.MapLines( this.terrainMap );
        this.mapCircles = new LIGHTS.MapCircles( this.terrainMap );
        this.mapGlows = new LIGHTS.MapGlows( this.terrainMap );
//        this.mapAvatars = new LIGHTS.MapAvatars( this.terrainMap );
	},

    // _______________________________________________________________________________________ Public

    launch: function() {

        switch( LIGHTS.Music.phase.index ) {

	        case 0:
				break;

            case 1:
	            this.mapGlows.launch( this.director.tileManager.balls );
	            this.material.color.setHex( 0xFFFFFF );
                this.material.reflectivity = 0;
	            this.terrainMap.clear();
	            this.terrainMap.update();
	            break;

	        case 2:
		        this.material.reflectivity = 0.2;
		        break;

	        case 3:
		        break;

            case 7:
		        this.material.reflectivity = 0;
	            this.material.color.setHex( 0xFFFFFF );
	            break;

            case 8:
		        this.material.reflectivity = 0.15;
	            break;

	        case 11:
	        case 21:
		        this.material.reflectivity = 0.2;
		        this.mapGlows.update();
				break;

	        case 13:
				this.mapLines.clear();
//	            this.terrainMap.opacity = 0.97;
//	            this.terrainMap.subtract = 0.005;
//		        this.material.reflectivity = 0.2;
//		        this.material.color.setHex( 0x000000 );
		        break;

	        case 14:
		        this.dotCount = 1;
	            break;

	        case 15:
//		        this.mapDots.drawDots( 64 );
//		        this.mapDots.update();
//		        this.terrainMap.update();

		        this.terrainMap.clear( 0x808080 );
//		        this.material.color.setHex( 0xFFFFFF );
//		        this.material.reflectivity = 0.8;
		        this.material.reflectivity = 0.3;
//
//		        this.mapLines.clear();
//
//		        for( var i = 0; i < 9; i++ )
//		            this.mapAvatars.drawAvatar( i );
//
//		        this.terrainMap.post = false;
//		        this.terrainMap.clear();
//		        this.terrainMap.update();
		        break;

	        case 16:
		        this.material.reflectivity = 0;
                this.material.color.setHex( 0x000000 );
//		        this.mapAvatars.clear();
		        this.terrainMap.post = true;
                this.terrainMap.clear();
                this.terrainMap.update();
                break;

            case 17:
	            this.material.reflectivity = 0.3;
	            this.material.color.setHex( 0xFFFFFF );
	            this.mapDots.clear();
	            this.mapCircles.launch();
	            this.terrainMap.update();
//	            this.terrainMap.opacity = 0.98;
//	            this.terrainMap.subtract = 0.005;
//		        this.mapDots.drawDots( 64 );
                break;

	        case 22: // A2
		        this.material.reflectivity = 0;
		        this.mapCircles.clear();

//		        this.material.color.setHex( 0x000000 );
//		        this.terrainMap.clear();
//		        this.terrainMap.update();
	            break;
        }
    },

    beat: function() {

        switch( LIGHTS.Music.phase.index ) {

			case 7:
				this.mapLines.drawLines( 4 );
				break;

			case 8:
				this.mapLines.drawLines( 8 );
				break;

			case 9:
				this.mapLines.drawLines( 16 );
				break;

			case 10:
				this.mapLines.drawLines( 24 );
				break;

			case 11:
			case 12:
//				this.mapLines.rotLines();
				this.mapLines.drawLines( 8 );
				break;

	        case 13:
		        break;

	        case 14:
		        this.mapDots.drawDots( this.dotCount );

		        if( this.beats % 8 == 0 && this.dotCount < 24 )
		            this.dotCount++;
		        break;

	        case 15:
		        this.mapDots.drawDots( this.dotCount );

		        if( this.dotCount < 16 )
		            this.dotCount += 2;

/*
		        if( this.beats % 2 == 0 ) {
			        this.mapColor.setColor( this.colors[ this.beats % this.colors.length ] );
			        this.material.color.setHex( 0xFFFFFF );
			        this.material.reflectivity = 0.8;
		        }
		        else {

			        this.material.color.setHex( 0x000000 );
			        this.material.reflectivity = 0.8;
//			        this.material.reflectivity = 0.8;
		        }
*/
		        break;

			case 17:
	        case 18:
	        case 19:
	        case 20:
	        case 21:
//				this.mapCircles.drawCircles( 32 );
//				this.mapDots.drawDots( 16 );
//				this.mapLines.drawLines( 16 );
				break;
		}

		this.beats++;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

        switch( LIGHTS.Music.phase.index ) {
// REVIEW GLOWS
	        case 1:
	        case 2:
	        case 3:
	        case 4:
	        case 5:
	        case 6:
		        this.mapGlows.update();
		        this.terrainMap.update();
		        break;

            case 7:
	        case 8:
	        case 9:
	        case 10:
		        this.mapLines.update();
				this.mapGlows.update();
		        this.terrainMap.update();
		        break;

		    case 11:
		    case 12:
		    case 16:
                this.mapLines.update();
                this.terrainMap.update();
                break;

	        case 13:
		        this.terrainMap.update();
		        this.material.reflectivity -= this.material.reflectivity * LIGHTS.deltaTime;
		        break;

	        case 14:
	        case 15:
		        this.mapDots.update();
		        this.terrainMap.update();
		        break;

	        case 17:
	        case 18:
	        case 19:
	        case 20:
		        this.mapGlows.update();
                this.mapCircles.update();
                this.terrainMap.update();
                break;

	        case 21:
                this.mapCircles.update();
                this.terrainMap.update();
                break;

	        case 22:
                this.terrainMap.update();
                break;
        }
    },

	animateUVs: function() {

		var uvs = this.geometry.uvGrid;

		for( var i = 0; i < uvs.length; i++ ) {

			var dv = (Math.random() - 0.5) * 0.005;

			for( var j = 0; j < uvs[ i ].length; j++ ) {

				uvs[ j ][ i ].v += dv;
			}

		}

		this.geometry.__dirtyUvs = true;
	}
};

// ___________________________________________________________________________________________ Tile

LIGHTS.TerrainMeshTile = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainMeshTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

        this.manager = manager;

        this.children = [];

        var mesh = new THREE.Mesh( manager.geometry, manager.material );
		mesh.dynamic = true;
        this.children.push( mesh );
	},

    // _______________________________________________________________________________________ Update

    update: function() {

    }
};