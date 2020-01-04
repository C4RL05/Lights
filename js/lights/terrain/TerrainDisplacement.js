/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 06/08/2011
 * Time: 19:45
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDisplacement = function( terrain ) {

	this.initialize( terrain );
};

LIGHTS.TerrainDisplacement.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

    // _______________________________________________________________________________________ Constructor

	initialize: function( terrain ) {

		this.terrain = terrain;
        this.terrainPlane = terrain.terrainPlane;
		this.spectrum = null;

		// Flat2Terrain
		this.velocities = [];

		var xl = this.terrainPlane.resolution,
			x;

		for( x = 0; x < xl; x++ )
			this.velocities[ x ] = [];
	},

    update: function() {

	    switch( LIGHTS.Music.phase.index ) {

			case 15:
			case 21:
		        this.updateSpectrum();
		        break;

			case 16:
			case 22:
		        this.updateFlat();
		        break;

			case 17:
		        this.updateTerrain();
		        break;
	    }
    },

	updateSpectrum: function() {

		var grid = this.terrainPlane.grid,
		    heightGrid = this.terrainPlane.heightGrid,
		    spectrum = this.spectrum,
			resolution = this.terrainPlane.resolution,
		    r2 = resolution / 2,
			x, xl, y, yl, gridX, heightGridX, dx2, dy2, i;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];
			heightGridX = heightGrid[ x ];
			dx2 = (x - r2) * (x - r2);

			for( y = 0, yl = resolution; y < yl; y++ ) {

				dy2 = (y - r2) * (y - r2);
				i = Math.floor( Math.sqrt( dx2 + dy2 ) );
				gridX[ y ].y = heightGridX[ y ] + spectrum[ i ];
			}
		}
//console.log( spectrum[ 0 ], spectrum[ 1 ], spectrum[ 2 ], spectrum[ 3 ] );
		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	updateTerrain: function() {

		var grid = this.terrainPlane.grid,
		    heightGrid = this.terrainPlane.heightGrid,
			resolution = this.terrainPlane.resolution,
			velocities = this.velocities,
			deltaTime = LIGHTS.deltaTime * 0.5,
			drag = 1 - LIGHTS.deltaTime * 5,
			x, xl, y, yl, gridX, gridXY, posY, heightGridX, velocity, velocityX;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];
			heightGridX = heightGrid[ x ];
			velocityX = velocities[ x ];

			for( y = 0, yl = resolution; y < yl; y++ ) {

				gridXY = gridX[ y ];
				posY = gridXY.y;
				velocityX[ y ] *= drag;
				velocityX[ y ] += (heightGridX[ y ] - posY) * (Math.abs( posY ) * deltaTime);
				gridXY.y += velocityX[ y ];

//				gridXY.y -= (gridXY.y - heightGridX[ y ]) * ease;
			}
		}

		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	updateFlat: function() {

		var grid = this.terrainPlane.grid,
			resolution = this.terrainPlane.resolution,
			ease = LIGHTS.deltaTime * 4,
			x, xl, y, yl, gridX, gridXY;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];

			for( y = 0, yl = resolution; y < yl; y++ ) {

				gridXY = gridX[ y ];
				gridXY.y -= gridXY.y * ease;
			}
		}

		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	launchFlat2Terrain: function() {

		var resolution = this.terrainPlane.resolution,
			heightGrid = this.terrainPlane.heightGrid,
			x, xl, y, yl;

		for( x = 0, xl = resolution; x < xl; x++ )
			for( y = 0, yl = resolution; y < yl; y++ )
//				this.velocities[ x ][ y ] = heightGrid[ x ][ y ] / 100;
				this.velocities[ x ][ y ] = 0;
	}
};

    // _______________________________________________________________________________________ Update
/*
	// update() on bump
	update_Bump: function() {

		this.active = (this.bumps.length > 0);

		if( this.active ) {

			for( var i = 0; i < this.bumps.length; i++ )
				this.updateBump( this.bumps[ i ] );

			this.terrainPlane.computeFaceNormals();
			this.terrainPlane.computeVertexNormals();
		}
	},

	createBump: function( h ) {

		this.terrain.selectTerrainRandomCoords( false );

		var x = this.terrain.randomX,
			y = this.terrain.randomY,
			r = 10;

//		console.log( this.terrainPlane.grid[ x ][ y ].y );

		if( this.terrainPlane.grid[ x ][ y ].y > 20 )
			h = -h;

		if( this.bumps === undefined )
			this.bumps = [];

		this.bumps.push( new LIGHTS.Bump( x, y, r, h ) );
	},

	updateBump: function( bump ) {

		var a = bump.a - (bump.a - 1) * LIGHTS.deltaTime;

		this.terrainPlane.displaceVertex( bump.x, bump.y, bump.r, bump.h * (a - bump.a) );
		bump.a = a;

		if( bump.a > 0.99 ) {

			this.bumps.splice( this.bumps.indexOf( bump ), 1 );
			delete bump;
		}
	}
};

LIGHTS.Bump = function( x, y, r, h ) {

	this.x = x;
	this.y = y;
	this.r = r;
	this.h = h;
	this.a = 0;
};
*/