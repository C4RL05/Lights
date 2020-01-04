/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 04/09/2011
 * Time: 14:03
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallBehaviour = function( manager, index ) {

	this.initialize( manager, index );
};

LIGHTS.BallBehaviour.prototype = {

	ballFat:                0.5,

	up:                     new THREE.Vector3( 0, 1, 0 ),
	h:                      new THREE.Vector3(),
	q:                      new THREE.Quaternion(),

	initialize: function( manager, index ) {

		this.index = index;
		this.groupIndex = index % 2;

		var terrain = manager.director.terrain;

		this.root = terrain.randomVertex.position;
		this.normal = terrain.randomNormal;
		this.terrainDisplacement = terrain.displacement;

		this.state = 0;
//		this.visible = true;
		this.visible = false;

		this.position = new THREE.Vector3();
		this.ballPosition = new THREE.Vector3();

		this.scale = this.rootScale = Math.random() * 0.5 + 0.25;
		this.scaleDown = 0;//-this.ballOffset * this.rootScale;

		this.fatActive = false;
		this.fat = this.fatTarget = 0;
		this.fatEase = Math.random() * 12 + 4;

		this.grow = this.growTarget = 0;

		this.stemLength = LIGHTS.BallGeometries.prototype.stemLength;
		this.colorIndex = this.groupIndex * 3 + Math.floor( Math.random() * 3 );

		if( LIGHTS.BallGeometries.prototype.groupBehaviours[ this.groupIndex ] === undefined )
			LIGHTS.BallGeometries.prototype.groupBehaviours[ this.groupIndex ] = this;

		this.additive = 0;
		this.multyiply = 0;
		this.balls = [];
	},

    // _______________________________________________________________________________________ State

	setState: function( state ) {

		var balls = this.balls,
			i, il;

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].setState( state );

		switch( state ) {

			case 0:
				this.fatActive = false;
				this.growActive = false;
				this.fat = this.fatTarget = 0;
				this.grow = this.growTarget = 0;
				this.additive = 1;

				this.scale = this.rootScale;
				this.setPosition( this.scaleDown );
				this.setRotation();
				this.setScale();
				break;

			case 1:
				this.growActive = true;
				this.growTarget = 1;
				this.setRotation();
				this.setScale();
				break;

			case 2:
				this.ballPosition.copy( this.position );
				this.height = this.position.y + Math.random() * 50 + 25;
				this.ease = Math.random() * 0.2 + 0.2;
				this.growTarget = 0;
				break;

			case 3:
			case 4:
				break;
		}

		this.state = state;
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var deltaTime = LIGHTS.deltaTime;

		var balls = this.balls,
			i, il, ball;

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].update();

		// State
		switch( this.state ) {

			case 0:
				// Fat
				if( this.fatActive ) {

					this.fat -= (this.fat - this.fatTarget) * deltaTime * this.fatEase;

					if( this.fatTarget == 1 )
						this.fat = Math.min( this.fat, this.fatTarget );
					else if( this.fatTarget == 0 )
						this.fat = Math.max( this.fat, this.fatTarget );

					this.scale = this.rootScale * (1 + this.fat * this.ballFat);
					this.setScale();
				}

				// Displacement
				if( this.terrainDisplacement.active ) {

					this.setPosition( this.scaleDown );
					this.setRotation();
				}
				break;

			case 1:

				// Grow
				this.grow -= (this.grow - this.growTarget) * deltaTime * 2.5;

				if( this.growTarget == 1 )
					this.grow = Math.min( this.grow, this.growTarget );
				else if( this.growTarget == 0 )
					this.grow = Math.max( this.grow, this.growTarget );

				this.setPosition( this.grow * this.stemLength * this.scale );

				// Displacement
				if( this.terrainDisplacement.active )
					this.setRotation();
				break;

			case 2:
				// Grow
				this.scale -= this.scale * deltaTime * 8;

				if( this.scale < 0.05 )
					this.scale = 0.01;

				this.setScale();

//				this.setPosition( this.grow * this.stemLength * this.scale, true );

				// Launch ball
				this.ballPosition.y -= (this.position.y - this.height) * deltaTime * this.ease;
				break;

			case 3:
			case 4:
				break;
		}
	},

    // _______________________________________________________________________________________ Transform

	setPosition: function( scaleMult ) {

		var balls = this.balls,
			p = this.position,
			normal = this.normal,
			root = this.root,
			pX, pY, pZ, ball, pos, i, il;

		pX = p.x = root.x + normal.x * scaleMult;
		pY = p.y = root.y + normal.y * scaleMult;
		pZ = p.z = root.z + normal.z * scaleMult;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ! ball.selectGrow ) {

				pos = ball.ball.position;
				pos.x = pX;
				pos.y = pY;
				pos.z = pZ;
			}
		}
	},

	setRotation: function() {

		var balls = this.balls,
			from = this.up,
			to = this.normal,
			q = this.q,
			h = this.h,
			i, il, ball;

        h.add( from, to );
        h.normalize();

		q.w = from.dot( h );
        q.x = from.y * h.z - from.z * h.y;
        q.y = from.z * h.x - from.x * h.z;
        q.z = from.x * h.y - from.y * h.x;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			ball.ball.quaternion.copy( q );
		}
	},

	setScale: function() {

		var balls = this.balls,
			scale = this.scale,
			i, il, ball, objectScale;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ! ball.selectGrow ) {

				objectScale = ball.ball.scale;
				objectScale.x =	objectScale.y =	objectScale.z = scale;
			}
		}
	}
}
