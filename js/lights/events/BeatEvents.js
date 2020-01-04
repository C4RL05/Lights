/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 25/07/2011
 * Time: 10:41
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BeatEvents = function( director ) {

	this.initialize( director );
};

LIGHTS.BeatEvents.prototype = {

//    colorsA:    [ 0xFF1561, 0x1a0209 ],
//    colorsB:    [ 0x1a1002, 0xFF9D14 ],
//    colorsC:    [ 0xFF1561, 0xFF9D14 ],
//    colorsA:    [ 0xff2000, 0x1a0300 ],
//    colorsB:    [ 0x40ff00, 0x031a00 ],
//    colorsC:    [ 0x40ff00, 0xff2000, 0x0020ff ],
//    colors:    [ 0x40ff00, 0xff2000, 0x0020ff ],
//    colors:    [ 0x104000, 0x400800, 0x000840 ],
    colors:    [ 0x000080, 0x400080, 0x004080 ],


    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		this.terrain = director.terrain;
		this.displacement = director.terrain.displacement;
        this.tileManager = director.tileManager;
		this.player = director.player;
		this.skybox = director.skybox;
		this.vox = director.vox;

        this.stars = this.tileManager.stars;
        this.terrainDots = this.tileManager.terrainDots;
        this.terrainMesh = this.tileManager.terrainMesh;
        this.balls = this.tileManager.balls;
        this.cannons = this.tileManager.cannons;
//        this.tubes = this.tileManager.tubes;

        this.beatData = LIGHTS.Music.beatData;
        this.beats = 0;
    },

    // _______________________________________________________________________________________ Start

    start: function() {

	    if( LIGHTS.Music.startTime > 0 )
            this.lastTime = LIGHTS.Music.startTime;
	    else
	        this.lastTime = this.beatData.start - this.beatData.freq;

        this.nextIncluded = 0;
        this.included = true;

        this.color = 0;
	    this.beats = 0;
    },

	stop: function() {

		this.vox.stop();
	},

    // _______________________________________________________________________________________ Update

    update: function() {

        if( this.included  &&  LIGHTS.time > this.beatData.included[ this.nextIncluded ] ) {

            this.nextIncluded++;
            this.included = (this.nextIncluded < this.beatData.included.length);
        }

        if( LIGHTS.time >= this.beatData.start  &&  LIGHTS.time < this.beatData.end  &&  LIGHTS.time - this.lastTime > this.beatData.freq ) {

            this.lastTime += this.beatData.freq;

            if( this.beatData.excluded.indexOf( this.lastTime ) == -1 )
                this.beat();
        }
    },

    // _______________________________________________________________________________________ Launch Phase

   /*
        A1: 0
        B1: 1,2
        C1: 3,4
        B2: 5,6
        C2: 7,8
        D1: 9
        C3: 10,11
        D2: 12
        A2: 13
    */

    launch: function() {

        switch( LIGHTS.Music.phase.index ) {

            case 0:
	            this.terrain.reset();
	            this.terrainMesh.active = false;
	            this.displacement.active = false;
	            this.cannons.active = false;
//	            this.tubes.active = false;

	            this.balls.active = true;
	            this.balls.launch();
	            this.stars.active = true;
	            this.stars.launch();
	            this.terrainDots.launch();
                this.terrainDots.active = true;
	            this.tileManager.apply();

	            this.player.launch();
	            this.skybox.mesh.visible = false;
	            this.director.spectrumEvents.start( 1 / 4000, 8 );
                break;

            case 1:
	            this.terrainMesh.active = true;
	            this.terrainMesh.launch();
	            this.vox.start();
	            this.nextBeat = 3;
                break;

            case 2:
	            this.terrainMesh.launch();
	            this.terrainDots.launch();
                this.balls.launch();
                break;

            case 3:
	            this.balls.launch();
	            this.terrainDots.launch();
	            this.terrainMesh.launch();
                this.terrainDots.active = true;
                this.tileManager.apply();

		        this.player.launch();
	            this.skybox.mesh.visible = true;
                break;

	        case 4:
            case 5:
            case 6:
                this.terrainDots.launch();
	            this.balls.launch();
//	            this.tileManager.apply();
                break;

	        case 7: // B2
		        this.balls.launch();
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.tileManager.apply();

			    this.player.launch();
		        this.skybox.mesh.visible = false;
	            break;

	        case 8: // B2b
		        this.balls.launch();
		        this.terrainMesh.launch();
	            this.terrainDots.active = false;
			    this.tileManager.apply();
		        break;

	        case 9: // B2c
		        this.player.launch();
		        this.balls.launch();
			    this.tileManager.apply();
		        break;

	        case 10: // B2d
	            this.balls.launch();
		        this.tileManager.apply();
	            break;

	        case 11: // C2
		        this.balls.launch();
		        this.player.launch();
		        this.terrainMesh.launch();
		        this.terrainDots.active = true;
		        this.terrainDots.launch();
		        this.tileManager.apply();

		        this.skybox.mesh.visible = true;
		        break;

	        case 12: // C2b
		        this.balls.launch();
		        this.terrainDots.launch();
			    this.tileManager.apply();
		        break;

	        case 13: // C2c
	            this.balls.launch();
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
		        this.tileManager.apply();

		        this.player.launch();
	            break;

	        case 14: // C2d
		        this.terrainMesh.launch();
//		        this.tileManager.apply();
//		        this.tubes.active = true;
//		        this.tubes.launch();
//		        this.tileManager.apply();
		        break;

	        case 15: // D1
	            this.balls.launch();
		        this.terrainDots.launch();
		        this.terrainMesh.launch();
//		        this.terrainDots.active = false;
		        this.tileManager.apply();

		        this.displacement.active = true;
		        this.director.spectrumEvents.start( 1 / 2000, 4 );
		        this.player.launch();
	            break;

	        case 16: // S!
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.balls.launch();
		        this.tileManager.apply();

		        this.player.launch();
		        this.skybox.mesh.visible = false;
	            break;

	        case 17: // C3
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.balls.launch();
		        this.cannons.active = true;
		        this.cannons.launch();
		        this.tileManager.apply();

		        this.player.launch();
		        this.displacement.launchFlat2Terrain();
		        this.skybox.mesh.visible = true;
	            break;

	        case 18: // C3b
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.balls.launch();

		        this.player.launch();
		        this.displacement.active = false;
		        break;

	        case 19: // C3c
		        this.cannons.launch();
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.balls.launch();
				break;

	        case 20: // C3d
		        this.terrainMesh.launch();
		        this.terrainDots.launch();
	            this.balls.launch();
				break;

	        case 21: // D2
		        this.terrainDots.active = true;
		        this.terrainDots.launch();
		        this.balls.launch();
		        this.terrainMesh.launch();
		        this.tileManager.apply();

		        this.displacement.active = true;
		        this.director.spectrumEvents.start( 1 / 4000, 4 );
		        this.player.launch();
	            break;

	        case 22: // A2
		        this.skybox.mesh.visible = false;
		        this.balls.launch();
		        this.terrainMesh.launch();
		        this.player.launch();
				this.terrainDots.launch();
		        this.cannons.launch();
		        this.stars.launch();
		        this.vox.finish();
		        break;

	        case 23: // END
		        this.cannons.active = false;
		        this.terrainDots.active = false;
		        this.terrainMesh.active = false;
		        this.balls.active = false;
		        this.tileManager.apply();

	            LIGHTS.Lights.instance.playHome();
	            break;
        }
    },

    // _______________________________________________________________________________________ Beat

    beat: function() {

        switch( LIGHTS.Music.phase.index ) {

	        case 1:
				if( this.nextBeat == 0 ) {

					this.balls.beat();
					this.terrainDots.beat();
		        }
		        else if( this.nextBeat == 1 ) {
					this.vox.launch();

					this.balls.launch();
					this.terrainDots.launch();
					this.terrainMesh.launch();
				    this.balls.active = true;
					this.terrainMesh.active = true;
				    this.tileManager.apply();
					this.player.launch();

			        this.nextBeat--;
		        }
		        else {

			        this.nextBeat--;
		        }
				break;

	        case 2:
            case 3:
            case 4:
            case 5:
                this.balls.beat();
                this.terrainDots.beat();
                break;

            case 6:
	            this.balls.beat();
	            this.terrainDots.beat();
                this.terrainMesh.beat();
                break;

            case 7: // B2
	            this.terrainMesh.beat();
                break;

	        case 8: // B2b
	        case 9: // B2c
	        case 10: // B2d
		        this.balls.beat();
		        this.terrainMesh.beat();
	            break;

	        case 11: // C2
	        case 12: // C2b
		        this.balls.beat();
		        this.terrainMesh.beat();
		        this.terrainDots.beat();
	            break;

	        case 13: // C2c
		        this.terrainDots.beat();
		        break;

	        case 14: // C2d
		        this.terrainMesh.beat();
		        this.terrainDots.beat();
	            break;

	        case 15: // D1
//		        this.balls.beat();
		        this.terrainMesh.beat();
		        this.terrainDots.beat();
	            break;

	        case 17: // C3
	        case 18: // C3b
	        case 19: // C3c
	        case 20: // C3d
	            this.balls.beat();
	            this.terrainMesh.beat();
		        this.terrainDots.beat();
                break;

	        case 21: // D2
//	            this.displacement.createBump( Math.random() * 40 + 10 );
		        this.balls.beat();
		        this.terrainMesh.beat();
	            this.terrainDots.beat();
	            break;

	        case 22: // A2
	            this.terrainDots.beat();
//		        this.director.view.scene.fog = null;
//		        this.director.view.scene.fog.setFog( 0.0001 );
	            break;
        }

        this.beats++;
    }
};