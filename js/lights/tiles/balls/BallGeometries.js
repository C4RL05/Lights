/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 14/08/2011
 * Time: 09:32
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallGeometries = function( director ) {

	this.initialize( director );
};

LIGHTS.BallGeometries.prototype = {

	ballSize:               16,

	stemWidth:              0.05,

	stemRadius:             2,
	stemLength:             48,
	stemCapHeight:          2,
	stemReflectivity:       0.4,

	sphereColors:           [ [ 0xFFFF00, 0xFF0000 ],
							  [ 0xFF00FF, 0xFF0000 ],
							  [ 0xFFFF00, 0x00FF00 ],
							  [ 0x00FFFF, 0x00FF00 ],
							  [ 0x00FFFF, 0x0000FF ],
							  [ 0xFF00FF, 0x0000FF ] ],

	spotColors:             [ 0xFF6060,
							  0xFF6060,
							  0x60FF60,
							  0x60FF60,
							  0x6060FF,
							  0x6060FF ],

	groupBehaviours:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

		this.director = director;

		this.createSphereGeometries();
		this.createBalloonGeometries();
		this.createStemGeometry();
	},

    // _______________________________________________________________________________________ Sphere

	createSphereGeometries: function() {

		// Geometries
		this.sphereGeometries = [];

		var geometry, colors, material, shader, uniforms, i, il, v;

		for( i = 0, il = this.sphereColors.length; i < il; i++ ) {

//			geometry = new LIGHTS.SphereGeometry( this.ballSize, 16, 12 );
			geometry = this.createDropGeometry();
//			geometry = this.createStemGeometry();
//			this.createSphereSpikes( geometry );
			colors = this.sphereColors[ i ];
			THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ], 0.6667 );
			this.sphereGeometries.push( geometry );
		}

		// Shader
		this.sphereShader = {

			uniforms: THREE.UniformsUtils.merge( [

				THREE.UniformsLib[ "common" ],
				THREE.UniformsLib[ "fog" ],
				{ "addR" : { type: "f", value: 0.0 } },
				{ "addG" : { type: "f", value: 0.0 } },
				{ "addB" : { type: "f", value: 0.0 } },
				{ "multiply" : { type: "f", value: 1.0 } }
			] ),

			fragmentShader: [

				"uniform float addR;",
				"uniform float addG;",
				"uniform float addB;",
				"uniform float multiply;",

				THREE.ShaderChunk[ "color_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],

				"void main() {",

					"gl_FragColor = vec4( vColor * multiply, 1.0 );",
					"gl_FragColor.r = min( gl_FragColor.r + addR, 1.0 );",
					"gl_FragColor.g = min( gl_FragColor.g + addG, 1.0 );",
					"gl_FragColor.b = min( gl_FragColor.b + addB, 1.0 );",

					THREE.ShaderChunk[ "fog_fragment" ],
				"}"
			].join("\n"),

			vertexShader: [

				THREE.ShaderChunk[ "color_pars_vertex" ],

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

					THREE.ShaderChunk[ "color_vertex" ],
					THREE.ShaderChunk[ "default_vertex" ],
				"}"
			].join("\n")
		};

		this.sphereMaterials = [];
		this.sphereMaterialGroups = [];

		this.groupAdditives = [ 0.0, 0.0 ];
		this.groupMultiplies = [ 1.0, 1.0 ];
	},

	createBalloonGeometries: function() {

		// Geometries
		this.balloonGeometries = [];

		var geometry, colors, i, il;

		for( i = 0, il = this.sphereColors.length; i < il; i++ ) {

			geometry = new LIGHTS.SphereGeometry( this.ballSize, 16, 12 );
			colors = this.sphereColors[ i ];
			THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ] );
			this.balloonGeometries.push( geometry );
		}
	},

/*
	createSphereGeometry: function() {

		var colors = this.sphereColors[ Math.floor( Math.random() * this.sphereColors.length) ],
			geometry, colors, material, shader, uniforms, i, il, v;

		geometry = new LIGHTS.SphereGeometry( this.ballSize, 12, 12 );
		this.createSphereSpikes( geometry );
		THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ] );

		return geometry;
	},
*/

	createDropGeometry: function() {

		var segmentsAroundY = 16,
			refYs = [ -45, -30.168032, -23.313184, -17.65832, -14.0680352, -11.2017072, -7.888, -4.0291056, 0.112, 4.2531056, 8.112, 11.4257088, 13.9684064, 15.5668128 ],
			refRs = [ 1.81821399749878, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
			positions = [],
			i, il, pos, radius, angle, j, cos, sin;

		var geometry = new LIGHTS.CapsuleGeometry( 1, 1, 1, segmentsAroundY, refYs, true, 15, 1, false ), // 0.0340742
			vertices = geometry.vertices;

		v = 0;

		for( i = 0, il = refRs.length; i < il; i++ ) {

			radius = refRs[ i ];

			for( j = 0; j < segmentsAroundY; j++ ) {

				pos = vertices[ v++ ].position;

				angle = Math.atan2( pos.z, pos.x );
				cos = Math.cos( angle );
				sin = Math.sin( angle );
				pos.x = radius * cos;
				pos.z = radius * Math.sin( angle );
				pos.cos = cos;
				pos.sin = sin;

				positions.push( pos );
			}
		}

		geometry.positions = positions;

		return geometry;
	},

//	refDropRs: [ 1.8369775289023125, 1.81821399749878, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
	refDropRs: [ 1, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
	refGrowRs: [],

	updateDrops: function( grow ) {

		var segmentsAroundY = 16,
			ballSize = this.ballSize,
			refDropRs = this.refDropRs,
			refGrowRs = this.refGrowRs,
			useBehaviour =  (grow === undefined),
			i, il, j, g, s, sl, v, pos, radius, angle, alpha, behaviour;


		for( g = 0; g < 2; g++ ) {

			behaviour = this.groupBehaviours[ g ];

			if( useBehaviour )
				alpha = 1 - (Math.sin( Math.min( 1, behaviour.grow * 1.1 ) * rad90 - rad90 ) + 1);
			else
				alpha = 1 - (Math.sin( Math.min( 1, grow ) * rad90 - rad90 ) + 1);

//			alpha = Math.sin( (1 - Math.min( 1, behaviour.grow * 1.08 )) * rad90 );

			for( i = 0; i < 9; i++ )
				refGrowRs[ i ] = refDropRs[ i ] - (refDropRs[ i ] - ballSize) * alpha;

			if( ! useBehaviour || behaviour.growTarget == 1 ) {

				for( s = g * 3, sl = (g + 1) * 3; s < sl; s++ ) {

					geometry = this.sphereGeometries[ s ];
					positions = geometry.positions,
					v = 0;

					for( i = 0, il = refGrowRs.length; i < il; i++ ) {

						radius = refGrowRs[ i ];

						for( j = 0; j < segmentsAroundY; j++ ) {

							pos = positions[ v++ ];
							pos.x = radius * pos.cos;
							pos.z = radius * pos.sin;
						}
					}

					geometry.__dirtyVertices = true;
				}
			}
		}
	},

	createSphereSpikes: function( geometry ) {

		var vertices = geometry.vertices,
			grid = geometry.grid,
			spikesOn = [],
			spikesOff = [],
			gridX, spike, i, il, j, jl;

		geometry.spikesOff = spikesOff;
		geometry.spikesOn = spikesOn;

		for( i = 0, il = vertices.length; i < il; i++ ) {

			spikesOff.push( vertices[ i ].position.clone() );
			spikesOn.push( vertices[ i ].position.clone() );
		}

		for( i = 0, il = grid.length; i < il; i += 2 ) {

			gridX = grid[ i ];

			if( gridX[ 0 ] != gridX[ 1 ] ) {

				for( j = 0, jl = gridX.length; j < jl; j += 2 ) {

					spike = spikesOn[ gridX[ j ] ];
					spike.multiplyScalar( phi + Math.random() );
				}
			}
			else {

				spike = spikesOn[ gridX[ 0 ] ];
				spike.multiplyScalar( phi + Math.random() );
			}
		}
	},

	tweenSphereSpikes: function( geometry, alpha ) {

		var vertices = geometry.vertices,
			spikesOn = geometry.spikesOn,
			spikesOff = geometry.spikesOff,
			alphaMinus = 1 - alpha,
			vertexPos, spikeOn, spikeOff, i, il;

		for( i = 0, il = vertices.length; i < il; i++ ) {

			vertexPos = vertices[ i ].position;
			spikeOn = spikesOn[ i ];
			spikeOff = spikesOff[ i ];

			vertexPos.x = spikeOn.x * alpha + spikeOff.x * alphaMinus;
			vertexPos.y = spikeOn.y * alpha + spikeOff.y * alphaMinus;
			vertexPos.z = spikeOn.z * alpha + spikeOff.z * alphaMinus;
		}

		geometry.__dirtyVertices = true;
	},

	createSphereMaterial: function( groupIndex ) {

		uniforms = THREE.UniformsUtils.clone( this.sphereShader.uniforms );

		var material = new THREE.MeshShaderMaterial( {

//			wireframe: true,
			fog: this.director.view.scene.fog,
			vertexColors: THREE.VertexColors,
			uniforms: uniforms,
			vertexShader: this.sphereShader.vertexShader,
			fragmentShader: this.sphereShader.fragmentShader
		} );

		material.addR = uniforms["addR"];
		material.addG = uniforms["addG"];
		material.addB = uniforms["addB"];
		material.multiply = uniforms["multiply"];
		material.addR.value = 0;
		material.addG.value = 0;
		material.addB.value = 0;
		material.multiply.value = this.groupMultiplies[ groupIndex ];

//		this.director.materialCache.addMaterial( material );

		if( this.sphereMaterialGroups[ groupIndex ] === undefined )
			this.sphereMaterialGroups[ groupIndex ] = [];

		this.sphereMaterialGroups[ groupIndex ].push( material );
		this.sphereMaterials.push( material );

		return material;
	},

	setSphereMultiplyAdditive: function( multiply, additive, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			material, i, il;

		for( i = 0, il = materials.length; i < il; i++ ) {

			material = materials[ i ];
			material.addR.value = additive;
			material.addG.value = additive;
			material.addB.value = additive;
			material.multiply.value = multiply;
		}

		if( isGroup ) {

			this.groupMultiplies[ group ] = multiply;
			this.groupAdditives[ group ] = additive;
		}
		else {

			this.groupMultiplies[ 0 ] = this.groupMultiplies[ 1 ] = multiply;
			this.groupAdditives[ 0 ] = this.groupAdditives[ 1 ] = additive;
		}
	},

	setSphereMultiply: function( multiply, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].multiply.value = multiply;

		if( isGroup )
			this.groupMultiplies[ group ] = multiply;
		else
			this.groupMultiplies[ 0 ] = this.groupMultiplies[ 1 ] = multiply;
	},

	setSphereAdditive: function( additive, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il, material;

		for( i = 0, il = materials.length; i < il; i++ ) {

			material = materials[ i ];
			material.addR.value = additive;
			material.addG.value = additive;
			material.addB.value = additive;
		}

		if( isGroup )
			this.groupAdditives[ group ] = additive;
		else
			this.groupAdditives[ 0 ] = this.groupAdditives[ 1 ] = additive;
	},

	setSphereBlend: function( blend, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ ) {

			materials[ i ].blending = blend? THREE.AdditiveBlending : THREE.NormalBlending;
			materials[ i ].transparent = blend;
		}
	},

    // _______________________________________________________________________________________ Stem

	createStemGeometry: function() {
/*
		var segmentsAroundY = 16,
			refYs = [ -4.24158, -2.686576, -1.885502, -1.457074, -1.103645, -0.8792522 ],
			refRs = [ 0.06822220584883634, 0.0669877629933408, 0.10545021761674084, 0.194687465384837, 0.3494873056313777, 0.5333295288212063 ],
			i, il, pos, radius, angle, j;

		for( i = 0, il = refRs.length; i < il; i++ )
			refRs[ i ] -= ( refRs[ i ] - 1 ) * this.stemWidth;

		for( i = 0, il = refYs.length; i < il; i++ )
			refYs[ i ] *= this.ballSize;

		for( i = 0, il = refRs.length; i < il; i++ )
			refRs[ i ] *= this.ballSize;

		this.stemGeometry = new LIGHTS.CapsuleGeometry( 1, 1, 1, segmentsAroundY, refYs, true, -4, 1, false );
		var vertices = this.stemGeometry.vertices;

		v = 0;

		for( i = 0, il = refRs.length; i < il; i++ ) {

			radius = refRs[ i ];

			for( j = 0; j < segmentsAroundY; j++ ) {

				pos = vertices[ v++ ].position;

				angle = Math.atan2( pos.z, pos.x );
				pos.x = radius * Math.cos( angle );
				pos.z = radius * Math.sin( angle );
			}
		}
*/
		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 8, [ 0, 1 ], true, this.stemCapHeight, 1, false );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );

		// Material
		this.stemMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
	},

	createStemGeometryTube: function() {

		var stemHeights = [ 0, 0.5, 1 ];

		// Geometry
		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 12, stemHeights, true, this.stemCapHeight, 2, false );
		THREE.MeshUtils.createVertexColorGradient( this.stemGeometry, [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x808080 ] );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );

		// Materials
		this.stemMaterials = [];

//		var envMap = new THREE.Texture( [
//
//			LIGHTS.images.envMapLeft,
//			LIGHTS.images.envMapRight,
//			LIGHTS.images.envMapTop,
//			LIGHTS.images.envMapBottom,
//			LIGHTS.images.envMapFront,
//			LIGHTS.images.envMapBack
//		] );
//
//		envMap.needsUpdate = true;

		for( i = 0; i < this.sphereColors.length; i++ ) {

			material = new THREE.MeshBasicMaterial( {

				vertexColors:   THREE.VertexColors,
//				envMap:         envMap,
//				reflectivity:   this.stemReflectivity,
//				combine:        THREE.MultiplyOperation,
//				shading:        THREE.SmoothShading
//				color:          0xFFFFFF
//				map:            texture,
//				blending:       THREE.AdditiveBlending,
//				transparent:    true
			} );

			this.stemMaterials.push( material );
			this.director.materialCache.addMaterial( material );
		}

		this.resetStemColors();
	},

	createStemGeometry_Spot: function() {

		var stemHeights = [ 0, 0.5, 1 ];

		// Geometry
//		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 12, stemHeights, true, 2, this.stemCapHeight, false );
		this.stemGeometry = new LIGHTS.SpotGeometry( this.stemRadius, this.stemRadius, this.stemLength );
//		THREE.MeshUtils.createVertexColorGradient( this.stemGeometry, [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x808080 ] );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );


		// Materials
		var texture = new THREE.Texture( LIGHTS.images.spotLine );
		texture.needsUpdate = true;

		// Materials
		this.stemMaterials = [];

//		var envMap = new THREE.Texture( [
//
//			LIGHTS.images.envMapLeft,
//			LIGHTS.images.envMapRight,
//			LIGHTS.images.envMapTop,
//			LIGHTS.images.envMapBottom,
//			LIGHTS.images.envMapFront,
//			LIGHTS.images.envMapBack
//		] );
//
//		envMap.needsUpdate = true;

		for( i = 0; i < this.sphereColors.length; i++ ) {

			material = new THREE.MeshBasicMaterial( {

//				vertexColors:   THREE.VertexColors,
//				envMap:         envMap,
//				reflectivity:   this.stemReflectivity,
//				combine:        THREE.MultiplyOperation,
//				shading:        THREE.SmoothShading,
				color:          0xFFFFFF,
				map:            texture,
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} );

			this.stemMaterials.push( material );
			this.director.materialCache.addMaterial( material );
		}

		this.resetStemColors();
	},

	setStemColors: function( color ) {

		var materials = this.stemMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].color.setHex( color );

		this.stemColors = color;
	},

	resetStemColors: function() {

		if( this.stemColors !== null ) {

			var materials = this.stemMaterials,
				colors = this.spotColors,
				i, il;

			for( i = 0, il = materials.length; i < il; i++ )
				materials[ i ].color.setHex( colors[ i ] );

			this.stemColors = null;
		}
	},

	setStemReflection: function( reflectivity ) {

		var materials = this.stemMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].reflectivity = reflectivity;
	},

	resetStemReflection: function() {

		var materials = this.stemMaterials,
			reflectivity = this.stemReflectivity,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].reflectivity = reflectivity;
	},

    // _______________________________________________________________________________________ Private

	moveVertexY: function( vertices, dy ) {

		for( var v = 0; v < vertices.length; v++ )
			vertices[ v ].position.y += dy;
	}
};

