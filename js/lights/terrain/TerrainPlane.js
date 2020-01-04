/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

LIGHTS.TerrainPlane = function( size, resolution, height, image ) {

	THREE.Geometry.call( this );

	this.resolution = resolution;
	this.segmentSize = size / resolution;

    var ix, iy, x, y,
    sizeHalf = size / 2,
    resolution1 = resolution + 1,
    segmentSize = this.segmentSize,
    vertex, vertexPosition, a, b, c, d, heightMap;

    heightMap = createHeightMap( resolution, height, image );

    this.grid = [];
    this.vertexGrid = [];
	this.uvGrid = [];
	this.indexGrid = [];
	this.heightGrid = [];

    // Vertices
    for( ix = 0; ix <= resolution; ix++ ) {

        x = ix * segmentSize - sizeHalf;
        this.grid[ ix ] = [];
        this.vertexGrid[ ix ] = [];
	    this.indexGrid[ ix ] = [];
	    this.heightGrid[ ix ] = [];

        for( iy = 0; iy <= resolution; iy++ ) {

            y = iy * segmentSize - sizeHalf;
            vertexPosition = new THREE.Vector3( x, heightMap[ ix ][ iy ], y );
            vertex = new THREE.Vertex( vertexPosition );

            this.grid[ ix ][ iy ] = vertexPosition;
            this.vertexGrid[ ix ][ iy ] = vertex;
            this.indexGrid[ ix ][ iy ] = this.vertices.length;
	        this.heightGrid[ ix ][ iy ] = vertexPosition.y;

	        this.vertices.push( vertex );
		}
	}

	// UVs
	for( ix = 0; ix <= resolution; ix++ ) {

		this.uvGrid[ ix ] = [];

	    for( iy = 0; iy <= resolution; iy++ )
			this.uvGrid[ ix ][ iy ] = new THREE.UV( iy / resolution, ix / resolution );
	}

    // Faces
    for( ix = 0; ix < resolution; ix++ ) {

        for( iy = 0; iy < resolution; iy++ ) {

			a = ix + resolution1 * iy;
            b = ( ix + 1 ) + resolution1 * iy;
			c = ( ix + 1 ) + resolution1 * ( iy + 1 );
            d = ix + resolution1 * ( iy + 1 );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [
				this.uvGrid[ ix     ][ iy     ],
				this.uvGrid[ ix + 1 ][ iy     ],
				this.uvGrid[ ix + 1 ][ iy + 1 ],
				this.uvGrid[ ix     ][ iy + 1 ]
            ] );
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
    this.computeVertexNormals();

    this.vertexNormals = THREE.MeshUtils.getVertexNormals( this );

    // _______________________________________________________________________________________ Create Height Maps

    function createHeightMap( resolution, height, image ) {

        // ImageData
        var heightMap = [],
            imageCanvas = document.createElement( 'canvas' ),
            imageContext = imageCanvas.getContext( '2d' ),
            imageData, x, y, ix, iy, blurRadius, blurBuffer, blurAcc, bx, by;

        imageContext.drawImage( image, 0, 0 );
        imageData = imageContext.getImageData( 0, 0, resolution, resolution ).data;

        // Height map
        for( x = 0; x <= resolution; x++ )
            heightMap[ x ] = [];

        // Interior
        for( x = 0; x <= resolution; x++ ) {

            ix = (x < resolution)? x : 0;

            for( y = 0; y <= resolution; y++ ) {

                iy = (y < resolution)? y : 0;
                heightMap[ x ][ y ] = imageData[ (ix + iy * resolution) * 4 ];
            }
        }

        // Blur
        blurRadius = 2;
        blurBuffer = [];

        for( x = 0; x <= resolution; x++ )
            blurBuffer[ x ] = heightMap[ x ].slice( 0 );

        for( x = 0; x <= resolution; x++ ) {

            for( y = 0; y <= resolution; y++ ) {

                blurAcc = 0;

                for( by = -blurRadius; by <= blurRadius; by++ ) {

                    for( bx = -blurRadius; bx <= blurRadius; bx++ ) {

                        ix = x + bx;
                        iy = y + by;

                        if( ix < 0 )
                            ix += resolution;
                        else if( ix > resolution )
                            ix -= resolution;

                        if( iy < 0 )
                            iy += resolution;
                        else if( iy > resolution )
                            iy -= resolution;

                        blurAcc += blurBuffer[ ix ][ iy ];
                    }
                }

                heightMap[ x ][ y ] = blurAcc / ((blurRadius * 2 + 1) * (blurRadius * 2 + 1));
            }
        }

        // Scale
        for( x = 0; x <= resolution; x++ )
            for( y = 0; y <= resolution; y++ )
                heightMap[ x ][ y ] = height * ((heightMap[ x ][ y ] - 128) / 255);

        return heightMap;
    }
};

LIGHTS.TerrainPlane.prototype = new THREE.Geometry();
LIGHTS.TerrainPlane.prototype.constructor = LIGHTS.TerrainPlane;

// _______________________________________________________________________________________ Public

LIGHTS.TerrainPlane.prototype.displaceVertex = function( x, y, radius, height ) {

	var radius2 = radius * radius,
		diameter = radius * 2,
		resolution = this.resolution,
		grid = this.grid,
		ix, iy, dx2, dy2, gx, gy, gridX, gridX0, h;

	// Vertices
	for( ix = 0; ix < diameter; ix++ ) {

		dx2 = (ix - radius) * (ix - radius);
		gx = (resolution + x + ix - radius) % resolution;
		gridX = grid[ gx ];

		for( iy = 0; iy < diameter; iy++ ) {

			dy2 = (iy - radius) * (iy - radius);
			gy = (resolution + y + iy - radius) % resolution;
			h = Math.max( 0, 1 - ((dx2 + dy2) / radius2) );

			if( h > 0 )
				gridX[ gy ].y += height * (Math.sin( rad180 * h - rad90 ) + 1) * 0.5;
		}
	}

	// Fix tiled border
	gridX = grid[ resolution ];
	gridX0 = grid[ 0 ];

	for( iy = 0; iy <= resolution; iy++ )
		gridX[ iy ].y = gridX0[ iy ].y;

	for( ix = 0; ix < resolution; ix++ )
		grid[ ix ][ resolution ].y = grid[ ix ][ 0 ].y;

	// Dirty
	this.__dirtyVertices = true;
};

LIGHTS.TerrainPlane.prototype.tileBorders = function() {

	var resolution = this.resolution,
		grid = this.grid,
		ix, iy, dx2, dy2, gx, gy, gridX, gridX0, h;

	// Fix tiled border
	gridX = grid[ resolution ];
	gridX0 = grid[ 0 ];

	for( iy = 0; iy <= resolution; iy++ )
		gridX[ iy ].y = gridX0[ iy ].y;

	for( ix = 0; ix < resolution; ix++ )
		grid[ ix ][ resolution ].y = grid[ ix ][ 0 ].y;

	// Dirty
	this.__dirtyVertices = true;
};

LIGHTS.TerrainPlane.prototype.resetVertices = function() {

	for( x = 0; x <= this.resolution; x++ )
	    for( y = 0; y <= this.resolution; y++ )
		    this.grid[ x ][ y ].y = this.heightGrid[ x ][ y ];

	// Dirty
	this.__dirtyVertices = true;

	this.computeCentroids();
	this.computeFaceNormals();
    this.computeVertexNormals();
};