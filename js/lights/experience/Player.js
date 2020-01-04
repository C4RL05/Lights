/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 11/07/2011
 * Time: 17:14
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Player = function( director ) {

	this.initialize( director );
};

LIGHTS.Player.prototype = {

    playerPan:          0.25,
    playerPanFast:      0.75,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

		this.director = director;

		this.isCamera = ! LIGHTS.View.prototype.options.debugView;

		if( this.isCamera ) {

			this.camera = director.view.camera;
			this.cameraPosition = this.camera.position;
			this.targetPosition = this.camera.target.position;
			this.targetPosition.x = 0;
			this.targetPosition.y = 60;
			this.targetPosition.z = -100;
			this.camera.useTarget = false;
			this.camera.matrixAutoUpdate = false;
		}
		else {

			this.camera = new THREE.Object3D();
			var trident = new THREE.Trident();
			trident.position.y = 100;
			this.camera.addChild( trident );
		    director.view.scene.addChild( this.camera );
			this.targetPosition = new THREE.Object3D().position;
		}

        this.frustum = 60 * deg2rad;
        this.angle = 30 * deg2rad;
        this.forward = new THREE.Vector2( 0, -1 );
        this.right = new THREE.Vector2( 1, 0 );
        this.cameraUp = new THREE.Vector3();
		this.rollAxis = new THREE.Vector3();
		this.auxMatrix = new THREE.Matrix4();

		this.altitude = this.altitudeOrigin = this.altitudeTarget = 0;
		this.fov = this.fovOrigin = this.fovTarget = 0;
		this.tilt = this.tiltOrigin = this.tiltTarget = 0;
		this.velocity = this.velocityOrigin = this.velocityTarget = 0;
		this.cameraTilt = this.roll = 0;

		this.turbo = 1;
		this.alpha = 1;
		this.duration = 1;
	},

    // _______________________________________________________________________________________ Update

    update: function( immediate ) {

        var input = LIGHTS.Input,
            deltaTime = LIGHTS.deltaTime,
            move = 0,
	        userMult;

        if( ! LIGHTS.releaseBuild && input.keyDown )
            return;

	    immediate = (immediate !== undefined);
	    userMult = immediate? 0 : 1;
	    deltaTime *= userMult;

	    if( ! immediate ) {

		    // Tween
		    if( this.alpha < 1 && ! immediate ) {

			    // Alpha
			    this.alpha += deltaTime / this.duration;

			    if( this.alpha > 1 )
			        this.alpha = 1;

			    var alpha = (Math.sin( this.alpha * rad180 - rad90 ) + 1) * 0.5,
			        alphaMinus = 1 - alpha;

			    this.altitude = this.altitudeOrigin * alphaMinus + this.altitudeTarget * alpha;
			    this.tilt = this.tiltOrigin * alphaMinus + this.tiltTarget * alpha;
			    this.velocity = this.velocityOrigin * alphaMinus + this.velocityTarget * alpha;

			    if( this.isCamera ) {

				    this.fov = this.fovOrigin * alphaMinus + this.fovTarget * alpha;

				    if( this.camera.fov != this.fov ) {

					    this.camera.fov = this.fov;
			            this.camera.updateProjectionMatrix();
					}
			    }
		    }

		    // Turbo
		    if( input.mouseDown )
				this.turbo -= (this.turbo - 2.5) * deltaTime * 4;
		    else
				this.turbo -= (this.turbo - 1) * deltaTime * 2;

			// Move
			move = deltaTime * this.velocity * this.turbo;

			// Steer
			this.angle -= input.mouseX * this.turbo * deltaTime * this.velocity * 0.001;
	    }

		// Update
        this.cameraPosition.x += this.forward.x * move;
	    this.cameraPosition.y = this.altitude;
        this.cameraPosition.z += this.forward.y * move;

		this.targetPosition.x = this.cameraPosition.x - Math.sin( this.angle ) * this.targetDistance;
		this.targetPosition.y = this.cameraPosition.y;
		this.targetPosition.z = this.cameraPosition.z - Math.cos( this.angle ) * this.targetDistance;

        if( ! this.isCamera ) {

			this.director.view.camera.position.x = this.cameraPosition.x;
			this.director.view.camera.position.z = this.cameraPosition.z;
        }

	    // Roll
	    this.roll -= (this.roll - (userMult * input.mouseX * this.velocity * 0.001)) * deltaTime * 0.3 * this.turbo;
	    this.rollAxis.sub( this.cameraPosition, this.targetPosition );
	    this.rollAxis.normalize();
	    this.cameraUp.x = this.cameraUp.z = 0; this.cameraUp.y = 1;
	    this.auxMatrix.setRotationAxis( this.rollAxis, -this.roll );
	    this.auxMatrix.rotateAxis( this.cameraUp );
	    this.camera.matrix.lookAt( this.cameraPosition, this.targetPosition, this.cameraUp );

	    // Tilt
	    this.cameraTilt -= (this.cameraTilt + (userMult * input.mouseY * this.velocity * 0.0005) + this.tilt) * deltaTime * 2;
	    this.auxMatrix.setRotationX( this.cameraTilt );
	    this.camera.matrix.multiply( this.camera.matrix, this.auxMatrix );

	    // Position
	    this.camera.matrix.setPosition( this.cameraPosition );
	    this.camera.update( null, true, this.camera );

	    // Update target
	    this.targetPosition.x = this.targetPosition.y = 0;
	    this.targetPosition.z = -this.targetDistance;// * this.velocity * 0.1;
	    this.camera.matrix.multiplyVector3( this.targetPosition );

	    // Update FWD>>
	    this.forward.x = -Math.sin( this.angle );
	    this.forward.y = -Math.cos( this.angle );

	    this.right.x = -Math.sin( this.angle + rad90 );
	    this.right.y = -Math.cos( this.angle + rad90 );
    },

    // _______________________________________________________________________________________ Launch

	launch: function() {

		this.targetDistance = 150;

		if( this.isCamera ) {

			switch( LIGHTS.Music.phase.index ) {

				case 0:
					this.camera.fov = this.fov = this.fovTarget = 25;
					this.camera.updateProjectionMatrix();

					this.cameraPosition.y = this.altitude = -40;
					this.altitudeTarget = 60;
					this.cameraTilt = this.tilt = -rad90 * 0.1;
					this.tiltTarget = rad90 * 0.1;
					this.velocity = this.velocityTarget = 0;
					this.alpha = 1;

					this.targetPosition.x = this.cameraPosition.x - Math.sin( this.angle ) * this.targetDistance;
					this.targetPosition.y = this.cameraPosition.y;
					this.targetPosition.z = this.cameraPosition.z - Math.cos( this.angle ) * this.targetDistance;

					this.update( true );
					this.tween( 8 );
					break;

				case 1:
//					this.fovTarget = 25;
					this.velocityTarget = 150;
//					this.tiltTarget = rad90 * 0.1;
					this.tween( 1 );
					break;

				case 3:
					this.fovTarget = 30;
					this.altitudeTarget = 110;
//					this.tiltTarget = rad90 * 0.15;
					this.velocityTarget = 250;
					this.tween( 4 );
					break;

				case 7:
					this.altitudeTarget = 80;
					this.tiltTarget = rad90 * 0.1;
					this.velocityTarget = 150;
					this.tween( 2 );
					break;

				case 9:
					this.altitudeTarget = 120;
					this.tiltTarget = rad90 * 0.15;
					this.velocityTarget = 200;
					this.tween( 4 );
					break;

				case 11:
					this.altitudeTarget = 80;
					this.tiltTarget = rad90 * 0.1;
					this.velocityTarget = 250;
					this.tween( 4 );
					break;

				case 13:
					this.altitudeTarget = 200;
					this.fovTarget = 40;
					this.tiltTarget = rad90 * 0.3;
					this.velocityTarget = 200;
					this.tween( 4 );
					break;

				case 15:
					this.altitudeTarget = 200;
					this.fovTarget = 40;
					this.tiltTarget = rad90 * 0.2;
					this.velocityTarget = 200;
					this.tween( 8 );
					break;

				case 16:
//					this.altitudeTarget = 80;
//					this.fovTarget = 30;
//					this.tiltTarget = rad90 * 0.1;
					this.velocityTarget = 0;
					this.tween( 3 );
					break;

				case 17:
					this.altitudeTarget = 90;
					this.fovTarget = 30;
					this.tiltTarget = rad90 * 0.1;
					this.velocityTarget = 200;
					this.tween( 2 );
					break;

				case 18:
					this.altitudeTarget = 130;
					this.tiltTarget = rad90 * 0.15;
					this.velocityTarget = 200;
					this.tween( 4 );
					break;

				case 21:
					this.altitudeTarget = 100;
					this.fovTarget = 40;
					this.tiltTarget = rad90 * 0.1;
					this.velocityTarget = 200;
					this.tween( 4 );
					break;

				case 22:
					this.velocityTarget = 100;
					this.altitudeTarget = 200;
					this.tiltTarget = rad90 * 0.3;
					this.tween( 8 );
					break;
			}
		}
	},

	tween: function( duration ) {

		this.duration = duration;

		if( ! LIGHTS.releaseBuild )
			console.log( "CAMERA: vel:", this.velocityTarget, "alt:", this.altitudeTarget, "tilt:", this.tiltTarget, "fov:", this.fovTarget );

		this.altitudeOrigin = this.altitude;
		this.fovOrigin = this.fov;
		this.tiltOrigin = this.tilt;
		this.velocityOrigin = this.velocity;
		this.alpha = 0;
	}
};