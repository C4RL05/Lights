/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 24/07/2011
 * Time: 11:28
 * To change this template use File | Settings | File Templates.
 */

THREE.MeshUtils = {};

THREE.MeshUtils.addChild = function( scene, parent, child ) {

    if( child.parent != parent ) {

        child.parent = parent;
        parent.children.push( child );
        scene.objects.push( child );
        scene.__objectsAdded.push( child );
    }
};

THREE.MeshUtils.removeChild = function( scene, parent, child ) {

    if( child.parent == parent ) {

        child.parent = null;
        parent.children.splice( parent.children.indexOf( child ), 1 );
        scene.objects.splice( scene.objects.indexOf( child ), 1 );
        scene.__objectsRemoved.push( child );
    }
};

THREE.MeshUtils.transformUVs = function( geometry, uOffset, vOffset, uMult, vMult ) {

    var vertexUVs = geometry.faceVertexUvs[ 0 ],
        i, il, j, jl, uvs, uv;

	for( i = 0, il = vertexUVs.length; i < il; i++ ) {

		uvs = vertexUVs[ i ];

		for( j = 0, jl = uvs.length; j < jl; j++ ) {

			uv = uvs[ j ];
			uv.u = uv.u * uMult + uOffset;
			uv.v = uv.v * vMult + vOffset;
		}
	}
};

THREE.MeshUtils.translateVertices = function( geometry, x, y, z ) {

    var vertices = geometry.vertices,
        pos, i, il;

	for( i = 0, il = vertices.length; i < il; i++ ) {

		pos = vertices[ i ].position;
		pos.x += x;
		pos.y += y;
		pos.z += z;
	}
};

THREE.MeshUtils.getVertexNormals = function( geometry ) {

    var faces = geometry.faces,
        normals = [],
        f, fl, face;

    for( f = 0, fl = faces.length; f < fl; f++ ) {

        face = faces[ f ];

        if( face instanceof THREE.Face3 ) {

            normals[ face.a ] = face.vertexNormals[ 0 ];
            normals[ face.b ] = face.vertexNormals[ 1 ];
            normals[ face.c ] = face.vertexNormals[ 2 ];
        }
        else if( face instanceof THREE.Face4 ) {

            normals[ face.a ] = face.vertexNormals[ 0 ];
            normals[ face.b ] = face.vertexNormals[ 1 ];
            normals[ face.c ] = face.vertexNormals[ 2 ];
            normals[ face.d ] = face.vertexNormals[ 3 ];
        }
    }

    return normals;
};

THREE.MeshUtils.createVertexColorGradient = function( geometry, colors, minY ) {

	var vertices = geometry.vertices,
		faces = geometry.faces,
		colorCount = colors.length,
		yList = [],
		vertexColorList = [],
		yBase, yLength, yCount, face, i, il, bottomColor, topColor, alphaColor, alpha, alpha1, color;

	if( minY === undefined ) minY = 0;

	// Ys
	for( i = 0, il = vertices.length; i < il; i++ )
		if( yList.indexOf( vertices[ i ].position.y ) == -1 )
			yList.push( vertices[ i ].position.y );

	yList.sort( function sort( a, b ) { return b - a; } );

	yCount = yList.length;
	yBase = yList[ yCount - 1 ];
	yLength = yList[ 0 ] - yBase;

	// Vertex colors
	for( i = 0; i < yCount; i++ ) {

		alphaColor = (yList[ i ] - yBase) / yLength;
		alphaColor = Math.max( 0 ,(alphaColor - minY) / (1 - minY) );
		alphaColor *= (colorCount - 1);
		index = Math.floor( alphaColor );

		bottomColor = colors[ index ];
		topColor = colors[ index + 1 ];

		topR = (topColor >> 16 & 255) / 255,
		topG = (topColor >> 8 & 255) / 255,
		topB = (topColor & 255) / 255,
		bottomR = (bottomColor >> 16 & 255) / 255,
		bottomG = (bottomColor >> 8 & 255) / 255,
		bottomB = (bottomColor & 255) / 255,

		alpha = alphaColor % 1;
		alpha1 = 1 - alpha;

		color = new THREE.Color();
		color.r = topR * alpha + bottomR * alpha1;
		color.g = topG * alpha + bottomG * alpha1;
		color.b = topB * alpha + bottomB * alpha1;
		color.updateHex();

		vertexColorList[ i ] = color;
	}

	// Assign to faces
	for( i = 0, il = faces.length; i < il; i ++ ) {

		face = faces[ i ];
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.a ].position.y ) ] );
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.b ].position.y ) ] );
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.c ].position.y ) ] );

		if( face.d !== undefined )
			face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.d ].position.y ) ] );
	}

	delete yList;

	geometry.vertexColorList = vertexColorList;
};
