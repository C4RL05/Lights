/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 11/07/2011
 * Time: 17:43
 * To change this template use File | Settings | File Templates.
 */

//LIGHTS.releaseBuild = true;
LIGHTS.releaseBuild = false;

LIGHTS.time = 0;
LIGHTS.deltaTime = 0;

LIGHTS.colors = [ 0xFF1561, 0xFFF014, 0x14FF9D, 0x14D4FF, 0xFF9D14 ];
LIGHTS.hues = [ 341/360, 56/360, 155/360, 191/360, 35/360 ];

LIGHTS.colorBlack = new THREE.Color( 0x000000 );
LIGHTS.colorWhite = new THREE.Color( 0xFFFFFF );

// _______________________________________________________________________________________ Start

document.onselectstart = function() { return false; }; // ie
document.onmousedown = function() { return false; }; // mozilla

function bind( scope, fn ) {

    return function() {

        fn.apply( scope, arguments );
    };
}

window.onload = function() {

	this.lights = new LIGHTS.Lights();
}

// _______________________________________________________________________________________ Lights

LIGHTS.Lights = function() {

    LIGHTS.Lights.instance = this,

	this.initialize();
};

LIGHTS.Lights.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        if( Detector.webgl ) {

	        this.renderManager = new LIGHTS.RenderManager();
	        this.input = new LIGHTS.Input();
	        this.gui = new LIGHTS.GUI( true );
	        this.home = new LIGHTS.Home( this.renderManager, this.gui, bind( this, this.launchHome ) );
	        this.loader = new LIGHTS.Loader( bind( this, this.launch ) );

        }
        else {

	        this.gui = new LIGHTS.GUI( false );
        }
	},

    // _______________________________________________________________________________________ Launch

	launchHome: function() {

		this.home.launchIntro();
		this.experiencePlaying = false;
		this.animateLights();
	},

    launch: function() {

	    LIGHTS.stopwatch = new LIGHTS.Stopwatch();

        this.view = new LIGHTS.View( this.renderManager );
        this.director = new LIGHTS.Director( this.view );
	    this.home.launchPlay();
    },

	playExperience: function() {

		this.home.stop();
		this.director.start();
		this.experiencePlaying = true;
	},

	playHome: function() {

		this.director.stop();
		this.home.start();
		this.experiencePlaying = false;
	},

    // _______________________________________________________________________________________ Update

	animateLights: function() {

		requestAnimationFrame( bind( this, this.animateLights ) );

		if( this.experiencePlaying ) {

			this.view.clear();
			this.director.update();
			this.view.update();
			this.director.postUpdate();
		}
		else {

			this.home.update();
		}
    }
};

var rad45 = Math.PI / 4,
    rad90 = Math.PI / 2,
    rad180 = Math.PI,
    rad360 = Math.PI * 2,
    deg2rad = Math.PI / 180,
    rad2deg = 180 / Math.PI,
	phi = 1.618033988749;

//LIGHTS.guiOptions = {
//    particleX:	            0,
//    particleY:	            0,
//    particleZ:	            0,
//    particleScreenX: 		0,
//    particleScreenY: 		0
//};

