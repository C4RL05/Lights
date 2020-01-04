/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 17/07/2011
 * Time: 10:59
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Terrain = function( director ) {

	this.initialize( director );
};

LIGHTS.Terrain.prototype = {

    mapResolution:          66,//32,
    tileSize:               480, //320,//640,
    gridSize:               5,
    height:                 140, // 256,

    selectedTile:           null,
    randomVertexIndex:      null,
    randomVertexPosition:   new THREE.Vector3(),
    randomPosition:         new THREE.Vector3(),
    randomNormal:           new THREE.Vector3(),
	randomX:                null,
	randomY:                null,

    tiles:                  [],
    tileIdSet:              {},
	usedVertices:           [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

        this.scene = director.view.scene;
        this.player = director.player;
        this.camera = this.player.camera;
        this.gridRadius = Math.floor( this.gridSize / 2 );

        // Create tiles
        var x, y, tile;

        for( x = 0; x < this.gridSize; x++ ) {

            this.tiles[ x ] = [];

            for( y = 0; y < this.gridSize; y++ ) {

                tile = new THREE.Object3D();
                tile.visible = false;
                tile.justOn = tile.justOff = tile.justMoved = false;
                this.tiles[ x ][ y ] = tile;
            }
        }

        // TerrainPlane
        this.terrainPlane = new LIGHTS.TerrainPlane( this.tileSize, this.mapResolution, this.height, LIGHTS.images[ 'terrain' + this.mapResolution ] );
		this.displacement = new LIGHTS.TerrainDisplacement( this );

		// usedVertices
		for( x = 0; x <= this.terrainPlane.resolution; x++ ) {

			this.usedVertices[ x ] = [];

			for( y = 0; y <= this.terrainPlane.resolution; y++ )
				this.usedVertices[ x ][ y ] = false;
		}
	},

    // _______________________________________________________________________________________ Update

    update: function() {

        // Tiles
        var cameraX = this.camera.position.x,
            cameraY = this.camera.position.z,
            sin = Math.sin( this.player.angle ),
            cos = Math.cos( this.player.angle ),
            x, y, r, angle, deltaX, deltaY, tile, tileX, tileY, tileId, tileVisible;

        this.cameraTileX = (Math.round( cameraX / this.tileSize ) - this.gridRadius) * this.tileSize;
        this.cameraTileY = (Math.round( cameraY / this.tileSize ) - this.gridRadius) * this.tileSize;

        // Clear idTableSet
        for( tileId in this.tileIdSet )
            delete this.tileIdSet[ tileId ];

        // Update grid
        for( x = 0; x < this.gridSize; x++ ) {

            for( y = 0; y < this.gridSize; y++ ) {

                tileX = this.cameraTileX + this.tileSize * x;
                tileY = this.cameraTileY + this.tileSize * y;
                deltaX = (tileX - cameraX);
                deltaY = (tileY - cameraY);
                angle = Math.atan2( deltaX, deltaY );

                r = Math.floor( Math.max( Math.abs( x - this.gridRadius ), Math.abs( y - this.gridRadius ) ) );

                // Visible?
                /*
                    // sin (s – t) = sin s cos t – cos s sin t
                    cos (s – t) = cos s cos t + sin s sin t
                 */
                if( r > 1 )
                    tileVisible = (cos * Math.cos( angle ) + sin * Math.sin( angle )) < -0.5; // Far cull angle delta cos
                else if( r == 1 )
                    tileVisible = (cos * Math.cos( angle ) + sin * Math.sin( angle )) < 0.5; // Near cull angle delta cos
                else
                    tileVisible = true;

                // Update tile
                tile = this.tiles[ x ][ y ];

                if( tileVisible ) {

                    tile.justOff = false;
                    tile.justOn = ! tile.visible;

                    if( tile.justOn ) {

                        this.scene.addChild( tile );
                        tile.visible = true;
                    }

                    tileId = tileX + "/" + tileY;
                    this.tileIdSet[ tileId ] = true;
                    tile.justMoved = (tile.tileId != tileId);

                    if( tile.justMoved ) {

                        tile.position.x = tileX;
                        tile.position.z = tileY;
                        tile.tileId = tileId;
                    }
                }
                else {

                    tile.justOff = tile.visible;
                    tile.justOn = false;

                    if( tile.justOff ) {

                        this.scene.removeChild( tile );
                        tile.visible = false;
                    }
                }
            }
        }

	    // Displacement
	    if( this.displacement.active )
	        this.displacement.update();
    },

    // _______________________________________________________________________________________ Public

    isVisible: function( posX, posY ) {

        var posTileX = (Math.round( posX / this.tileSize ) - this.gridRadius) * this.tileSize,
            posTileY = (Math.round( posY / this.tileSize ) - this.gridRadius) * this.tileSize,
            x = (posTileX - this.cameraTileX) / this.tileSize + this.gridRadius,
            y = (posTileY - this.cameraTileY) / this.tileSize + this.gridRadius;

        if( isNaN( x ) || isNaN( y ) || x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize )
            return false;
        else
            return this.tiles[ x ][ y ].visible;
    },

	reset: function() {

		var x, y;

		for( x = 0; x <= this.terrainPlane.resolution; x++ )
			for( y = 0; y <= this.terrainPlane.resolution; y++ )
				this.usedVertices[ x ][ y ] = false;

		this.terrainPlane.resetVertices();
	},

    // _______________________________________________________________________________________ Select

    selectTile: function( x, y ) {

        this.selectedTile = this.tiles[ x ][ y ];
    },

    selectTileById: function( tileId ) {

        var x, y, tilesX;

        for( x = 0; x < this.gridSize; x++ ) {

            tilesX = this.tiles[ x ];

            for( y = 0; y < this.gridSize; y++ ) {

                if( tilesX[ y ].tileId == tileId ) {

                    this.selectedTile = tilesX[ y ];
                    return true;
                }
            }
        }

        return false;
    },

    selectCenterTile: function() {

        this.selectedTile = this.tiles[ this.gridRadius ][ this.gridRadius ];
    },

    selectRandomTile: function( radius ) {

        this.selectRandomTileAtRadius( Math.floor( Math.random() * this.gridRadius ) );
    },

    selectRandomTileAtRadius: function( radius ) {

        var tries = 100,
	        x, y, t;

        do {
            x = this.gridRadius + radius * ((Math.random() > 0.5)? 1 : -1);
            y = this.gridRadius - radius + Math.floor( Math.random() * radius * 2 );

            // Swap X/Y
            if( Math.random() > 0.5 ) {

                t = x;
                x = y;
                y = t;
            }

            this.selectedTile = this.tiles[ x ][ y ];

        } while( --tries > 0 && ! this.selectedTile.visible );

		if( tries == 0 ) {

			console.log( this.selectedTile.visible, x, y, radius );
			console.error( "ERROR: Terrain.selectRandomTileAtRadius: Not found" );
		}
    },

    selectTerrainRandomVertex: function( empty, radius, border ) {

	    this.selectTerrainRandomCoords( empty, radius, border );

	    if( empty )
			this.usedVertices[ this.randomX ][ this.randomY ] = true;

        this.randomVertexIndex = this.terrainPlane.indexGrid[ this.randomX ][ this.randomY ];
//        this.randomVertexIndex = Math.floor( Math.random() * this.terrainPlane.vertices.length );
	    this.randomVertex = this.terrainPlane.vertices[ this.randomVertexIndex ];
        this.randomVertexPosition.copy( this.randomVertex.position );
        this.randomPosition.add( this.selectedTile.position, this.randomVertexPosition );
        this.randomNormal = this.terrainPlane.vertexNormals[ this.randomVertexIndex ];
    },

	selectTerrainRandomCoords: function( empty, radius, border ) {

	    var resolution = this.terrainPlane.resolution,
	        usedVertices = this.usedVertices,
		    tries = 100,
	        radius2 = empty? radius * radius : 0,
	        stillEmpty, x, y, ix, iy, ixl, iyl, dx, dy;

		if( border === undefined ) border = 0;

		do {
			var log = Math.random() > 0.98;

		    x = border + Math.floor( Math.random() * (resolution - border * 2) );
		    y = border + Math.floor( Math.random() * (resolution - border * 2) );

			if( empty ) {

				stillEmpty = true;

				for( ix = x - radius, ixl = x + radius; ix < ixl && stillEmpty; ix++ ) {

					dx = (x - ix) * (x - ix);

					for( iy = y - radius, iyl = y + radius; iy < iyl && stillEmpty; iy++ ) {

						dy = (y - iy) * (y - iy);

						if( dx + dy <= radius2 )
							stillEmpty = ! usedVertices[ Math.abs( ix % resolution ) ][ Math.abs( iy % resolution ) ];
					}
				}
			}
			else stillEmpty = false;

	    } while( --tries > 0 && empty && ! stillEmpty );

		if( tries == 0 ) {

			console.log( "ERROR: Terrain.selectTerrainRandomCoords: Not found" );
		}
		else if( empty ) {

			for( ix = x - radius, ixl = x + radius; ix < ixl && stillEmpty; ix++ ) {

				dx = x - ix;

				for( iy = y - radius, iyl = y + radius; iy < iyl && stillEmpty; iy++ )

					dy = y - iy;

					if( dx * dx + dy * dy <= radius2 )
						usedVertices[ Math.abs( ix % resolution ) ][ Math.abs( iy % resolution ) ] = true;
			}
		}

		this.randomX = x;
		this.randomY = y;
    }
};