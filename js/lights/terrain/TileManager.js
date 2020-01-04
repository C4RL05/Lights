/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 09:37
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TileManager = function( director ) {

	this.initialize( director );
};

LIGHTS.TileManager.prototype = {

	estimatedTileCount: 16,

    // _______________________________________________________________________________________ Vars

    containers:         [],
    containerTable:     {},
    containerPool:      [],

    managers:           [],

    // _______________________________________________________________________________________ Setup

	initialize: function( director ) {

        this.director = director;
        this.terrain = director.terrain;
        this.scene = director.view.scene;

        // Stars
        this.stars = new LIGHTS.StarManager( director );
        this.managers.push( this.stars );

        // TerrainDots
        this.terrainDots = new LIGHTS.TerrainDotsManager( director );
        this.managers.push( this.terrainDots );

        // TerrainMesh
        this.terrainMesh = new LIGHTS.TerrainMeshManager( director );
        this.managers.push( this.terrainMesh );

        // Balls
        this.balls = new LIGHTS.BallsManager( director );
        this.managers.push( this.balls );

        // Cannons
        this.cannons = new LIGHTS.CannonManager( director );
        this.managers.push( this.cannons );

        // Tubes
//        this.tubes = new LIGHTS.TubeManager( director, this.terrainMesh.terrainMap.texture );
//        this.managers.push( this.tubes );

		// Containers
		for( var i = 0; i < this.estimatedTileCount; i++ )
			this.containerPool.push( this.createTileContainer() );

		this.ready = false;
	},

    createTileContainer: function() {

        var container = new THREE.Object3D();
        this.containers.push( container );

	    var tiles = [];

	    container.balls = new LIGHTS.BallsTile( this.balls, container );
	    tiles.push( container.balls );

	    container.stars = new LIGHTS.StarTile( this.stars, container );
	    tiles.push( container.stars );

        tiles.push( new LIGHTS.TerrainDotsTile( this.terrainDots ) );
        tiles.push( new LIGHTS.TerrainMeshTile( this.terrainMesh ) );
        tiles.push( new LIGHTS.CannonsTile( this.cannons ) );
//        tiles.push( new LIGHTS.TubesTile( this.tubes ) );
	    container.tiles = tiles;

	    this.scene.addChild( container );

        return container;
    },

    // _______________________________________________________________________________________ Public

    update: function() {

        var managers = this.managers,
	        container, containerId, manager, i, il,
            removed = 0, added = 0, terrainCount = 0, containerCount = 0;

        // Remove containers
        for( containerId in this.containerTable ) {

            if( this.terrain.tileIdSet[ containerId ] != true ) {

                container = this.containerTable[ containerId ];
                delete this.containerTable[ containerId ];

                this.containerPool.push( container );
                THREE.SceneUtils.showHierarchy( container, false );
	            container.visible = false;
                removed++;
            }
            else containerCount++;
        }

        // Add containers
        for( containerId in this.terrain.tileIdSet ) {

            if( this.containerTable[ containerId ] === undefined ) {

                if( this.containerPool.length > 0 ) {

	                container = this.containerPool.pop();
	                container.visible = true;
                }
                else {

	                container = this.createTileContainer();
	                console.log( "createTileContainer", this.containers.length );
                }

                this.terrain.selectTileById( containerId );
                container.position.copy( this.terrain.selectedTile.position );
	            this.updateTiles( container );

                this.containerTable[ containerId ] = container;
                added++;
                containerCount++;
            }
            terrainCount++;
        }

//        if( removed > 0 || added > 0 )
//            console.log( "removed:" + removed + " added:" + added + " terrain:" + terrainCount + " container:" + containerCount );

        // Update
        for( i = 0, il = managers.length; i < il; i++ ) {

	        manager = this.managers[ i ];

	        if( manager.active )
		        manager.update();
        }
    },

    apply: function() {

        for( var i in this.containerTable )
            this.updateTiles( this.containerTable[ i ] );
    },

    // _______________________________________________________________________________________ Private

    updateTiles: function( container ) {

        var i, j, tile, active, child;

        for( i = 0; i < container.tiles.length; i++ ) {

            tile = container.tiles[ i ];
            active = tile.manager.active;

            for( j = 0; j < tile.children.length; j++ ) {

                child = tile.children[ j ];

	            if( child.interactive ) {

		            if( active && child.active ) {

//			            child.visible = true;

		                if( child.parent !== container )
		                    THREE.MeshUtils.addChild( this.scene, container, child );
		            }
		            else {

//			            child.visible = false;
		                if( child.parent === container )
		                    THREE.MeshUtils.removeChild( this.scene, container, child );
		            }
	            }
	            else {

		            if( active ) {

//		                if( child.parent !== container )
//		                    console.log( child.name );

		                if( child.parent !== container )
		                    THREE.MeshUtils.addChild( this.scene, container, child );

			            child.visible = true;
		            }
		            else {

		                if( child.parent === container )
		                    THREE.MeshUtils.removeChild( this.scene, container, child );

			            child.visible = false;
		            }
	            }
            }
        }

	    container.balls.updateTile();
	    container.stars.updateTile();
    }
};