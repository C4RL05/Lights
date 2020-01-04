/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 25/08/2011
 * Time: 14:28
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.RenderManager = function() {

	this.initialize();
};

LIGHTS.RenderManager.prototype = {

	initialize: function() {

		var container = document.createElement('div'),
			style = container.style;

		style.position = 'absolute';
		style.top = '0px';
		style.left = '0px';
		style.zIndex = '-100';
		style.margin = '0';
		style.padding = '0';
		document.body.appendChild( container );


		var _canvas = document.createElement( 'canvas' );

		var error = "";
		var retrieveError = function(e) { error = e.statusMessage || "unknown error"; };

		_canvas.addEventListener("webglcontextcreationerror", retrieveError, false);
		var ctx = _canvas.getContext("experimental-webgl");
		_canvas.removeEventListener("webglcontextcreationerror", retrieveError, false);

		if( ctx ) {

			var renderer = new THREE.WebGLRenderer( { canvas: _canvas, clearColor: 0x000000, clearAlpha: 1, antialias: false } );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.autoClear = false;
			container.appendChild( renderer.domElement );

			this.renderer = renderer;
		}
		else {

			alert("WebGL error: " + error);
		}

        // Stats
		if( ! LIGHTS.releaseBuild ) {

			this.renderStats = new THREE.RenderStats( this.renderer );

	        this.stats = new Stats();
	        this.stats.domElement.style.position = 'absolute';
	        this.stats.domElement.style.top = '-42px';
	        this.renderStats.container.appendChild( this.stats.domElement );
		}
	},

	update: function() {

		if( ! LIGHTS.releaseBuild ) {

			this.renderStats.update();
			this.stats.update();
		}
	}
};
