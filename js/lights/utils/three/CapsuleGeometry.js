/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 07/08/2011
 * Time: 19:38
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.CapsuleGeometry = function( bottom, top, h, s, sh, cap, hCap, sCap, capBottom, hCapBottom, sCapBottom ) {

	THREE.Geometry.call( this );

    // Geometry
	var vertices = this.vertices,
	    faces = this.faces,
		vertexUVs = [],
		height = h,
		jl = sh.length - 1,
	    i, j, x, y, z, a, b, c, d, face, uvs;


	if( cap )
		height += hCap;
	else
		hCap = 0;

	if( capBottom )
		height += hCapBottom;
	else
		hCapBottom = 0;

	// Circle vertices
	for( j = 0; j <= jl; j++ ) {

		y = sh[ j ];
		b = bottom * (1 - y) + top * y;

		for( i = 0; i < s; i++ ) {

			a = rad360 * i / s;
			x = Math.sin( a ) * b;
			z = Math.cos( a ) * b;

			vertices.push( new THREE.Vertex( new THREE.Vector3( x, y * h, z ) ) );
			vertexUVs.push( new THREE.UV( i / s, (y * h + hCapBottom) / height ) );
		}
	}

	// Body faces
	for( j = 0; j < jl; j++ ) {

		y = j * s;

		for( i = 0; i < s; i++ ) {

			a = i + s + y;
			b = i + y;
			c = ( i + 1 ) % s + y;
			d = s + ( i + 1 ) % s + y;

			face = new THREE.Face4( a, b, c, d );
			faces.push( face );
		}
	}

	if( cap ) {

		j = jl * s;

		// Cap vertices
		for( b = 0; b < sCap - 1; b++ ) {

			a = rad90 * ( (b + 1) / sCap );
			d = top * Math.cos( a );
			y = h + hCap * Math.sin( a );

			for( i = 0; i < s; i ++ ) {

				a = rad360 * i / s;
				x = Math.sin( a ) * d;
				z = Math.cos( a ) * d;

				vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
				vertexUVs.push( new THREE.UV( i /s, (y + hCapBottom) / height ) );
			}
		}

		vertices.push( new THREE.Vertex( new THREE.Vector3( 0, h + hCap, 0 ) ) );
		vertexUVs.push( new THREE.UV( 99, 1 ) );

		// Cap faces
		for( x = 0; x < sCap - 1; x++ ) {

			y = x * s + j;

			for( i = 0; i < s; i++ ) {

				a = i + s + y;
				b = i + y;
				c = ( i + 1 ) % s + y;
				d = ( i + 1 ) % s + s + y;

				face = new THREE.Face4( a, b, c, d );
				faces.push( face );
			}
		}

		b = vertices.length - 1;

		for( i = 0; i < s - 1; i++ ) {

			a = b - s + i + 1;
			c = b - s + i;

			face = new THREE.Face3( a, b, c );
			faces.push( face );
		}

		c = b - 1;
		a = b - s;

		face = new THREE.Face3( a, b, c );
		faces.push( face );
	}

	if( capBottom ) {

		j += sCap * s + 1;

		// Cap vertices
		for( b = 0; b < sCapBottom - 1; b++ ) {

			a = rad90 * ( (b + 1) / sCapBottom );
			d = top * Math.cos( a );
			y = -hCapBottom * Math.sin( a );

			for( i = 0; i < s; i ++ ) {

				a = rad360 * i / s;
				x = Math.sin( a ) * d;
				z = Math.cos( a ) * d;

				vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
				vertexUVs.push( new THREE.UV( i / s, -y / height ) );
			}
		}

		vertices.push( new THREE.Vertex( new THREE.Vector3( 0, -hCapBottom, 0 ) ) );
		vertexUVs.push( new THREE.UV( 99, 0 ) );

		// Cap faces
		for( x = 0; x < sCapBottom - 1; x++ ) {

			y = (x - 1) * s + j;

			for( i = 0; i < s; i++ ) {

				if( x == 0 ) {

					a = i + j;
					b = i;
					c = ( i + 1 ) % s;
					d = ( i + 1 ) % s + j;
				}
				else {

					a = i + y + s;
					b = i + y;
					c = ( i + 1 ) % s + y;
					d = ( i + 1 ) % s + y + s;
				}

				face = new THREE.Face4( c, b, a, d );
				faces.push( face );
			}
		}

		b = vertices.length - 1;

		for( i = 0; i < s - 1; i++ ) {

			a = b - s + i + 1;
			c = b - s + i;

			face = new THREE.Face3( c, b, a );
			faces.push( face );
		}

		c = b - 1;
		a = b - s;

		face = new THREE.Face3( c, b, a );
		faces.push( face );
	}

    // Cylindrical mapping
	for( i = 0; i < faces.length; i++ ) {

		uvs = [];
		face = faces[ i ];

		a = vertexUVs[ face.a ];
		b = vertexUVs[ face.b ];
		c = vertexUVs[ face.c ];

		// Quad
		if( face.d !== undefined ) {

			if( c.u == 0 )
				c = new THREE.UV( 1, c.v );

			uvs.push( new THREE.UV( a.u, a.v ) );
			uvs.push( new THREE.UV( b.u, b.v ) );
			uvs.push( new THREE.UV( c.u, c.v ) );

			d = vertexUVs[ face.d ];

			if( d.u == 0 )
				d = new THREE.UV( 1, d.v );

			uvs.push( new THREE.UV( d.u, d.v ) );
		}
		else {

			if( b.u == 99 )
				b = new THREE.UV( (a.u + c.u) / 2, b.v );

			if( a.u == 0 )
				a = new THREE.UV( 1, a.v );

			uvs.push( new THREE.UV( a.u, a.v ) );
			uvs.push( new THREE.UV( b.u, b.v ) );
			uvs.push( new THREE.UV( c.u, c.v ) );
		}

		this.faceVertexUvs[ 0 ].push( uvs );
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
};

LIGHTS.CapsuleGeometry.prototype = new THREE.Geometry();
LIGHTS.CapsuleGeometry.prototype.constructor = LIGHTS.CapsuleGeometry;