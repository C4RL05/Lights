/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 11:19
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDotsManager = function( director ) {

	this.initialize( director );
};

LIGHTS.TerrainDotsManager.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

    beats:          0,
    grid:           [],
	tiles:          [],
	circles:        [],

    brightColor:    new THREE.Color( 0xFFFFFF ),
    darkColor:      new THREE.Color( 0x000000 ),
    debugColor:     new THREE.Color( 0xFF0000 ),

	activeMult:     1, //0.35,

	avatarOrder:    [ [0, 4], 8, 2, 6, 1, 5, [3, 7] ],
	avatarPosX:     [ 0, 22, 44,  0, 22, 44,  0, 22, 44 ],
	avatarPosY:     [ 0,  0,  0, 22, 22, 22, 44, 44, 44 ],

	rgbColors:      [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 1, 0 ], [ 0, 1, 1 ], [ 1, 0, 1 ] ],
/*
	arpKeys:        [ 0, 0.255, 0.38, 0.63, 0.75,
					  1, 1.255, 1.38, 1.63, 1.75,
					  2, 2.125, 2.38, 2.50, 2.75,
					  3, 3.125, 3.38, 3.50, 3.75,
					  4, 4.255, 4.38, 4.63, 4.75,
					  5, 5.255, 5.38, 5.63, 5.75,
					  6, 6.125, 6.38, 6.50, 6.75,
					  7, 7.125, 7.38, 7.50, 7.75 ],
*/
	arpKeys:        [     0, 0.375, 0.750,
					  1.000, 1.375, 1.750,
					  2.125, 2.500, 2.750,
					  3.125, 3.500, 3.750,
					  4.000, 4.375, 4.750,
					  5.000, 5.375, 5.750,
					  6.125, 6.500, 6.750,
					  7.125, 7.500, 7.750 ],

    // _______________________________________________________________________________________ Constructor

    initialize: function( director ) {

	    this.director = director;
	    this.terrainPlane = director.terrain.terrainPlane;
	    this.displacement = director.terrain.displacement;

        // Geometry
	    var x, y, i, dot, pv, tv;

        this.geometry = new THREE.Geometry(),
        this.geometry.colors = [];
	    this.terrainVertices = [];
	    this.particleVertices = [];
	    this.dots = [];
	    this.avatar = null;

        for( x = 0, i = 0; x < LIGHTS.Terrain.prototype.mapResolution; x++ ) {

            this.grid[ x ] = [];

            for( y = 0; y < LIGHTS.Terrain.prototype.mapResolution; y++ ) {

                this.grid[ x ][ y ] = i++;
	            tv = director.terrain.terrainPlane.vertexGrid[ x ][ y ];
	            pv = new THREE.Vertex( tv.position.clone() );
                this.terrainVertices.push( tv );
                this.particleVertices.push( pv );
                this.geometry.colors.push( new THREE.Color( 0x00FFFF ) );

	            dot = new LIGHTS.TerrainDot( pv.position );
	            dot.index = i - 1;
	            this.dots.push( dot );
            }
        }

	    this.geometry.vertices = this.terrainVertices;

	    texture = new THREE.Texture( LIGHTS.images.terrainDot );
	    texture.needsUpdate = true;

        // Material
        this.material = new THREE.ParticleBasicMaterial( {
            vertexColors: true,
            size: 20,
            color: 0xC0C0C0,
//            color: 0xFFFFFF,
//            map: THREE.ImageUtils.loadTexture( "images/cyan_plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/small_plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/particle.png" ),
//          map: LIGHTS.Utils.getCircleTexture( 32 ),
	        map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        this.beatTime = 0.1;
		this.allPainted = 1;

	    for( i = 0; i < 6; i++ )
	        this.circles.push( new LIGHTS.TerrainCircle( i ) );

//	    this.setupWords();
    },

    // _______________________________________________________________________________________ Events

    launch: function() {

        switch( LIGHTS.Music.phase.index ) {

            case 0:
				this.beats = 1;
	            this.material.color.setHex( 0xC0C0C0 );
	            this.material.size = 20;
	            this.resetDots();
	            this.paintAll( 0, true );
	            this.geometry.vertices = this.terrainVertices;
	            this.dirtyVertices = true;
	            break;

	        case 1:
	        case 2:
		        this.paintCircles( 16, true );
				break;

            case 3:
	            this.paintAll( 2, true );
	            break;

            case 4:
            case 6:
            case 12:
	            this.paintAll( 1, true );
	            break;

            case 5:
	            this.resetParticles();
	            this.setupWords();
	            this.launchWords();
	            this.geometry.vertices = this.particleVertices;
	            this.dirtyVertices = true;
	            this.nextBeat = 1;
                break;

	        case 7:
	            this.paintAll( 0 );
	            break;

		    case 11:
			    this.resetDots();
			    this.material.size = 32;
			    this.paintAll( 1, true );
			    this.geometry.vertices = this.terrainVertices;
			    this.dirtyVertices = true;
			    break;

            case 13:
	            this.setupAvatars();
	            this.launchAvatars();
	            this.paintAll( 1, true );
                break;

		    case 15: // D1
			    this.material.size = 20;
			    this.resetDots();
			    this.paintAll( 0, true );
			    this.paintCircles( 192 );
		        break;

	        case 16: // S!
		        this.material.size = 20;
		        this.paintAll( 1, true );
		        break;

	        case 17: // C3
		        this.material.color.setHex( 0xFFFFFF );
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        break;

	        case 18: // C3b
	        case 19: // C3c
	        case 20: // C3d
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        break;

	        case 21:
		        this.resetParticles();
		        this.paintAll( 1, true );
//		        this.geometry.vertices = this.terrainVertices;
//		        this.dirtyVertices = true;
		        this.beats = 0;
	            break;

	        case 22:
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        this.setupMoveUp();
		        this.geometry.vertices = this.particleVertices;
		        this.dirtyVertices = true;
	            break;
        }
    },

    beat: function() {

        switch( LIGHTS.Music.phase.index ) {

            case 1:
		        if( this.beats % 2 == 0 )
		            this.paintCircles( 16, true );
		        break;

	        case 2:
				this.paintCircles( 12, true );
		        break;

            case 3:
	        case 4:
	        case 6:
		        this.paintCircles( 32 );
		        break;

	        case 5:
		        if( this.nextBeat == 0 ) {

			        this.paintCircles( 32 );
		        }
		        else {

			        this.paintAll( 1, true );
			        this.nextBeat--;
		        }
	            break;

		    case 11:
	        case 12:
		        this.paintCircles( 8 );
                break;

	        case 13:
	        case 14:
		        if( this.beats % 2 == 0 )
			        this.launchAvatar();
				break;

            case 15:
                break;

            case 17:
            case 18:
            case 19:
            case 20:
                break;

	        case 21:
		        var beats21 = [ 12, 14 ];

	            if( this.beats % 2 == 1 || beats21.indexOf( this.beats ) != -1 ) {

		            this.paintAll( 0, true );
		            this.paintCircles( 128 );
	            }
                break;
        }
        this.beats++;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

		this.geometry.__dirtyVertices = this.dirtyVertices || this.terrainPlane.__dirtyVertices;
	    this.dirtyVertices = false;

	    switch( LIGHTS.Music.phase.index ) {

		    case 0:
			    this.paintDarker( true, false, 4 );
			    this.updateMovingCircles();
			    break;

		    case 1:
		    case 2:
			    this.paintDarker( true, false, 3 );
			    break;

		    case 3:
		    case 4:
		        this.paintDarker( true, false, 1 );
		        break;

	        case 5:
	        case 6:
			    this.moveToWords();
		        this.paintDarker( false, true, 0.5 );
		        break;

		    case 7:
		        this.explodeWords();
		        break;

		    case 11:
		    case 12:
		        this.paintDarker( true, false, 0.5 );
		        break;

	        case 13:
	        case 14:
		        this.paintDarker( false, false, 0.5 );
		        this.updateAvatar();
	            break;

	        case 15:
	            break;

		    case 17:
		    case 18:
		    case 19:
		    case 20:
		        this.paintDarker( true, false, 0.5 );
		        break;

		    case 21:
		        this.paintDarker( true, false, 4 );
		        break;

		    case 22:
		        this.moveUp();
		        break;
	    }
    },

    // _______________________________________________________________________________________ Private

    // _______________________________________________________________________________________ Canvas

	paintAll: function( grey, force ) {

		var colors = this.geometry.colors,
			dots = this.dots,
		    il = dots.length,
		    i, dot, color;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( force || ! dot.isActive ) {

				color = colors[ dot.index ];
				color.r = color.g = color.b = grey;
			}
		}

		this.allPainted = grey;
	    this.geometry.__dirtyColors = true;
	},

	paintDarker: function( force, blend, darkness ) {

		var colors = this.geometry.colors,
			activeMult = this.activeMult,
			dots = this.dots,
		    il = dots.length,
			dark = 1 - darkness * LIGHTS.deltaTime,
		    i, dot, color, active;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];
			active = dot.isActive;

			if( force || ! active ) {

				color = colors[ dot.index ];
				color.r *= dark;
				color.g *= dark;
				color.b *= dark;
			}
			else if( blend ) {

				color = colors[ dot.index ];

				if( color.r > activeMult )
					color.r *= dark;

				if( color.g > activeMult )
					color.g *= dark;

				if( color.b > activeMult )
					color.b *= dark;
			}
		}

	    this.geometry.__dirtyColors = true;
	},

	paintCircles: function( count, isWhite ) {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            isColor = (isWhite === undefined || isWhite === false),
            dots = this.dots,
            grid = this.grid,
            activeMult = this.activeMult,
            radius, radius2, centerX, centerY, rgb, colorR, colorG, colorB, colorRi, colorGi, colorBi,
            i, il, x, y, xl, yl, dx, dy, gridX, color, index, dot;

		if( isWhite )
			colorR = colorG = colorB = 2;

		for( i = 0; i < count; i++ ) {

			radius = Math.random() * 4 + 4;
			radius2 = radius * radius;
			radius = Math.floor( radius );
			centerX = Math.floor( Math.random() * res );
			centerY = Math.floor( Math.random() * res );

			if( isColor ) {

				rgb = this.rgbColors[ Math.floor( Math.random() * this.rgbColors.length ) ];
				colorR = rgb[ 0 ];
				colorG = rgb[ 1 ];
				colorB = rgb[ 2 ];
				colorRi = Math.min( colorR + 0.5, 1 ) * activeMult;
				colorGi = Math.min( colorG + 0.5, 1 ) * activeMult;
				colorBi = Math.min( colorB + 0.5, 1 ) * activeMult;
			}

			for( x = centerX - radius, xl = centerX + radius; x <= xl; x++ ) {

				if( x >= 0 )
					gridX = grid[ x % res ];
				else
					gridX = grid[ (x + Math.ceil( -x / res ) * res ) % res ];

				dx = (centerX - x) * (centerX - x);

				for( y = centerY - radius, yl = centerY + radius; y <= yl; y++ ) {

					dy = (centerY - y) * (centerY - y);

					if( dx + dy <= radius2 ) {

						if( y >= 0 )
							index = gridX[ y % res ];
						else
							index = gridX[ (y + Math.ceil( -y / res ) * res ) % res ];

						color = colors[ index ];
						dot = dots[ index ];

						if( dot.isActive ) {

							color.r = colorRi;
							color.g = colorGi;
							color.b = colorBi;
						}
						else {

							color.r += colorR;
							color.g += colorG;
							color.b += colorB;
						}
					}
				}
			}
		}

		this.allPainted = null;
        this.geometry.__dirtyColors = true;
    },

	updateMovingCircles: function() {

        var deltaTime = LIGHTS.deltaTime,
			colors = this.geometry.colors,
            circles = this.circles,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            grey, circle, radius, radius2, centerX, centerY, dist2,
            i, il, x, y, xl, yl, dx, dy, gridX, color, index;

		for( i = 0, il = circles.length; i < il; i++ ) {

			circle = circles[ i ];

			if( circle.delay < 0 ) {

				radius = Math.ceil( circle.radius );
				radius2 = circle.radius * circle.radius;
				centerX = circle.posX;
				centerY = circle.posY;
				grey = circle.grey;

				for( x = centerX - radius, xl = centerX + radius; x <= xl; x++ ) {

				    if( x >= 0 )
					    gridX = grid[ x % res ];
				    else
					    gridX = grid[ (x + Math.ceil( -x / res ) * res ) % res ];

					dx = (centerX - x) * (centerX - x);

					for( y = centerY - radius, yl = centerY + radius; y <= yl; y++ ) {

						dy = (centerY - y) * (centerY - y);
						dist2 = radius2 - (dx + dy);

						if( dist2 >= 0 /*&& dist2 <= 4*/ ) {

							if( y >= 0 )
								index = gridX[ y % res ];
							else
								index = gridX[ (y + Math.ceil( -y / res ) * res ) % res ];

							color = colors[ index ];

							color.r += grey;
							color.g += grey;
							color.b += grey;
						}
					}
				}

				circle.radius += deltaTime * circle.speed;
				circle.grey -= deltaTime * circle.fade;

				if( circle.grey <= 0 )
					circle.reset( 0 );
			}
			else {

				circle.delay -= deltaTime;
			}
		}

		this.allPainted = null;
        this.geometry.__dirtyColors = true;
    },

    // _______________________________________________________________________________________ Avatars

	setupAvatars: function() {

		var dots = this.dots,
			grid = this.grid,
			posX = this.avatarPosX,
			posY = this.avatarPosY,
			dotAvatars = new LIGHTS.TerrainDotAvatars( this ),
			avatars = dotAvatars.avatars,
			avatar, colors, colorsX, gridX, dot, avatarDots, avatarDotsX, avatarColor, dotColor,
			i, il, x, y, w, h, dx, dy;

		this.avatars = avatars;

	    for( i = 0, il = avatars.length; i < il; i++ ) {

		    avatar = avatars[ i ];
		    colors = avatar.colors;
		    w = avatar.width;
		    h = avatar.height;
		    dx = posX[ i ];
		    dy = posY[ i ];

			avatarDots = [];

		    for( x = 0; x < w; x++ ) {

			    colorsX = colors[ x ];
			    gridX = grid[ x + dx ];
			    avatarDotsX = [];

			    for( y = 0; y < h; y++ ) {

			        dot = dots[ gridX[ y + dy ] ];
//				    dot.avatarColor = colorsX[ y ]; // Fade
				    dotColor = dot.avatarColor = new THREE.Color( 0x000000 ); // Wipe
				    avatarColor = colorsX[ y ];
				    dotColor.r = avatarColor[ 0 ];
				    dotColor.g = avatarColor[ 1 ];
				    dotColor.b = avatarColor[ 2 ];
				    avatarDotsX.push( dot );
			    }

			    avatarDots.push( avatarDotsX );
		    }

		    avatar.dots = avatarDots;
	    }
	},

	launchAvatars: function() {

		var dots = this.dots,
			avatars = this.avatars,
			posX = this.avatarPosX,
			posY = this.avatarPosY,
			avatarDots, color,
		    i, il, x, xl, y, yl, w, h, w1, h1;

		// Deactivate
		for( i = 0, il = dots.length; i < il; i++ )
			dots[ i ].isActive = false;

		// Rotate to camera
//		for( i = 0, il = avatars.length; i < il; i++ ) {
//
//			avatar = avatars[ i ];
//			avatarDots = avatar.dots;
//			w = avatar.width;
//			h = avatar.height;
//			w1 = w - 1;
//			h1 = h - 1;
//
//			for( x = 0; x < w; x++ ) {
//
//				for( y = 0; y < h; y++ ) {
//
//					avatarDots[ x ][ y ].currentAvatarColor = avatarDots[ y ][ w1 - x ].avatarColor;
//				}
//
//				avatarDots.push( avatarDotsX );
//			}
//		}

		this.avatarNext = 0;
	},

	launchAvatar: function() {

		if( this.avatarNext > -1 ) {

			if( this.avatarNext < this.avatarOrder.length ) {

				if( this.avatarOrder[ this.avatarNext ] instanceof Array )
					this.avatar = null;
				else
					this.avatar = this.avatars[ this.avatarOrder[ this.avatarNext ] ];

				this.avatarNext++;
				this.avatarLine = 0;
			}
			else {

				this.avatarNext = -1;
			}
		}
	},

	updateAvatar: function() {

		if( this.avatarNext > 0 ) {

			if( this.avatarLine !== null ) {

				var colors = this.geometry.colors,
					isMulti = (this.avatar === null),
					lines = Math.ceil( LIGHTS.deltaTime * 30 ),
				    a, al, il, i, j, jl, dot, dotLine, color, avatarColor;

				for( a = 0, al = isMulti? 2 : 1; a < al; a++ ) {

					dots = isMulti? this.avatars[ this.avatarOrder[ this.avatarNext - 1 ][ a ] ].dots : this.avatar.dots;

					for( j = this.avatarLine, jl = Math.min( dots.length, this.avatarLine + lines ); j < jl; j++ ) {

						dotLine = dots[ j ];

						for( i = 0, il = dotLine.length; i < il; i++ ) {

							dot = dotLine[ i ];
							dot.isActive = true;
							color = colors[ dot.index ];
							avatarColor = dot.avatarColor;

							color.r = avatarColor.r;
							color.g = avatarColor.g;
							color.b = avatarColor.b;
						}
					}
				}

				this.geometry.__dirtyColors = true;

				this.avatarLine += lines;

				if( this.avatarLine >= dots.length )
					this.avatarLine = null;
			}
		}
	},

	updateAvatarFade: function() {

		if( this.avatarNext > 0 ) {

			var colors = this.geometry.colors,
				avatar = this.avatar,
				dots = avatar.dots,
				height = avatar.height,
				ease = LIGHTS.deltaTime * 2,
			    x, xl, yl, y, dot, dotLine, color, avatarColor;

			for( x = 0, xl = avatar.width; x < xl; x++ ) {

				dotLine = dots[ x ];

				for( y = 0, yl = height; y < yl; y++ ) {

					dot = dotLine[ y ];
					dot.isActive = true;
					color = colors[ dot.index ];
					avatarColor = dot.avatarColor;

					color.r -= (color.r - avatarColor[ 0 ]) * ease;
					color.g -= (color.g - avatarColor[ 1 ]) * ease;
					color.b -= (color.b - avatarColor[ 2 ]) * ease;
				}
			}

			this.geometry.__dirtyColors = true;

			this.avatarTime -= LIGHTS.deltaTime;

			if( this.avatarTime < 0 )
				this.launchAvatar();
		}
	},

    // _______________________________________________________________________________________ Words

	setupWords: function() {

		var i, j, wordDots, tries, u, a, r, speed;

	    this.text = new LIGHTS.TerrainDotsText( this );

	    for( i = 0; i < this.text.words.length; i++ ) {

		    wordDots = this.text.words[ i ].dots;

		    for( j = 0; j < wordDots.length; j++ ) {

				// Find available dot
			    tries = 1000;

				do {

					dot = this.dots[ Math.floor( Math.random() * this.dots.length ) ];

				} while( --tries > 0 && dot.isText );

			    if( dot.isText ) {

				    console.log( "ERROR: LIGHTS.TerrainDotsManager.setupWords: Dot without text not found!" );
				}
			    else {

				    dot.isText = true;
				    dot.delay = i + 0.2 + Math.random() * 0.5;
					dot.wordPosition = wordDots[ j ];

				    u = Math.random() * 2 - 1;
					a = Math.random() * rad360;
					r = Math.sqrt( 1 - u * u );
				    speed = Math.random() * 96 + 64;

				    dot.velocity.x = Math.cos( a ) * r * speed;
				    dot.velocity.y = u * speed;
				    dot.velocity.z = Math.sin( a ) * r * speed;
			    }
		    }
	    }
	},

	launchWords: function() {

		var dots = this.dots,
		    il = dots.length,
		    i, dot;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( dot.isText ) {

				dot.isActive = true;
				dot.ease = 2.5 + Math.random();
			}
		}
	},

	moveToWords: function() {

		this.text.update();

	    var deltaTime = LIGHTS.deltaTime,
	        dots = this.dots,
	        il = dots.length,
	        i, dot, ease, position, wordPosition;

	    for( i = 0; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.isText ) {

			    if( dot.delay < 0 ) {

				    position = dot.position;
			        wordPosition = dot.wordPosition;
				    ease = deltaTime * dot.ease;

				    position.x -= (position.x - wordPosition.x) * ease;
				    position.y -= (position.y - wordPosition.y) * ease;
				    position.z -= (position.z - wordPosition.z) * ease;

				    dot.ease -= (dot.ease - 10) * ease * 0.1;
			    }
			    else
			        dot.delay -= deltaTime;
		    }
	    }

	    this.dirtyVertices = true;
    },

	explodeWords: function() {

	    var deltaTime = LIGHTS.deltaTime,
		    colors = this.geometry.colors,
	        dots = this.dots,
	        il = dots.length,
	        dark = 1 - deltaTime * 2,
	        i, dot, ease, position, velocity, drag, color;

	    for( i = 0; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.isText ) {

				position = dot.position;
				velocity = dot.velocity;

				position.x += velocity.x * deltaTime;
				position.y += velocity.y * deltaTime;
				position.z += velocity.z * deltaTime;

				drag = 1 - dot.drag * deltaTime;
				velocity.x *= drag;
				velocity.y *= drag;
				velocity.z *= drag;

				color = colors[ dot.index ];
				color.r *= dark;
				color.g *= dark;
				color.b *= dark;
		    }
	    }

	    this.dirtyVertices = true;
		this.geometry.__dirtyColors = true;
    },

	resetDots: function() {

		var dots = this.dots,
		    il = dots.length,
		    i, dot;

		for( i = 0; i < il; i++ )
			dots[ i ].reset();
	},

    // _______________________________________________________________________________________ Particles

	updateTerrainParticles: function() {

		var terrainVertices = this.terrainVertices,
			dots = this.dots,
		    il = dots.length,
		    i, dot, position, terrainPosition;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( ! dot.isText && ! dot.isAvatar ) {

				position = dot.position;
				terrainPosition = terrainVertices[ i ].position;

				position.x = terrainPosition.x;
				position.y = terrainPosition.y;
				position.z = terrainPosition.z;
			}
		}
	},

	resetParticles: function() {

		var terrainVertices = this.terrainVertices,
			particleVertices = this.particleVertices,
			dots = this.dots,
		    il = dots.length,
		    particlePosition, terrainPosition, i;

		for( i = 0; i < il; i++ ) {

			position = particleVertices[ i ].position;
			terrainPosition = terrainVertices[ i ].position;

			position.x = terrainPosition.x;
			position.y = terrainPosition.y;
			position.z = terrainPosition.z;

			dots[ i ].reset();
		}
	},

    // _______________________________________________________________________________________ Private

    showDebug: function() {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            debugColor = this.debugColor,
            x, y, gridX;

        for( x = 0; x < res; x++ ) {

            gridX = grid[ x ];

            for( y = 0; y < res; y++ )
                colors[ gridX[ y ] ] = debugColor;
        }

        this.geometry.__dirtyColors = true;
    },

    show: function( visible ) {

		var tiles = this.tiles,
			i, il;

		for( i = 0, il = tiles.length; i < il; i++ )
			tiles[ i ].particleSystem.visible = visible;
    },
/*
    showStripeX: function( advance ) {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            step = advance? this.beats % 8 : 0,
            brightColor = this.brightColor,
            darkColor = this.darkColor,
            x, y, gridX, color;

        for( x = 0; x < res; x++ ) {

            gridX = grid[ x ];
            color = ((x+step) % 8 >= 4)? brightColor : darkColor;

            for( y = 0; y < res; y++ )
                colors[ gridX[ y ] ] = color;
        }

        this.geometry.__dirtyColors = true;
    },

	showStripeY: function( advance ) {

	    var colors = this.geometry.colors,
	        res = LIGHTS.Terrain.prototype.mapResolution,
	        grid = this.grid,
		    step = advance? this.beats % 8 : 0,
	        brightColor = this.brightColor,
	        darkColor = this.darkColor,
	        x, y, color;

	    for( y = 0; y < res; y++ ) {

	        color = ((y+step) % 8 >= 4)? brightColor : darkColor;

	        for( x = 0; x < res; x++ )
	            colors[ grid[ x ][ y ] ] = color;
	    }

	    this.geometry.__dirtyColors = true;
	},
*/
	setupMoveUp: function() {

	    var dots = this.dots,
		    colors = this.geometry.colors,
	        arpKeys = this.arpKeys,
	        arpKeyCount = arpKeys.length,
	        i, il, dot, dotColor, color;

	    for( i = 0, il = dots.length; i < il; i++ ) {

		    dot = dots[ i ];
			dot.position.y = 0;

		    dot.delay = arpKeys[ Math.floor( Math.random() * arpKeyCount ) ];
		    dot.height = Math.random() * 150 + 50;
		    dot.ease = 2 + Math.random();

		    dotColor = dot.color;
			color = colors[ i ];
		    dotColor.r = color.r;
		    dotColor.g = color.g;
		    dotColor.b = color.b;
	    }

		this.geometry.__dirtyColors = true;
    },

    moveUp: function() {

	    var deltaTime = LIGHTS.deltaTime,
	        dots = this.dots,
	        terrainVertices = this.terrainVertices,
	        colors = this.geometry.colors,
	        i, il, dot, dotColor, intensity, color;

	    for( i = 0, il = dots.length; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.delay < 0 ) {

			    dot.position.y -= (dot.position.y - dot.height) * deltaTime * dot.ease;
			    dotColor = dot.color;
			    color = colors[ i ];
			    intensity = 1 - (dot.position.y / dot.height);
			    color.r = dotColor.r * intensity;
			    color.g = dotColor.g * intensity;
			    color.b = dotColor.b * intensity;
		    }
		    else {

			    dot.position.y = terrainVertices[ i ].position.y;
			    dot.delay -= deltaTime;
		    }
	    }

	    this.geometry.__dirtyColors = true;
	    this.dirtyVertices = true;
    }
};

// ___________________________________________________________________________________________ Dot

LIGHTS.TerrainDot = function( pos ) {

	this.initialize( pos );
};

LIGHTS.TerrainDot.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( pos ) {

		this.position = pos;
		this.delay = 0;
		this.avatarColor = null;
		this.color = new THREE.Color();
		this.index = null;
		this.velocity = new THREE.Vector3();
		this.drag = Math.random() * 0.01 + 0.005;

		this.reset();
	},

	reset: function() {

		this.isText = false;
		this.isAvatar = false;
		this.isActive = false;
	}
};

// ___________________________________________________________________________________________ Dot

LIGHTS.TerrainCircle = function( index ) {

	this.initialize( index );
};

LIGHTS.TerrainCircle.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( index ) {

		this.index = index;

		this.reset( index );
	},

	reset: function( delay ) {

		this.active = false;
		this.posX = Math.floor( Math.random() * LIGHTS.Terrain.prototype.mapResolution );
		this.posY = Math.floor( Math.random() * LIGHTS.Terrain.prototype.mapResolution );
		this.radius = 0;
		this.grey = 1.2;
		this.delay = delay;
		this.speed = Math.random() * 25 + 5;
		this.fade = 2;
	}
};

// ___________________________________________________________________________________________ Tile

LIGHTS.TerrainDotsTile = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainDotsTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

        this.manager = manager;

        this.children = [];

        this.particleSystem = new THREE.ParticleSystem( manager.geometry, manager.material );
        this.particleSystem.sortParticles = false;
        this.particleSystem.position.y = 3;
        this.children.push( this.particleSystem );

		manager.tiles.push( this );
    },

    // _______________________________________________________________________________________ Update

    update: function() {

    }
};