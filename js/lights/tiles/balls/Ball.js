/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 06/08/2011
 * Time: 10:01
 * To change this template use File | Settings | File Templates.
 */

// ___________________________________________________________________________________________ TileBall

LIGHTS.Ball = function( manager, container, index, groupIndex ) {

	this.initialize( manager, container, index, groupIndex );
};

LIGHTS.Ball.prototype = {

	testMode:               false,

	groupSelectAdd:         [ [ 0, 0, 1 ], [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 0, 0 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ],
	selectAddIntensity:     0.7,

	// _______________________________________________________________________________________ Constructor

	initialize: function( manager, container, index, groupIndex ) {

		this.manager = manager;
		this.container = container;

		// Behaviour
		this.behaviour = manager.behaviours[ index ];
		this.behaviour.balls.push( this );

		// Ball
		this.geometries = manager.geometries,
		this.terrainDisplacement = manager.director.terrain.displacement;
		this.scene = manager.director.view.scene;
		this.children = [];
		this.visible = false;
		this.state = 0;
		this.interactive = false;
		this.selected = false;
		this.unselected = false;
		this.mouseOver = false;
		this.selectGrow = false;
		this.selectMultiply = false;
		this.selectAdditive = false;
		this.selectedPhase = 0;
		this.alpha = 0;

		this.ballSize = LIGHTS.BallGeometries.prototype.ballSize;
		this.ballOffset = LIGHTS.BallGeometries.prototype.ballSize * 0.86;
		this.stemLength = LIGHTS.BallGeometries.prototype.stemLength;

		var	geometries = this.geometries,
			colorIndex = this.behaviour.colorIndex,
			i, mesh, geometry;

		// Spheres
		this.colorIndex = colorIndex;
		geometry = geometries.sphereGeometries[ colorIndex ];
		this.sphereGeometry = geometry;
		this.sphereMaterial = geometries.createSphereMaterial( groupIndex );
		this.addR = this.sphereMaterial.addR;
		this.addG = this.sphereMaterial.addG;
		this.addB = this.sphereMaterial.addB;
		mesh = new THREE.Mesh( geometry, this.sphereMaterial );
//		mesh.dynamic = true;
		mesh.useQuaternion = true;
		mesh.interactive = true;
		mesh.active = false;
		this.ball = mesh;
		this.children.push( mesh );

		this.selectAddR = this.groupSelectAdd[ colorIndex ][ 0 ] * this.selectAddIntensity;
		this.selectAddG = this.groupSelectAdd[ colorIndex ][ 1 ] * this.selectAddIntensity;
		this.selectAddB = this.groupSelectAdd[ colorIndex ][ 2 ] * this.selectAddIntensity;
		this.selectAdd = 0;

		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// Stem
//		mesh = new THREE.Mesh( geometries.stemGeometry, geometries.stemMaterial );
//		mesh.useQuaternion = true;
//		mesh.interactive = true;
//		mesh.active = false;
//		this.stem = mesh;
//		this.children.push( mesh );

		// Balloon
		geometry = geometries.balloonGeometries[ colorIndex ];
		mesh = new THREE.Mesh( geometry, this.sphereMaterial );
		mesh.useQuaternion = true;
		mesh.interactive = true;
		mesh.active = false;
		this.balloon = mesh;
		this.children.push( mesh );

		// Rotation
		this.rotation = new THREE.Quaternion();
		this.rotation.setFromEuler( new THREE.Vector3( 0, 0, 5 ) );

		// Scale
		this.scale = this.behaviour.scale;
		this.grow = this.growTarget = 0;

		// Colliders
		this.colliderRoot = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderRoot.mesh = this.ball;
		this.colliderRoot.ball = this;
		manager.mouseOverCollisions.colliders.push( this.colliderRoot );

		this.colliderBall = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderBall.mesh = this.ball;
		this.colliderBall.ball = this;
		manager.mouseOverCollisions.colliders.push( this.colliderBall );

		this.colliderBall.other = this.colliderRoot;
		this.colliderRoot.other = this.colliderBall;
		this.colliderBall.enabled = true;

		this.colliderClick = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderClick.mesh = this.balloon;
		this.colliderClick.ball = this;
		manager.clickCollisions.colliders.push( this.colliderClick );

		// State
		this.setState( this.state );

		if( this.testMode ) {

			this.trident = new THREE.Trident();
			this.trident.scale.x = this.trident.scale.y = this.trident.scale.z = 0.4;
			manager.director.view.scene.addChild( this.trident );
		}

//		this.colliderHelper = new THREE.Mesh( new THREE.SphereGeometry( 16, 10, 10 ), new THREE.MeshBasicMaterial( { wireframe: true, color:0xff0000, depthTest: false}));
//		this.colliderHelper.position = this.colliderClick.center;
//		manager.director.view.scene.addChild( this.colliderHelper );
	},

    // _______________________________________________________________________________________ State

	setState: function( state ) {

		switch( state ) {

			case 0:
				this.interactive = this.selected = this.unselected = false;

				this.mouseOver = false;
				this.selectGrow = false;
				this.selectMultiply = false;
				this.selectAdditive = false;
				this.grow = this.growTarget = 0;

				this.ball.active = true;
				this.balloon.active = false;

				this.colliderRoot.enabled = false;
				break;

			case 1:
				this.ball.active = true;

				if( this.selected )
					this.unselect( true );

				this.colliderRoot.enabled = true;

				var ballScale = this.balloon.scale;
				ballScale.x = ballScale.y = ballScale.z = this.behaviour.scale;
				break;

			case 2:
//				this.ball.active = false;

//				this.stem.active = this.stem.visible = true;

//				if( this.stem.parent !== this.container )
//				    THREE.MeshUtils.addChild( this.scene, this.container, this.stem );

				this.balloon.active = this.balloon.visible = true;

				if( this.balloon.parent !== this.container )
				    THREE.MeshUtils.addChild( this.scene, this.container, this.balloon );

				this.colliderRoot.enabled = false;
				break;

			case 3:
				if( this.selected )
					this.unselect();

//				this.balloon.active = true;
				this.colliderRoot.enabled = false;
				break;

			case 4:
				if( this.selected )
					this.unselect();

//				this.balloon.active = true;
				this.colliderClick.radiusSq = this.colliderClick.radius = 0;
				break;
		}

		this.state = state;
	},

	select: function() {

		if( this.unselected && this.selectedPhase != LIGHTS.Music.phase.index )
			return;

		this.interactive = this.selected = true;
		this.unselected = false;

		this.selectedPhase = LIGHTS.Music.phase.index;
		this.scale = this.behaviour.scale;

		switch( LIGHTS.Music.phase.index ) {

		    case 1:
		    case 2:
				this.selected = false;
		        break;

			case 3:
			case 4:
			case 5:
			case 6:
			case 8:
				this.selectGrow = true;
				this.growTarget = 1;

				this.setRotation();
				this.setScale();
				this.selectAdditive = true;
				break;

			case 7:
				this.selectMultiply = true;
				this.behaviour.multiply = 1;
				break;

			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
				if( this.state == 0 ) {

					this.selectGrow = true;
					this.growTarget = 1;

					this.setRotation();
					this.setScale();
				}
				else {

					this.selectGrow = false;
				}

				this.selectAdditive = true;
				break;
		}
	},

	unselect: function( force ) {

//		console.log( "unselect", force, this.selectedPhase, LIGHTS.Music.phase.index);

		this.unselected = true;

		switch( this.selectedPhase ) {

			case 3:
			case 4:
			case 5:
				if( force ) {

					this.interactive = this.unselected = this.selectAdditive = false;
					this.addR.value = this.selectAddR;
					this.addG.value = this.selectAddG;
					this.addB.value = this.selectAddB;
					this.selectAdd = 1;
				}

				this.selected = false;
				break;

			case 6:
				if( force )
					this.selected = false;
				else
					this.selected = (this.grow <= 0.99);
				break;

			case 7:
				if( force ) {
					this.interactive = this.unselected = this.selectMultiply = false;
					this.behaviour.multiply = 1;
					this.sphereMaterial.multiply.value = 1.0;
				}
				else {
					this.behaviour.multiply = 0;
				}

				this.selected = false;
				break;

			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
				if( this.state == 0 ) {

					this.selected = force? false : (this.grow <= 0.99);
				}
				else if( force ) {

					this.interactive = this.unselected = this.selectAdditive = false;
					this.addR.value =
					this.addG.value =
					this.addB.value = 0;
					this.selectAdd = 0;
				}

				this.selected = false;
				break;
		}
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var deltaTime = LIGHTS.deltaTime,
			behaviour = this.behaviour,
			easing;

		// Visible
		if( this.visible && this.container.visible ) {

			this.ball.visible = this.ball.active;
			this.balloon.visible = this.balloon.active;
		}
		else {

			this.ball.visible =
			this.balloon.visible = false;
		}

		// Additive
		if( this.selectAdditive ) {

			if( this.selected ) {

				easing = deltaTime * 10;
				this.addR.value -= (this.addR.value - this.selectAddR) * easing;
				this.addG.value -= (this.addG.value - this.selectAddG) * easing;
				this.addB.value -= (this.addB.value - this.selectAddB) * easing;
				this.selectAdd -= (this.selectAdd - 1) * easing;
			}
			else if( this.unselected ) {

				easing = deltaTime * 10;
				this.addR.value -= this.addR.value * easing;
				this.addG.value -= this.addG.value * easing;
				this.addB.value -= this.addB.value * easing;
				this.selectAdd -= this.selectAdd * easing;

				if( this.selectAdd < 0.01 ) {

					this.addR.value =
					this.addG.value =
					this.addB.value = 0;
					this.selectAdd = 0;
					this.selectAdditive = false;

					if( ! this.selectGrow )
						 this.interactive = this.unselected = false;
				}
			}
		}

		// Spikes
//		var updateVertices = false;
//
//		if( this.selected && this.alpha < 0.99 ) {
//
//			this.alpha -= (this.alpha - 1) * deltaTime * 5;
//			updateVertices = true;
//		}
//		else if( this.alpha > 0 ) {
//
//			this.alpha -= (this.alpha - 0) * deltaTime * 10;
//
//			if( this.alpha < 0.01 )
//				this.alpha = 0;
//
//			updateVertices = true;
//		}
//
//		if( updateVertices )
//			this.geometries.tweenSphereSpikes( this.ball.geometry, this.alpha );

		// State
		switch( this.state ) {

			case 0:
				if( this.selectGrow ) {

					if( this.selected ) {

						// Grow
						this.grow -= (this.grow - 0.3) * deltaTime * 4;
						this.scale -= (this.scale - behaviour.rootScale * 1.5) * deltaTime * 4;

						if( this.grow > 0.29 && this.unselected )
							this.selected = false;
					}
					else if( this.unselected ) {

						// Grow
						this.grow -= (this.grow - 0) * deltaTime * 4;
						this.scale -= (this.scale - behaviour.scale) * deltaTime * 12;

						if( this.grow < 0.01 ) {

							this.interactive = this.unselected = this.selectGrow = false;
							this.scale = behaviour.scale;
						}
					}

					this.setPosition( this.grow * this.stemLength * this.scale );
					this.setScale();

					// Displacement
//					if( this.terrainDisplacement.active )
//						this.setRotation();
				}
				else if( this.selectMultiply ) {

					if( this.selected ) {

						if( this.sphereMaterial.multiply.value < 1 ) {

							this.sphereMaterial.multiply.value -= (this.sphereMaterial.multiply.value - 1) * deltaTime * 10;

							if( this.sphereMaterial.multiply.value > 0.99 )
								this.sphereMaterial.multiply.value = 1;
						}
					}
					else if( this.unselected ) {

						this.sphereMaterial.multiply.value -= (this.sphereMaterial.multiply.value - 0) * deltaTime * 10;

						if( this.sphereMaterial.multiply.value < 0.01 ) {

							this.sphereMaterial.multiply.value = 0;
							this.interactive = this.unselected = this.selectMultiply = false;
						}
					}
				}
				break;

			case 1:

				if( this.selectGrow ) {

					this.grow -= (this.grow - behaviour.grow) * deltaTime * 4;
					this.scale -= (this.scale - behaviour.scale) * deltaTime * 8;

					if( Math.abs( this.grow - behaviour.grow ) < 0.01 ) {

						this.interactive = this.unselected = this.selectGrow = false;
						this.grow = behaviour.grow;
						this.scale = behaviour.scale;
					}

					this.setPosition( this.grow * this.stemLength * this.scale );
					this.setScale();
				}
				break;

			case 2:
				// Grow
//				if( this.ball.parent !== null && this.ball.parent !== undefined ) {
//
//					if( behaviour.scale == 0.01 ) {
//
//						this.ball.active = this.ball.visible = false;
//
//						if( this.ball.parent === this.container )
//							THREE.MeshUtils.removeChild( this.scene, this.container, this.ball );
//					}
//				}

				// Launch ball
				if( this.balloon.active ) {

					this.balloon.position.copy( behaviour.ballPosition );
					this.ball.position.copy( behaviour.ballPosition );
					this.balloon.quaternion.multiplySelf( this.rotation );
				}
				break;

			case 3:
				this.sphereMaterial.multiply.value -= this.sphereMaterial.multiply.value * deltaTime * 2;

				if( this.sphereMaterial.multiply.value < 0.01 ) {

					this.balloon.active = this.balloon.visible = false;

					if( this.balloon.parent === this.container )
						THREE.MeshUtils.removeChild( this.scene, this.container, this.balloon );

					this.colliderClick.radiusSq = this.colliderClick.radius = 0;
				}
				break;

			case 4:
				var ballScale = this.balloon.scale;
				ballScale.x = Math.max( 0.001, ballScale.x - deltaTime * 8 );
				ballScale.y = ballScale.z = ballScale.x;
				break;
		}

		// Colliders
		var root = behaviour.root,
			scale = Math.max( this.scale, behaviour.scale );

		this.colliderRoot.center.x = root.x + this.container.position.x;
		this.colliderRoot.center.y = root.y + this.container.position.y;
		this.colliderRoot.center.z = root.z + this.container.position.z;

		this.colliderBall.center.x = this.ball.position.x + this.container.position.x;
		this.colliderBall.center.y = this.ball.position.y + this.container.position.y;
		this.colliderBall.center.z = this.ball.position.z + this.container.position.z;

		this.colliderRoot.radius = this.colliderBall.radius = scale * this.ballSize * phi * 2;
		this.colliderRoot.radiusSq = this.colliderBall.radiusSq = this.colliderBall.radius * this.colliderBall.radius;

		if( this.state < 2 ) {

			this.colliderClick.center.x = this.colliderBall.center.x;
			this.colliderClick.center.y = this.colliderBall.center.y;
			this.colliderClick.center.z = this.colliderBall.center.z;

			this.colliderClick.radius = scale * this.ballSize;
			this.colliderClick.radiusSq = this.colliderClick.radius * this.colliderClick.radius;
		}
		else {

			this.colliderClick.center.x = this.balloon.position.x + this.container.position.x;
			this.colliderClick.center.y = this.balloon.position.y + this.container.position.y;
			this.colliderClick.center.z = this.balloon.position.z + this.container.position.z;
		}

//		this.colliderHelper.scale.x = this.colliderHelper.scale.y = this.colliderHelper.scale.z = scale;

		// Test mode
		if( this.testMode ) {

			this.trident.position.add( this.ball.position, this.container.position );

			if( this.selected ) {

				this.trident.rotation.x = -rad90;
				this.trident.rotation.z = 0;
			}
			else if( this.unselected ) {

				this.trident.rotation.x = 0;
				this.trident.rotation.z = rad90;
			}
			else {

				this.trident.rotation.x = 0;
				this.trident.rotation.z = 0;
			}
		}
	},

	removeSphere: function() {

		this.ball.active = this.ball.visible = false;

		if( this.ball.parent === this.container )
			THREE.MeshUtils.removeChild( this.scene, this.container, this.ball );
	},


    // _______________________________________________________________________________________ Transform

	setPosition: function( scaleMult ) {

		var root = this.behaviour.root,
			normal = this.behaviour.normal,
			pX, pY, pZ, pos;

		pX = root.x + normal.x * scaleMult;
		pY = root.y + normal.y * scaleMult;
		pZ = root.z + normal.z * scaleMult;

		pos = this.ball.position;
		pos.x = pX;
		pos.y = pY;
		pos.z = pZ;

		if( this.balloon.active ) {

			pos = this.balloon.position;
			pos.x = pX;
			pos.y = pY;
			pos.z = pZ;
		}
	},

	setRotation: function() {

		var behaviour = this.behaviour,
			from = behaviour.up,
			to = behaviour.normal,
			q = behaviour.q,
			h = behaviour.h;

        h.add( from, to );
        h.normalize();

		q.w = from.dot( h );
        q.x = from.y * h.z - from.z * h.y;
        q.y = from.z * h.x - from.x * h.z;
        q.z = from.x * h.y - from.y * h.x;

		this.ball.quaternion.copy( q );

		if( this.balloon.active )
			this.balloon.quaternion.copy( q );
	},

	setScale: function() {

		var scale = this.scale,
			objectScale = this.ball.scale;

		objectScale.x =	objectScale.y =	objectScale.z = scale;

		if( this.balloon.active ) {

			objectScale = this.balloon.scale;
			objectScale.x =	objectScale.y = objectScale.z = scale;
		}
	}
};
