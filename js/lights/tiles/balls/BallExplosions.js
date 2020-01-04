/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 02/09/2011
 * Time: 17:49
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallExplosions = function( manager, container, index, groupIndex ) {

	this.initialize( manager );
};

LIGHTS.BallExplosions.prototype = {

	explosionCount:     16,
	explosionPool:      [],
	explosions:         [],

	particleMaps:       [ 'plasmaRed', 'plasmaYellow', 'plasmaGreen', 'plasmaCyan', 'plasmaBlue', 'plasmaMagenta', 'plasmaWhite' ],
	ballColorTable:     [ [ 1, 0 ], [ 5, 0 ], [ 1, 2 ], [ 3, 2 ], [ 3, 4 ], [ 5, 4 ] ],


	// _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

		this.scene = manager.director.view.scene;

		var material, texture, i, il;

		// Materials
		this.materials = [];

		for( i = 0, il = this.particleMaps.length; i < il; i++ ) {

			texture = new THREE.Texture( LIGHTS.images[ this.particleMaps[ i ] ] );
			texture.needsUpdate = true;

			material = new THREE.ParticleBasicMaterial({
				vertexColors: true,
				size: 16,
				map: texture,
				blending: THREE.AdditiveBlending,
				transparent: true
			});

			this.materials.push( material );
		}

		// Explosions
		for( i = 0, il = this.explosionCount; i < il; i++ ) {

			explosion = new LIGHTS.BallExplosion( material );
			this.explosionPool.push( explosion );
			this.explosions.push( explosion );
		}
	},

	launchExplosion: function( ball ) {

		var explosion = this.explosionPool.pop();

		if( explosion !== undefined ) {

			THREE.MeshUtils.addChild( this.scene, this.scene, explosion.particleSystem );
			explosion.particleSystem.visible = true;

			var materialIndex = 6;

			if( LIGHTS.Music.phase.index > 2 )
				materialIndex = this.ballColorTable[ ball.colorIndex ][ Math.floor( Math.random() * 2 ) ];

			explosion.particleSystem.materials[ 0 ] = this.materials[ materialIndex ];
			explosion.launch( ball );
		}
	},

	update: function() {

		var explosions = this.explosions,
			i, il, explosion;

		// Update
		for( i = 0, il = explosions.length; i < il; i++ ) {

			explosion = explosions[ i ];

			if( explosion.active )
				explosion.update();
		}

		// Remove finished
		for( i = 0, il = explosions.length; i < il; i++ ) {

			explosion = explosions[ i ];

			if( explosion.active && explosion.life < 0 ) {

				explosion.particleSystem.visible = explosion.active = false;
				THREE.MeshUtils.removeChild( this.scene, this.scene, explosion.particleSystem );
				this.explosionPool.push( explosion );
			}
		}
	}
};

LIGHTS.BallExplosion = function( material ) {

	this.initialize( material );
};

LIGHTS.BallExplosion.prototype = {

	particleCount:      512,
	gravityStream:      -256,
	gravityExplosion:   0,

	// _______________________________________________________________________________________ Constructor

	initialize: function( material ) {

		var i, il, particle, colors;

		this.particleGeometry = new THREE.Geometry();
		this.particles = [];
		colors = this.particleGeometry.colors = [];

		for( i = 0, il = this.particleCount; i < il; i++ ) {

			particle = new THREE.Vector3();
			particle.x = Math.random() * 32 - 16;
			particle.y = Math.random() * 32 - 16;
			particle.z = Math.random() * 32 - 16;

			particle.velocity = new THREE.Vector3();
			particle.color = new THREE.Color( 0x000000 );

		    this.particles.push( particle );
		    this.particleGeometry.vertices.push( new THREE.Vertex( particle ) );
		    colors.push( particle.color );
		}

		this.particleSystem = new THREE.ParticleSystem( this.particleGeometry, material );
		this.particleSystem.sortParticles = false;
		this.particleSystem.dynamic = true;
		this.particleSystem.visible = false;
//		this.position = this.particleSystem.position;

		this.active = false;
	},

	launch: function( ball ) {

		this.ball = ball;

		if( ball.state > 3 )
			return;

		var particles = this.particles,
			colors = this.colors,
			isFlying = (ball.state >= 2),
			i, il, u, a, r, particle, color, velocity, speed, speedY;

		if( isFlying )
			ball.setState( 4 );

		for( i = 0, il = particles.length; i < il; i++ ) {

			particle = particles[ i ];

			if( isFlying ) {

				u = Math.random() * 2 - 1;
				speed = speedY = Math.random() * 96 + 64;
				particle.life = Math.random() * 0.2 + 0.2;
				particle.delay = Math.random() * 0.1 + 0.08;
			}
			else {

				u = Math.random() * 0.5 + 0.5;
				speedY = Math.random() * 256 + 128;
				speed = Math.random() * 64 + 64;
				particle.delay = Math.random() * 0.5;
			}

			a = Math.random() * rad360;
			r = Math.sqrt( 1 - u * u );

			velocity = particle.velocity;
			velocity.x = Math.cos( a ) * r * speed;
			velocity.y = u * speedY;
			velocity.z = Math.sin( a ) * r * speed;

			if( ! isFlying )
				ball.ball.quaternion.multiplyVector3( velocity );

			particle.drag = Math.random() * 0.01 + 0.005;
			particle.color.r = particle.color.g = particle.color.b = 0;
			particle.intensity = Math.random() * 0.3 + 0.7;
			particle.launch = false;
		}

		this.life = 2;
		this.active = true;
	},

	update: function() {

		var deltaTime = LIGHTS.deltaTime,
			particleGeometry = this.particleGeometry,
			particles = this.particles,
			ball = this.ball,
			isFlying = (ball.state >= 2),
			gravity = (isFlying? this.gravityExplosion : this.gravityStream) * deltaTime,
			ballPos = isFlying? ball.balloon.position : ball.ball.position,
			containerPos = ball.container.position,
			ballNormal = ball.behaviour.normal,
			ballRadius = isFlying? 0 : ball.scale * ball.ballSize - 2.5,
			pX = ballPos.x + containerPos.x + ballRadius * ballNormal.x,
			pY = ballPos.y + containerPos.y + ballRadius * ballNormal.y,
			pZ = ballPos.z + containerPos.z + ballRadius * ballNormal.z,
			i, il, particle, velocity, color;

		for( i = 0, il = particles.length; i < il; i++ ) {

			particle = particles[ i ];

			if( particle.delay < 0 ) {

				velocity = particle.velocity;
				particle.x += velocity.x * deltaTime;
				particle.y += velocity.y * deltaTime;
				particle.z += velocity.z * deltaTime;
				velocity.y += gravity;

				drag = 1 - particle.drag * deltaTime;
				velocity.x *= drag;
				velocity.y *= drag;
				velocity.z *= drag;

				if( particle.launch ) {

					color = particle.color;
					color.r = color.g = color.b = particle.intensity;
					particleGeometry.__dirtyColors = true;

					particle.launch = false;
				}

				if( isFlying ) {

					particle.life -= deltaTime;

					if( particle.life < 0 ) {

						if( particle.life > -0.25 ) {

							color = particle.color;
							color.r = particle.intensity * (1 + particle.life * 4);
							color.g = color.b = color.r;
							particleGeometry.__dirtyColors = true;
						}
						else {

							color = particle.color;
							color.r = color.g = color.b = 0;
							particleGeometry.__dirtyColors = true;
						}
					}
				}
				else if( velocity.y < 0 ) {

					color = particle.color;
					color.r = color.g = color.b = Math.min( 1, -particle.intensity * 10 / velocity.y );
					particleGeometry.__dirtyColors = true;
				}
			}
			else {

				particle.delay -= deltaTime;

				if( particle.delay < 0 ) {

					particle.x = pX;
					particle.y = pY;
					particle.z = pZ;

					particle.launch = true;
				}
			}
		}

		particleGeometry.__dirtyVertices = true;
		this.life -= deltaTime;
	}
};