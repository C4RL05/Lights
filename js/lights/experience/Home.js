/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 25/08/2011
 * Time: 12:37
 * To change this template use File | Settings | File Templates.
 */


LIGHTS.Home = function( renderManager, gui, callback ) {

	this.initialize( renderManager, gui, callback );
};

LIGHTS.Home.prototype = {

	fadeValue:          0.5,
	hitRadius2:         50 * 50,
	circleCount:        64,
	replayButtonsX:     64,
	mouseOverScale:     1.1,
	buttonOpacity:      0.3,
	buttonY:            -46,

    // _______________________________________________________________________________________ Constructor

	initialize: function( renderManager, gui, callback ) {

		this.renderManager = renderManager;
        this.renderer = renderManager.renderer;
		this.gui = gui;
		this.callback = callback;

		this.loadImages();
	},

	loadImages: function () {

		var callback = bind( this, this.setup ),
			loadedImages = 0,
			numImages = 0;

		this.images = {};

		for( var src in LIGHTS.Config.homeImages ) {

			numImages++;

			this.images[ src ] = new Image();

			this.images[ src ].onload = function() {

				if( ++loadedImages >= numImages )
					 callback();
			};

			this.images[ src ].src = LIGHTS.Config.homeImages[ src ];
		}
	},

	setup: function () {

		this.setupScene();

		this.callback();
	},

	setupScene: function () {

		// Camera
		this.camera = new THREE.Camera();
		this.camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
		this.camera.position.z = 1000;

		// Scene
		this.scene = new THREE.Scene();

		var sphereColors = LIGHTS.BallGeometries.prototype.sphereColors,
			geometries = [],
			geometry, material, texture, colors, i;

		// Geometries
		for( i = 0; i < sphereColors.length; i++ ) {

			geometry = new THREE.PlaneGeometry( 1, 1 );
			colors = sphereColors[ i ];
			THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ] );
			geometries.push( geometry );
		}

		// Materials
		texture = new THREE.Texture( this.images.bokeh );
		texture.needsUpdate = true;

		this.circles = [];

		for( i = 0; i < this.circleCount; i++ ) {

			geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];

			material = new THREE.MeshBasicMaterial( {

				map:            texture,
				color:          0x000000,
				vertexColors:   THREE.VertexColors,
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} );

			var mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = -1000;
			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 100 + 50;
			mesh.rotation.z = Math.random() * rad360;

			this.circles.push( new LIGHTS.HomeCircle( mesh, material ) );
			this.scene.addChild( mesh );
		}

		// Loading
		texture = new THREE.Texture( this.images.loadingButton );
		texture.needsUpdate = true;

		material = new THREE.MeshBasicMaterial( {

			map:            texture,
			color:          0x000000,
			transparent:    true
		} );

		this.loadingColor = material.color;

		this.loading = new THREE.Mesh( new THREE.PlaneGeometry( 128, 128 ), material );
		this.loading.position.y = this.buttonY;
		this.loading.position.z = 200;
		this.loadingRot = this.loading.rotation;
		this.loadingRot.y = rad180;
		this.scene.addChild( this.loading );

		// Play
		texture = new THREE.Texture( this.images.playButton );
		texture.needsUpdate = true;

		this.playMaterial = new THREE.MeshBasicMaterial( {

			map:            texture,
			color:          0x000000,
			opacity:        1 - this.buttonOpacity,
			transparent:    true
		} );

		this.playColor = this.playMaterial.color;

		this.play = new THREE.Mesh( new THREE.PlaneGeometry( 128, 128 ), this.playMaterial );
		this.play.position.y = this.buttonY;
		this.play.position.z = 400;
		this.playRot = this.play.rotation;
		this.playRot.y = rad180;
		this.scene.addChild( this.play );

		// Fade
		material = new THREE.MeshBasicMaterial( {

			color:          0x000000,
			opacity:        0.5,
			blending:       THREE.MultiplyBlending,
			transparent:    true
		} );

		this.fadeColor = material.color;
		this.fade = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), material );
		this.scene.addChild( this.fade );

		// Resize
		this.onWindowResizeListener = bind( this, this.onWindowResize );
		this.onWindowResize();

		// Click
		this.onClickListener = bind( this, this.onClick );
	},

	setupReplay: function() {

		// Replay
		texture = new THREE.Texture( LIGHTS.images.replayButton );
		texture.needsUpdate = true;

		this.replayMaterial = new THREE.MeshBasicMaterial( {

			map:            texture,
			color:          0x000000,
			opacity:        1 - this.buttonOpacity,
			transparent:    true
		} );

		this.replayColor = this.replayMaterial.color;

		this.replay = new THREE.Mesh( new THREE.PlaneGeometry( 128, 128 ), this.replayMaterial );
		this.replay.position.x = -this.replayButtonsX;
		this.replay.position.y = this.buttonY;
		this.replay.position.z = 200;
		this.replayRot = this.replay.rotation;
		this.replayRot.y = rad180;
		this.scene.addChild( this.replay );

		// Tweet
		texture = new THREE.Texture( LIGHTS.images.tweetButton );
		texture.needsUpdate = true;

		this.tweetMaterial = new THREE.MeshBasicMaterial( {

			map:            texture,
			color:          0x000000,
			opacity:        1 - this.buttonOpacity,
			transparent:    true
		} );

		this.tweetColor = this.tweetMaterial.color;

		this.tweet = new THREE.Mesh( new THREE.PlaneGeometry( 128, 128 ), this.tweetMaterial );
		this.tweet.position.x = this.replayButtonsX;
		this.tweet.position.y = this.buttonY;
		this.tweet.position.z = 200;
		this.tweetRot = this.tweet.rotation;
		this.tweetRot.y = rad180;
		this.scene.addChild( this.tweet );
	},

    // _______________________________________________________________________________________ Start

    start: function() {

	    this.time = new Date().getTime();
	    this.isReplay = true;
	    this.tweetReady = true;
	    this.openTweetThis = false;
	    this.isClosing = false;
	    this.isOpening = true;
	    this.alpha = 0;
	    this.delay = 1;

	    window.addEventListener( 'resize', this.onWindowResizeListener, false );
	    this.onWindowResize();

	    window.addEventListener( 'click', this.onClickListener, false );

	    var circles = this.circles,
		    i, il, circle;

	    for( i = 0, il = circles.length; i < il; i++ ) {

	        circle = circles[ i ];

			circle.life = 0;
			circle.lifeTime = 0;
			circle.fadeIn = 0;
			circle.fadeOut = 0;
			circle.delay = Math.random() * 4 + 1;
			circle.rotSpeed = Math.random() * 2 - 1;
		    circle.color.setHex( 0x000000 );
	    }
    },

	stop: function() {

		window.removeEventListener( 'resize', this.onWindowResizeListener, false );

		if( this.isReplay )
			window.removeEventListener( 'resize', this.onClickListener, false );
	},

	launchIntro: function() {

		this.time = new Date().getTime();
		this.isIntro = true;
		this.isReplay = false;
		this.isClosing = false;
		this.isOpening = true;
		this.isLoaded = false;
		this.isLoading = true;
		this.alpha = 0;
		this.delay = 1;
		this.introDelay = 1000;

		window.addEventListener( 'resize', this.onWindowResizeListener, false );
		this.onWindowResize();
	},

	launchPlay: function() {

		if( this.alpha < 1 ) {

			this.isLoaded = true;
		}
		else {

			this.isLoading = false;
			this.alpha = 0;
		}

		this.setupReplay();
	},

    // _______________________________________________________________________________________ Update

    update: function() {

	    var w = window.innerWidth,
		    h = window.innerHeight,
		    deltaTime = new Date().getTime() - this.time,
	        circles = this.circles,
		    circle, i, il, hit;

	    if( this.introDelay < 0 ) {

			this.time += deltaTime;
			deltaTime /= 1000;

			// Meshes
			for( i = 0, il = circles.length; i < il; i++ ) {

				circle = circles[ i ];

				if( circle.delay < 0 ) {

					circle.life += deltaTime;

					if( circle.life > circle.lifeTime ) {

						circle.position.x = (Math.random() - 0.5) * w;
						circle.position.y = (Math.random() - 0.5) * h;
						circle.color.setHex( 0x000000 );
						circle.life = 0;
						circle.lifeTime = Math.random() * 4 + 2;
						circle.fadeIn = (Math.random() * 0.5 + 0.5) * circle.lifeTime;
						circle.fadeOut = (Math.random() * 0.5 + 0.5) * (circle.lifeTime - circle.fadeIn);
						circle.fadeOutTime = circle.lifeTime - circle.fadeOut;
					}

					if( circle.life < circle.fadeIn )
						circle.color.setHex( 0x010101 * Math.floor( 256 * circle.life / circle.fadeIn ));
					else if( circle.life > circle.fadeOutTime )
						circle.color.setHex( 0x010101 * Math.floor( 256 * (1 - (circle.life - circle.fadeOutTime) / circle.fadeOut ) ) );

					circle.rotation.z += deltaTime * circle.rotSpeed;
				}
				else {

					circle.delay -= deltaTime;
				}
			}

			this.updateButtons( deltaTime );

			// Render
			this.renderer.render( this.scene, this.camera );
			this.renderManager.update();
	    }
	    else {

		    this.introDelay -= deltaTime;
	    }
    },

	updateButtons: function( deltaTime ) {

		var input = LIGHTS.Input,
			buttonY = this.buttonY,
			hit, hit2, scale, alpha;

	    // Loading / Play
	    if( this.isOpening ) {

		    // Opening
		    this.alpha += deltaTime * 0.5;

		    if( this.alpha >= 1 ) {

			    this.playScale = 1;
			    this.replayScale = 1;
			    this.tweetScale = 1;
			    this.isOpening = false;
			    this.alpha = 1;
		    }

		    if( ! this.isIntro ) {

			    alpha = Math.min( this.alpha * 4, 1 ) - 1;
			    this.replayRot.y = rad180 * alpha;
			    this.tweetRot.y = rad180 * alpha;
		    }

		    this.gui.fade( this.alpha );
		    this.fadeColor.setHSV( 0, 0, this.alpha * this.fadeValue );

		    if( this.alpha == 1 )
			    this.alpha = 0;
	    }
		else if( this.isIntro ) {

			// Intro
			if( this.delay < 0 ) {

				if( this.isLoading ) {

					// Loading
					if( this.alpha < 1 ) {

						this.alpha += deltaTime * 2;

						if( this.alpha >= 1 )
							this.alpha = 1;

						this.loadingRot.y = rad180 * (this.alpha - 1);

						if( this.isLoaded && this.alpha == 1 ) {

							this.isLoading = false;
							this.alpha = 0;
						}
					}
				}
				else {

					// Intro Play
					this.alpha += deltaTime * 2;

					if( this.alpha >= 1 ) {

						this.playScale = 1;
						this.isIntro = false;
						this.alpha = 1;
					}

					this.loadingRot.y = rad180 * this.alpha;
					this.playRot.y = rad180 * (this.alpha - 1);
				}
			}
			else {

				this.delay -= deltaTime;
			}
	    }
	    else {

		    // Home
		    if( this.isReplay ) {

			    if( this.isClosing ) {

				    // Closing
					this.alpha += deltaTime * 2;

					if( this.alpha >= 1 ) {

						LIGHTS.Lights.instance.playExperience();
						this.alpha = 1;
					}

					this.replayRot.y = this.tweetRot.y = rad180 * this.alpha;

				    scale = this.mouseOverScale - this.alpha * (this.mouseOverScale - 1);
				    this.replayScale = Math.min( this.replayScale, scale );
				    this.tweetScale = Math.min( this.tweetScale, scale );

				    alpha = 1 - this.buttonOpacity * this.alpha;
				    this.replayMaterial.opacity = Math.min( this.replayMaterial.opacity, alpha );
				    this.tweetMaterial.opacity = Math.min( this.replayMaterial.opacity, alpha );

				    this.gui.fade( 1 - this.alpha );
					this.fadeColor.setHSV( 0, 0, (1 - this.alpha) * this.fadeValue );
			    }
			    else {

					// Replay Button
					hit = (input.pointerX + this.replayButtonsX) * (input.pointerX + this.replayButtonsX) + (input.pointerY + buttonY ) * (input.pointerY + buttonY );
					hit2 = (input.pointerX - this.replayButtonsX) * (input.pointerX - this.replayButtonsX) + (input.pointerY + buttonY ) * (input.pointerY + buttonY );

					if( hit < this.hitRadius2 || input.keyReturn ) {

						this.replayScale -= (this.replayScale - this.mouseOverScale) * deltaTime * 8;
						this.replayMaterial.opacity -= (this.replayMaterial.opacity - 1) * deltaTime * 8;
						document.body.style.cursor = 'pointer';

						if( LIGHTS.Input.mouseDown || input.keyReturn ) {

							document.body.style.cursor = 'auto';
							this.isClosing = true;
							this.alpha = 0;
						}
					}
					else {

						this.replayScale -= (this.replayScale - 1) * deltaTime * 8;
						this.replayMaterial.opacity -= (this.replayMaterial.opacity - (1 - this.buttonOpacity)) * deltaTime * 8;
					}

				    if( this.tweetReady && hit2 < this.hitRadius2 ) {

						this.tweetScale -= (this.tweetScale - this.mouseOverScale) * deltaTime * 8;
					    this.tweetMaterial.opacity -= (this.tweetMaterial.opacity - 1) * deltaTime * 8;
						document.body.style.cursor = 'pointer';

						if( LIGHTS.Input.mouseDown ) {

							this.openTweetThis = true;
							this.tweetReady = false;
							document.body.style.cursor = 'auto';
						}
					}
				    else {

						this.tweetScale -= (this.tweetScale - 1) * deltaTime * 8;
					    this.tweetMaterial.opacity -= (this.tweetMaterial.opacity - (1 - this.buttonOpacity)) * deltaTime * 8;
					}

				    if( ! this.tweetReady )
					    this.tweetReady = (hit2 >= this.hitRadius2);

				    if( hit >= this.hitRadius2 && hit2 >= this.hitRadius2 )
				        document.body.style.cursor = 'default';
			    }

			    this.replay.scale.x = this.replay.scale.y = this.replay.scale.z = this.replayScale;
			    this.tweet.scale.x = this.tweet.scale.y = this.tweet.scale.z = this.tweetScale;
		    }
		    else {

			    if( this.isClosing ) {

				    // Closing
					this.alpha += deltaTime * 2;

					if( this.alpha >= 1 ) {

						LIGHTS.Lights.instance.playExperience();
						this.alpha = 1;
					}

					this.playRot.y = rad180 * this.alpha;
					this.playScale = this.mouseOverScale - this.alpha * (this.mouseOverScale - 1);
				    this.playMaterial.opacity = 1 - this.buttonOpacity * this.alpha;
				    this.gui.fade( 1 - this.alpha );
					this.fadeColor.setHSV( 0, 0, (1 - this.alpha) * this.fadeValue );
			    }
			    else {

					// Play Button
					hit = input.pointerX * input.pointerX + (input.pointerY + buttonY ) * (input.pointerY + buttonY );

					if( hit < this.hitRadius2 || input.keyReturn ) {

						this.playScale -= (this.playScale - this.mouseOverScale) * deltaTime * 8;
						this.playMaterial.opacity -= (this.playMaterial.opacity - 1) * deltaTime * 8;
						document.body.style.cursor = 'pointer';

						if( LIGHTS.Input.mouseDown || input.keyReturn ) {

							document.body.style.cursor = 'auto';
							this.isClosing = true;
							this.alpha = 0;
						}

					} else {

						this.playScale -= (this.playScale - 1) * deltaTime * 8;
						this.playMaterial.opacity -= (this.playMaterial.opacity - (1 - this.buttonOpacity)) * deltaTime * 8;
						document.body.style.cursor = 'default';
					}
			    }

			    this.play.scale.x = this.play.scale.y = this.play.scale.z = this.playScale;
		    }
	    }

		this.loadingColor.r = this.loadingColor.g = this.loadingColor.b = Math.sin( this.loadingRot.y + rad90 );
		this.playColor.r = this.playColor.g = this.playColor.b = Math.sin( this.playRot.y + rad90 );

		if( this.isReplay ) {

			this.replayColor.r = this.replayColor.g = this.replayColor.b = Math.sin( this.replayRot.y + rad90 );
			this.tweetColor.r = this.tweetColor.g = this.tweetColor.b = Math.sin( this.tweetRot.y + rad90 );
		}
    },

    // _______________________________________________________________________________________ Private

	onClick: function( event ) {

		if( this.openTweetThis ) {

			this.openTweetThis = false;
			window.open( LIGHTS.Config.tweetThis, '_blank', LIGHTS.Config.tweetThisSpecs );
		}
	},

	onWindowResize: function() {

		var w = window.innerWidth,
			h = window.innerHeight,
			w2 = w / 2,
			h2 = h / 2;

		this.fade.scale.x = w;
		this.fade.scale.y = h;
		this.renderer.setSize( w, h );
		this.camera.projectionMatrix = THREE.Matrix4.makeOrtho( -w2, w2, h2, -h2, -10000, 10000 );
//
//		this.offsetHeight = (h - 490) / 2;
//
//		if( this.offsetHeight < 0 )
//			this.offsetHeight = 0;
//
//		this.gui.onWindowResize();
	}
};

LIGHTS.HomeCircle = function( mesh, material ) {

	this.position = mesh.position;
	this.rotation = mesh.rotation;
	this.color = mesh.materials[ 0 ].color;
	this.life = 0;
	this.lifeTime = 0;
	this.fadeIn = 0;
	this.fadeOut = 0;
	this.delay = Math.random() * 4 + 1;
	this.rotSpeed = Math.random() * 2 - 1;
};