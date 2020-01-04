/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 09/08/2011
 * Time: 10:05
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Input = function() {

	this.initialize();
};

LIGHTS.Input.mouseX = 0;
LIGHTS.Input.mouseY = 0;
LIGHTS.Input.mouseDown = false;
LIGHTS.Input.mouseClick = false;

LIGHTS.Input.keyUp = false;
LIGHTS.Input.keyDown = false;
LIGHTS.Input.keyRight = false;
LIGHTS.Input.keyLeft = false;
LIGHTS.Input.keySpace = false;
LIGHTS.Input.keyReturn = false;

LIGHTS.Input.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
        window.addEventListener( 'keyup',   bind( this, this.onKeyUp ), false );

		this.domElement = document;
        this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
        this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
        this.domElement.addEventListener( 'mouseup',   bind( this, this.onMouseUp ), false );
	},

    // _______________________________________________________________________________________ Events

	onMouseMove: function( event ) {

		event.preventDefault();

		var domElement = this.domElement,
		isDom = (domElement != document),
		containerOffsetX = isDom? domElement.offsetLeft : 0,
		containerOffsetY = isDom? domElement.offsetTop : 0,
		containerWidth = isDom? domElement.offsetWidth : window.innerWidth,
		containerHeight = isDom? domElement.offsetHeight : window.innerHeight,
		containerHalfWidth = containerWidth / 2,
		containerHalfHeight = containerHeight / 2;

		LIGHTS.Input.pointerX = Math.max( 0, Math.min( containerWidth, event.clientX - containerOffsetX ) ) - containerHalfWidth;
		LIGHTS.Input.pointerY = Math.max( 0, Math.min( containerHeight, event.clientY - containerOffsetY ) ) - containerHalfHeight;
		LIGHTS.Input.mouseX = LIGHTS.Input.pointerX / containerHalfWidth;
		LIGHTS.Input.mouseY = LIGHTS.Input.pointerY / containerHalfHeight;
	},

	onMouseDown: function( event ) {

		LIGHTS.Input.mouseDown = true;
		LIGHTS.Input.mouseClick = true;
	},

	onMouseUp: function( event ) {

		LIGHTS.Input.mouseDown = false;
	},

    onKeyDown: function( event ) {

        var key = event.keyCode;

//        console.log( key );

        if( key == 38 || key == 87 )
            LIGHTS.Input.keyUp = true;
        else if( key == 40 || key == 83 )
            LIGHTS.Input.keyDown = true;
        else if( key == 37 || key == 65 )
            LIGHTS.Input.keyRight = true;
        else if( key == 39 || key == 68 )
            LIGHTS.Input.keyLeft = true;
        else if( key == 32 )
            LIGHTS.Input.keySpace = true;
        else if( key == 13 )
            LIGHTS.Input.keyReturn = true;
    },

    onKeyUp: function( event ) {

        var key = event.keyCode;

        if( key == 38 || key == 87 )
            LIGHTS.Input.keyUp = false;
        else if( key == 40 || key == 83 )
            LIGHTS.Input.keyDown = false;
        else if( key == 37 || key == 65 )
            LIGHTS.Input.keyRight = false;
        else if( key == 39 || key == 68 )
            LIGHTS.Input.keyLeft = false;
        else if( key == 32 )
            LIGHTS.Input.keySpace = false;
        else if( key == 13 )
            LIGHTS.Input.keyReturn = false;
    },
};