/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 18/07/2011
 * Time: 18:56
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Music = {

    startTime: 0,   //  0 A1
//    startTime: 6,   //  1 B1
//    startTime: 20,  //  2 B1a
//    startTime: 36,  //  3 C1
//    startTime: 42,  //  4 C1a
//    startTime: 50,  //  5 C1c
//    startTime: 54,  //  5 C1c+
//    startTime: 68,  //  7 B2
//    startTime: 82,  //  9 B2c
//    startTime: 98, // 11 C2
//    startTime: 116, // 13 C2c
//    startTime: 124, // 14 C2d
//    startTime: 130, // 15 D1
//    startTime: 142, // 16 S!
//    startTime: 149, // 17 C3
//    startTime: 161, // 19 C3c
//    startTime: 178, // 21 D2
//    startTime: 195, // 22 A2

//    mute: true,
    mute: false,

    /*
        A1: 0
        B1: 1,2
        C1: 3,4,5,6
        B2: 7,8,9,10
        C2: 11,12,13,14
        D1: 15
        S!: 16
        C3: 17,18,19,20
        D2: 21
        A2: 22
    */
    phase: {
        //   A1  B1       C1                B2              C2                  D1   S!      C3                  D2   A2   END
        times: [ 7, 24.5, 40, 48, 55.5, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 149.75, 152, 160, 168, 176, 184, 200, 210 ],
        index: 0
    },

    beatData: {
        start:      7,
        go:         24,
        end:        204,
        freq:       0.5,
        excluded:   [ 40, 48, 55.5, 64, 70, 70.5, 71, 104, 112, 120, 128, 136, 150, 150.5, 151, 151.5, 152, 160, 168, 176, 184, 200 ],
        included:   [ 69.75, 71.25, 71.375, 71.75, 149.75  ]
    }
};

LIGHTS.Director = function( view ) {

	this.initialize( view );
};

LIGHTS.Director.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( view ) {

        this.view = view;

        // Stage
		this.player = new LIGHTS.Player( this );
		this.vox = new LIGHTS.Vox( this );
		this.materialCache = new LIGHTS.MaterialCache( this );

        this.terrain = new LIGHTS.Terrain( this );
        this.tileManager = new LIGHTS.TileManager( this );

        this.skybox = new LIGHTS.Skybox( this );
//		this.stars = new LIGHTS.Stars( this );

        // Events
        this.beatEvents = new LIGHTS.BeatEvents( this );
		this.volumeEvents = new LIGHTS.VolumeEvents( this );
		this.spectrumEvents = new LIGHTS.SpectrumEvents( this );

        this.music = LIGHTS.musicAudio;
	},

    // _______________________________________________________________________________________ Start

    start: function() {

//        this.lastTime = -1;
	    this.lastTime = new Date().getTime();

        // Music
		this.music.currentTime = LIGHTS.time = LIGHTS.Music.startTime;
        this.music.play();
        this.music.volume = LIGHTS.Music.mute? 0 : 1;
	    LIGHTS.deltaTime = 0;

	    this.view.start();

        // Phase
        LIGHTS.Music.phase.index = 0;
        this.launch();

        // Events
        this.beatEvents.start();
	    this.volumeEvents.start();

	    this.isFast = false;
	    this.active = true;

    },

    stop: function() {

		this.active = false;
	    this.music.pause();

	    this.view.stop();

        // Stage
        this.vox.stop();

//        this.terrain.stop();
//        this.tileManager.stop();

        // Events
        this.beatEvents.stop();
//	    this.volumeEvents.stop();
//	    this.spectrumEvents.stop();

//this.stars.stop();

//        this.skybox.stop();
//	    console.log("DIRECTOR STOP");
    },

    // _______________________________________________________________________________________ Update

    update: function() {

	    if( ! LIGHTS.releaseBuild && LIGHTS.Input.keySpace )
	        LIGHTS.Lights.instance.playHome();

        // Time
        var time = new Date().getTime();

        if( this.lastTime != -1 ) {

	        if( ! LIGHTS.releaseBuild && LIGHTS.Input.keyUp ) {

		        if( ! this.isFast ) {

			        this.isFast = true;
			        this.music.volume = 0;
		        }

		        LIGHTS.deltaTime = (time - this.lastTime) / 1000 + 0.1;
				LIGHTS.time += LIGHTS.deltaTime;
	        }
	        else {

		        LIGHTS.deltaTime = (time - this.lastTime) / 1000;

		        if( this.isFast ) {

			        this.isFast = false;
			        this.music.volume = LIGHTS.Music.mute? 0 : 1;
			        this.music.currentTime = LIGHTS.time + LIGHTS.deltaTime;
		        }
		        else {

			        // Sync with music
			        LIGHTS.time = this.music.currentTime;

			        // Sync with time
//			        LIGHTS.time += LIGHTS.deltaTime;
		        }
	        }
        }
	    else {

	        LIGHTS.time = LIGHTS.deltaTime = this.music.currentTime;
        }

	    LIGHTS.deltaTime = Math.min( LIGHTS.deltaTime, 0.2 );

        this.lastTime = time;

        // Phase
        if( LIGHTS.time > LIGHTS.Music.phase.times[ LIGHTS.Music.phase.index ] ) {

            LIGHTS.Music.phase.index++;
            this.launch();

	        if( LIGHTS.time > LIGHTS.Music.phase.times[ LIGHTS.Music.phase.index ] ) {

		        this.beatEvents.beat();
		        this.beatEvents.beat();
		        this.beatEvents.beat();
		        this.beatEvents.beat();
	        }
        }

        // Stage
        this.player.update();
        this.vox.update();
        this.terrain.update();
        this.tileManager.update();

        // Events
        this.beatEvents.update();
	    this.volumeEvents.update();
	    this.spectrumEvents.update();

        this.skybox.update();
    },

	postUpdate: function() {

		this.tileManager.balls.raycast();
	},

    // _______________________________________________________________________________________ Private

    launch: function() {

        this.beatEvents.launch();

	    if( ! LIGHTS.releaseBuild )
            console.log( "Phase: " + LIGHTS.Music.phase.index );
    }
};