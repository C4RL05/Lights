/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 04/09/2011
 * Time: 11:57
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapGlows = function( map ) {

	this.initialize( map );
};

LIGHTS.MapGlows.prototype = {

    colors:       [ [ [ 1, 1, 0 ], [ 1, 0, 0 ] ],
					[ [ 1, 0, 1 ], [ 1, 0, 0 ] ],
					[ [ 1, 1, 0 ], [ 0, 1, 0 ] ],
					[ [ 0, 1, 1 ], [ 0, 1, 0 ] ],
	                [ [ 0, 1, 1 ], [ 0, 0, 1 ] ],
	                [ [ 1, 0, 1 ], [ 0, 0, 1 ] ] ],

    glows:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;
		this.ballSize = LIGHTS.BallGeometries.prototype.ballSize;

        // Glow texture
        var i, material;

        // Texture
		this.texture = new THREE.Texture( LIGHTS.images.glow );
		this.texture.minFilter = THREE.LinearMipMapLinearFilter;
		this.texture.magFilter = THREE.LinearMipMapLinearFilter;
        this.texture.needsUpdate = true;

        // Geometry
		this.glowCount = LIGHTS.BallsManager.prototype.ballsPerTile;
		this.geometry = new LIGHTS.SpotGeometry( 1, 1, 1, 1, this.glowCount );

		material = new THREE.MeshBasicMaterial( {

			vertexColors:   THREE.FaceColors,
			map:            this.texture,
			blending:       THREE.AdditiveBlending,
			transparent:    true
		} );

		this.mesh = new THREE.Mesh( this.geometry, material );
		this.mesh.dynamic = true;

        for( i = 0; i < this.glowCount; i++ )
            this.glows.push( new LIGHTS.MapGlow( i, this.geometry ) );
    },

    // _______________________________________________________________________________________ Public

    launch: function( balls ) {

	    this.balls = balls;

	    var glows = this.glows,
	        terrainSize = LIGHTS.Terrain.prototype.tileSize,
	        mapSize = this.map.viewRadius * 2,
		    i, il, glow, ballPos, ball, behaviour, colorIndex;

		for( i = 0, il = this.glowCount; i < il; i++ ) {

			behaviour = balls.behaviours[ i ];
			ballPos = behaviour.position;

            glow = this.glows[ i ];
			glow.behaviour = behaviour;

			glow.position.x = (ballPos.x / terrainSize) * mapSize;
			glow.position.y = (ballPos.z / terrainSize) * mapSize;
        }

        this.map.glowScene.addChild( this.mesh );
    },

	clear: function() {

        this.map.scene.removeChild( this.mesh );
	},

    update: function() {

	    var glows = this.glows,
		    ballSize = this.ballSize,
	        colors = this.colors,
		    i, il, glow, glowColor, ballColors, topColor, bottomColor, behaviour, mult, add, grow, scale, growMinus,
		    posX, posY, glowSize2;

        for( i = 0, il = this.glowCount; i < il; i++ ) {

	        glow = this.glows[ i ];
	        behaviour = glow.behaviour;

	        if( behaviour.visible && behaviour.state < 2 ) {

		        mult = behaviour.multiply;
		        add = behaviour.additive;
		        grow = behaviour.grow;
		        scale = behaviour.scale;

		        glow.visible = true;

		        if( glow.scale != scale || glow.grow != grow || glow.multiply != mult || glow.additive != add ) {

					glowColor = glow.color;
					ballColors = colors[ behaviour.colorIndex ];
					bottomColor = ballColors[ 0 ];
					topColor = ballColors[ 1 ];
					growMinus = 1 - grow;

					glowColor.r = (topColor[ 0 ] * growMinus + bottomColor[ 0 ] * grow) * mult + add;
					glowColor.g = (topColor[ 1 ] * growMinus + bottomColor[ 1 ] * grow) * mult + add;
					glowColor.b = (topColor[ 2 ] * growMinus + bottomColor[ 2 ] * grow) * mult + add;

					posX = glow.position.x;
					posY = glow.position.y;

					glowSize2 = 3 * ( behaviour.scale * ballSize * (1 - grow * 0.5) - add );

					glow.posA.x = posX - glowSize2;
					glow.posA.y = posY - glowSize2;
					glow.posB.x = posX + glowSize2;
					glow.posB.y = posY - glowSize2;
					glow.posC.x = posX - glowSize2;
					glow.posC.y = posY + glowSize2;
					glow.posD.x = posX + glowSize2;
					glow.posD.y = posY + glowSize2;

					glow.scale = scale;
					glow.grow = grow;
					glow.multiply = mult;
					glow.additive = add;

					this.geometry.__dirtyVertices = true;
					this.geometry.__dirtyColors = true;
		        }
	        }
	        else if( glow.visible ) {

		        glow.visible = false;
		        glow.scale = 0;

		        glow.posA.x = glow.posA.y =
		        glow.posB.x = glow.posB.y =
		        glow.posC.x = glow.posC.y =
		        glow.posD.x = glow.posD.y = 0;

		        this.geometry.__dirtyVertices = true;
	        }
        }
    }
};

LIGHTS.MapGlow = function( index, geometry ) {

	this.position = new THREE.Vector3();

	this.posA = geometry.vertices[ index * 4 ].position;
	this.posB = geometry.vertices[ index * 4 + 1 ].position;
	this.posC = geometry.vertices[ index * 4 + 2 ].position;
	this.posD = geometry.vertices[ index * 4 + 3 ].position;

	this.posA.z = 10;
	this.posB.z = 10;
	this.posC.z = 10;
	this.posD.z = 10;

	geometry.faces[ index ].color = this.color = new THREE.Color();

	this.scale = 0;
	this.grow = 0;
	this.multiply = 0;
	this.additive = 0;
	this.visible = false;
};