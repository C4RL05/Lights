/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 25/07/2011
 * Time: 11:38
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.GUI = function( go ) {

	this.initialize( go );
};

LIGHTS.GUI.prototype = {

	shareLeft:          49,

    // _______________________________________________________________________________________ Constructor

	initialize: function( go ) {

		LIGHTS.GUI.instance = this;

		this.setup();

        if( go )
            this.setupGo();
		else
            this.setupFail();
	},

	setup: function() {

		this.logo = document.getElementById( 'lights_logo' );
		this.hey = document.getElementById( 'lights_helloenjoy' );
		this.share = document.getElementById( 'lights_share' );
		this.credits = document.getElementById( 'lights_credits' );

		this.logo.style.visibility =
		this.hey.style.visibility =
		this.share.style.visibility =
		this.credits.style.visibility = 'hidden';

		this.share.style.display = 'none';
	},

	setupGo: function() {

		this.info = document.getElementById( 'lights_info' );
		this.info.style.visibility = 'hidden';

		this.div = document.getElementById( 'lights_outer' );
		this.active = false;
	},

	setupFail: function() {

		document.body.style.backgroundImage = "url('images/home/background.jpg')";

		this.logo.style.visibility =
		this.hey.style.visibility =
		this.share.style.visibility =
		this.credits.style.visibility = 'visible';

		document.getElementById( 'lights_fail' ).style.visibility = 'visible';

		this.share.style.display = 'inline';
		this.share.style.left = this.shareLeft + 'px';
	},

	fade: function( alpha ) {

		if( alpha > 0 ) {

			this.logo.style.visibility =
			this.hey.style.visibility =
			this.info.style.visibility =
			this.share.style.visibility =
			this.credits.style.visibility = 'visible';

			this.setOpacity( this.logo, Math.max( 0, Math.min( 1, alpha * 2 ) ) );
			this.setOpacity( this.hey, Math.max( 0, Math.min( 1, alpha * 2 - 0.5 ) ) );
			this.setOpacity( this.info, Math.max( 0, Math.min( 1, alpha * 2 - 0.25 ) ) );
			this.setOpacity( this.share, Math.max( 0, Math.min( 1, alpha * 2 - 1 ) ) );
			this.setOpacity( this.credits, Math.max( 0, Math.min( 1, alpha * 2 - 0.75 ) ) );

			this.share.style.display = 'inline';
			this.share.style.left = this.shareLeft + 'px';
		}
		else {

			this.logo.style.visibility =
			this.hey.style.visibility =
			this.info.style.visibility =
			this.share.style.visibility =
			this.credits.style.visibility = 'hidden';
		}
	},

	setOpacity: function( div, opacity ) {

		div.style.opacity = opacity;

		if( div.filters !== undefined )
			div.filters.alpha.opacity = opacity * 100;
	}
};