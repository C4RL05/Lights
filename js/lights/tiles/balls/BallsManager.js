/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 15:52
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallsManager = function( director ) {

	this.initialize( director );
};

LIGHTS.BallsManager.prototype = {

    // _______________________________________________________________________________________ Vars

    ballsPerTile:           40,
    releaseVelocity:        5,
    gravity:                -4096,

    active:                 false,

    tiles:                  [],
    balls:                  [],
	behaviours:             [],
	visibleGroups:          [],
	cameraTilePosition:     new THREE.Vector3(),

    beats:                  0,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		this.geometries = new LIGHTS.BallGeometries( director );

		var terrain = director.terrain,
			i, il;

 		// Ball positions
		terrain.selectCenterTile();

		for( i = 0, il = this.ballsPerTile; i < il; i++ ) {

			terrain.selectTerrainRandomVertex( true, 3, 3 );
			this.behaviours.push( new LIGHTS.BallBehaviour( this, i ) );
		}

		this.volume = 0;
		this.nextBeat = 0;

		this.mouse = new THREE.Vector3( 0, 0, 0.5 );
		this.projector = new THREE.Projector();
		this.camera = director.view.camera;
		this.ray = new THREE.Ray( this.camera.position, this.mouse );

		this.explosions = new LIGHTS.BallExplosions( this );

		this.mouseOverCollisions = new THREE.CollisionSystem();
		this.clickCollisions = new THREE.CollisionSystem();

		this.state = 0;
	},

    // _______________________________________________________________________________________ Events

    launch: function() {

	    var geo = this.geometries;

        switch( LIGHTS.Music.phase.index ) {

	        case 0:
		        this.beats = 1;
		        this.resetState( 0 );
		        this.setSphereMultiplyAdditive( 0.0, 0.0 );
		        break;

            case 1:
//	            geo.updateDrops( 0.8 );
	            geo.setSphereBlend( false );
	            this.setSphereMultiplyAdditive( 0.0, 1.0, 0 );
                this.showGroup( 0, true );
                this.showGroup( 1, false );
                break;

            case 2:
	            this.setSphereMultiplyAdditive( 0.0, 1.0, 1 );
                this.showGroup( 1, true );
                break;

            case 3: // C1
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//	            geo.setStemColors( 0xFFFFFF );
	            this.activateFat( true );
	            this.setFat( phi, 1 );
	            this.nextBeat = 1;
	            break;

            case 4:
	        case 6:
		        this.setSphereAdditive( 1.0 );
		        this.setFat( phi, 1 );
		        this.nextBeat = 1;
                break;

	        case 5:
		        this.changeFat();
		        this.nextBeat = 2;
                break;

	        case 7: // B2
		        this.unselect();
		        this.setSphereMultiply( 0.0 );
		        this.activateFat( false );
                break;

	        case 8:
		        this.unselect();
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
		        this.nextBeat = 1;
                break;

	        case 9:
				this.beats = 0;
		        this.unselect();
		        this.setState( 1, true );
//		        this.activateGrow( true );
		        this.setGrow( 0, 0 );
		        this.setGrow( 1, 1 );
	            break;

	        case 10:
	            this.beats = 1;
	            break;

	        case 11: // C2
		        this.setSphereAdditive( 1.0 );
//		        geo.setStemColors( 0x000000 );
//		        this.activateFat( true );
//		        this.setFat( phi, 1 );
//		        this.setState( 2, false, 1 );
		        this.setState( 2, true );
		        this.nextBeat = 1;
	            break;

	        case 13:
		        this.setState( 3, true );
                break;

	        case 15: // D1
	            break;

	        case 16: // S!
//		        geo.updateDrops( 0.8 );

//		        this.setSphereMultiplyAdditive( 0.0, 0.0 );
//		        geo.setStemColors( 0x000000 );
//		        geo.setStemReflection( 0 );
//		        this.setState( 3, false, 1 );
                break;

	        case 17: // C3
		        this.resetState( 0 );
		        this.activateFat( true );
		        this.setFat( phi, 1 );
		        geo.setSphereBlend( false );
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
//		        geo.resetStemReflection();
		        this.setRotation();
		        this.nextBeat = 1;
                break;

	        case 18:
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
		        this.unselect();
		        this.setState( 1, true );
		        this.setGrow( 0, 1 );
		        this.setGrow( 1, 0 );
		        this.nextBeat = 1;
	            break;

	        case 19:
	        case 20:
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
		        this.changeGrow();
		        this.beats = 0;
		        this.nextBeat = 1;
	            break;

	        case 21: // D2
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0x000000 );
		        this.setState( 2, true );
		        this.nextBeat = 1;
                break;

	        case 22: // A2
		        this.setState( 3, true );
//		        this.setSphereMultiply( 0.0 );
	            break;
        }
    },

    beat: function() {

	    var geo = this.geometries;

        switch( LIGHTS.Music.phase.index ) {

            case 1:
	            if( this.beats % 2 == 0 )
		            this.setSphereAdditive( 1.0, 0 );
	            else
		            this.setSphereAdditive( 0.0, 0 );
//		            this.selectBallsAdditive( 0 );
                break;

            case 2:
	            if( this.beats % 2 == 0 ) {

		            this.setSphereAdditive( 1.0, 0 );
		            this.setSphereAdditive( 0.0, 1 );
//		            geo.setSphereAdditive( 1.0, 0 );
//		            this.selectBallsAdditive( 1 );
	            }
	            else {

		            this.setSphereAdditive( 0.0, 0 );
		            this.setSphereAdditive( 1.0, 1 );
//		            this.selectBallsAdditive( 0 );
//		            geo.setSphereAdditive( 1.0, 1 );
	            }
	            break;

	        case 3:
	        case 4:
	        case 6:
		        if( this.nextBeat == 0 ) {

			        this.changeFat();
		        }
		        else {

			        this.setFat( 0, 1 );
			        this.setFat( 1, 0.5 );
			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();
			        this.nextBeat--;
		        }
		        break;

	        case 5:
		        if( this.nextBeat == 0 ) {

			        this.changeFat();
		        }
		        else if( this.nextBeat == 1 ) {

			        this.setFat( 0, 1 );
			        this.setFat( 1, 0.5 );
			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();
			        this.nextBeat--;
		        }
		        else {

			        this.setFat( phi, 1 );
			        this.setSphereAdditive( 1.0 );
//			        geo.setStemColors( 0xFFFFFF );
			        this.nextBeat--;
		        }
			    break;

	        case 8:
		        if( this.nextBeat == 1 ) {

			        this.setSphereAdditive( 0.0 );
			        this.nextBeat--;
		        }
				break;

	        case 9:
				if( this.beats > 1 && this.beats % 2 == 0 )
					this.changeGrow();
		        break;

	        case 10:
		        if( this.beats == 15 ) {

			        this.setGrow( 1, 0 );
			        this.setGrow( 1, 1 );
		        }
		        else if( this.beats < 16 && this.beats % 2 == 1 ) {

			        this.changeGrow();
		        }
	            break;

		    case 11:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
				    this.removeSpheres();
				    geo.setSphereBlend( true );
				    this.nextBeat--;
			    }
			    break;

//	        case 13:
//		        if( this.nextBeat == 0 ) {
//
//			        this.changeFat();
//		        }
//		        else if( this.nextBeat == 1 ) {
//
//			        this.setFat( 0, 1 );
//			        this.setFat( 1, 0.5 );
//			        this.nextBeat--;
//		        }
//		        else {
//
//			        this.setFat( phi, 1 );
//			        geo.setSphereAdditive( 1.0 );
//			        geo.setStemColors( 0xFFFFFF );
//			        this.nextBeat--;
//		        }
//			    break;

		    case 17:
			    if( this.nextBeat == 0 ) {

				    this.changeFat();
			    }
			    else {

				    this.setFat( 0, 1 );
				    this.setFat( 1, 0.5 );
				    this.setSphereAdditive( 0.0 );
//				    geo.resetStemColors();
				    this.nextBeat--;
			    }
		        break;

	        case 18:
	        case 19:
		        if( this.nextBeat == 1 ) {

			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();

			        this.nextBeat--;
		        }

		        if( this.beats % 2 == 1 )
		            this.changeGrow();
	            break;

		    case 20:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
//				    geo.resetStemColors();

				    this.nextBeat--;
			    }

			    if( this.beats == 13 ) {

				    this.setGrow( 1, 0 );
				    this.setGrow( 1, 1 );
			    }
			    else if( this.beats < 14 && this.beats % 2 == 1 ) {

				    this.changeGrow();
			    }
		        break;

		    case 21:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
				    geo.setSphereBlend( true );
//				    geo.resetStemColors();

				    this.nextBeat--;
			    }
				break;

//	        case 19:
//		        this.changeFat();
//
//		        if( this.beats % 2 == 0 )
//		            this.changeGrow();
//	            break;

        }
        this.beats++;
    },

    // _______________________________________________________________________________________ Update

//    update: function() {
//
//	    // Update tiles
//	    var tiles = this.tiles,
//		    il = tiles.length,
//		    i;
//
//	    for( i = 0; i < il; i++ )
//		    tiles[ i ].update();
//
//	    this.explosions.update();
//    },

    update: function() {

	    var behaviours = this.behaviours,
		    i, il;

	    for( i = 0, il = behaviours.length; i < il; i++ )
	        behaviours[ i ].update();

	    this.explosions.update();

//	    if( this.state == 1 )
//	        this.geometries.updateDrops();
    },

	raycast: function() {

	    var origin = this.ray.origin,
	        mouse = this.mouse,
	        balls = this.balls,
	        ball, colliders, collider, other, i, il;

		mouse.x = LIGHTS.Input.mouseX;
		mouse.y = -LIGHTS.Input.mouseY;
		mouse.z = 0.5;

	    this.projector.unprojectVector( mouse, this.camera );

		mouse.x -= origin.x;
		mouse.y -= origin.y;
		mouse.z -= origin.z;
		mouse.normalize();

		// Rollover
	    colliders = this.mouseOverCollisions.rayCastAll( this.ray );

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].mouseOver = false;

		for( i = 0, il = colliders.length; i < il; i++ ) {

			collider = colliders[ i ];

			if( collider != null && collider.enabled ) {

				other = colliders.indexOf( collider.other );

				if( other != -1 )
					colliders[ other ] = null;

				ball = collider.ball;
				ball.mouseOver = true;

				if( ball.ball.visible && ! ball.selected && ! ball.unselected )
					ball.select();
			}
		}

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ball.selected && ! ball.mouseOver )
				ball.unselect( false );
		}

		// Click
		if( LIGHTS.Input.mouseClick ) {

			LIGHTS.Input.mouseClick = false;
			collider = this.clickCollisions.rayCastNearest( this.ray );

			if( collider !== null && (collider.ball.ball.visible || collider.ball.balloon.visible) )
					this.explosions.launchExplosion( collider.ball );
		}
	},

	unselect: function() {

	    var balls = this.balls,
	        ball, i, il;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ball.selected || ball.unselected )
				ball.unselect( true );
		}
	},


    // _______________________________________________________________________________________ Private

    showGroup: function( groupIndex, visible ) {

        var tiles = this.tiles,
		    behaviours = this.behaviours,
	        i, il, j, jl, group, child;

	    for( i = 0, il = tiles.length; i < il; i++ ) {

		    group = tiles[ i ].groups[ groupIndex ];

		    for( j = 0, jl = group.length; j < jl; j++ )
				group[ j ].visible = visible;
        }

	    for( i = 0, il = behaviours.length; i < il; i++ )
	        if( behaviours[ i ].groupIndex == groupIndex )
		        behaviours[ i ].visible = visible;

	    this.visibleGroups[ groupIndex ] = visible;
    },

	setState: function( state, force, ratio ) {

		var behaviours = this.behaviours,
			prevState = state - 1,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state < state && (force || (behaviour.state == prevState && Math.random() < ratio) ) )
				behaviour.setState( state );
		}

		this.state = state;
	},

	resetState: function( state ) {

		var behaviours = this.behaviours,
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			behaviours[ i ].setState( state );
	},

	setRotation: function() {

		var balls = this.balls,
			il = balls.length,
			i;

		for( i = 0; i < il; i++ )
			balls[ i ].setRotation();
	},

	removeSpheres: function() {

		var balls = this.balls,
			il = balls.length,
			i;

		for( i = 0; i < il; i++ )
			balls[ i ].removeSphere();
	},

	selectBallsAdditive: function( group ) {

		var tiles = this.tiles,
			groupBalls, ball, i, il, j, jl;

		for( i = 0, il = tiles.length; i < il; i++ ) {

			groupBalls = tiles[ i ].groups[ group ];

			for( j = 0, jl = groupBalls.length; j < jl; j++ ) {

				ball = groupBalls[ j ];
				ball.sphereMaterial.additive.value = ball.selectAdditive? 1.0 : 0.0;
			}
		}
	},

	setSphereAdditive: function( additive, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			if( notGroup || behaviours[ i ].groupIndex == group )
		        behaviours[ i ].additive = additive;

		this.geometries.setSphereAdditive( additive, group );
	},

	setSphereMultiplyAdditive: function( multiply, additive, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( notGroup || behaviours[ i ].groupIndex == group ) {

				behaviour.additive = additive;
				behaviour.multiply = multiply;
			}
		}

		this.geometries.setSphereMultiplyAdditive( multiply, additive, group );
	},

	setSphereMultiply: function( multiply, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			if( notGroup || behaviours[ i ].groupIndex == group )
		        behaviours[ i ].multiply = multiply;

		this.geometries.setSphereMultiply( multiply, group );
	},

    // _______________________________________________________________________________________ Fat

	activateFat: function( ok ) {

		var behaviours = this.behaviours,
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			behaviours[ i ].fatActive = ok;
	},

	changeFat: function() {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state == 0 )
				behaviour.fatTarget = 1 - behaviour.fatTarget;
		}
	},

	setFat: function( fat, ratio ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state == 0 && Math.random() < ratio )
				behaviour.fatTarget = fat;
		}
	},

    // _______________________________________________________________________________________ Grow

	activateGrow: function( ok ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];
			behaviour.growActive = ok;
//			behaviour.growTarget = ( Math.random() > 0.5 )? 1 : 0;
		}
	},

	changeGrow: function() {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state > 0 )
				behaviour.growTarget = 1 - behaviour.growTarget;
		}
	},

	setGrow: function( grow, groupIndex ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviours[ i ].groupIndex == groupIndex )
				behaviour.growTarget = grow;
		}
	}
};



// ___________________________________________________________________________________________ Tile

LIGHTS.BallsTile = function( manager, container ) {

	this.initialize( manager, container );
};

LIGHTS.BallsTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager, container ) {

        this.manager = manager;
		this.containerPosition = container.position;
		this.cameraPosition = manager.director.view.camera.position;

        this.children = [];
        this.balls = [];
		this.groups = [ [], [] ];

        var i, j, child, ball, visible, groupIndex;

        for( i = 0; i < manager.ballsPerTile; i++ ) {

	        groupIndex = i % 2;
	        ball = new LIGHTS.Ball( manager, container, i, groupIndex );

	        for( j = 0; j < ball.children.length; j++ )
				this.children.push( ball.children[ j ] );

	        // Save
	        this.groups[ groupIndex ].push( ball );
	        this.balls.push( ball );
	        manager.balls.push( ball );
        }

		// Update new groups
		for( i = 0; i < this.groups.length; i++ ) {

			group = this.groups[ i ];
			visible = manager.visibleGroups[ i ];

			for( j = 0; j < group.length; j++ ) {

				ball = group[ j ];
				ball.visible = visible;

//				ball.setState( this.ballState );
//				ball.ballGrow = this.ballGrow;
//				ball.ballFat = this.ballFat;
			}
		}

		// Debug
		// this.children.push( new THREE.Mesh( new THREE.SphereGeometry( 80, 12, 10 ), new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: true } )) );

        manager.tiles.push( this );
    },

    // _______________________________________________________________________________________ Update

//    update: function() {
//
//	    var balls = this.balls,
//		    i, il;
//
//		for( i = 0, il = balls.length; i < il; i++ )
//			balls[ i ].update();
//    },

	updateTile: function() {

	    var balls = this.balls,
		    ball, i, il;

//		for( i = 0, il = balls.length; i < il; i++ ) {
//
//			ball = balls[ i ];
//
//			if( ball.selected )
//				ball.unselect();
//		}
    }
};