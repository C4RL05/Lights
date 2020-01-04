/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 31/07/2011
 * Time: 18:48
 * To change this template use File | Settings | File Templates.
 */

// _______________________________________________________________________________________ Lights

LIGHTS.TextureUtils = function() {

	this.initialize();
};

LIGHTS.TextureUtils.grays = [];

LIGHTS.TextureUtils.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        // Grays
        for( var i = 0; i < 256; i++ )
            LIGHTS.TextureUtils.grays = 0x010101 * i;
	}
};

LIGHTS.TextureUtils.getCircleTexture = function( size ) {

    var r = size * 0.5,
        i, dotFill, textureCanvas, textureContext, texture;

    textureCanvas = document.createElement( 'canvas' );
    textureCanvas.width = size;
    textureCanvas.height = size;

    textureContext = textureCanvas.getContext( '2d' );
    dotFill = textureContext.createRadialGradient( r, r, 0, r, r, r );
    dotFill.addColorStop( 0, '#FFFFFF' );
    dotFill.addColorStop( 0.4, '#FFFFFF' );
    dotFill.addColorStop( 0.8, '#808080' );
//    dotFill.addColorStop( 0.9, '#808080' );
    dotFill.addColorStop( 1, '#000000' );


    textureContext.fillStyle = dotFill;
    textureContext.beginPath();
    textureContext.arc( r, r, r * 0.95, 0, rad360, true );
    textureContext.closePath();
    textureContext.fill();

    texture = new THREE.Texture( textureCanvas, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter );
    texture.needsUpdate = true;

    return texture;
};

LIGHTS.TextureUtils.getGradientColors = function( gradient ) {

    var colors = [],
	    i, fill, canvas, context, data;

    canvas = document.createElement( 'canvas' );
    canvas.width = 256;
    canvas.height = 1;

    context = canvas.getContext( '2d' );
    fill = context.createLinearGradient( 0, 0, 255, 0 );

	for( i = 0; i < gradient.length; i++ )
        fill.addColorStop( gradient[ i ][ 1 ], gradient[ i ][ 0 ] );

    context.fillStyle = fill;
    context.fillRect( 0, 0, 256, 1 );
	data = context.getImageData( 0, 0, 256, 1 ).data;

	for( i = 0; i < data.length; i += 4 )
		colors.push( data[ i ] * 0x010000 + data[ i+1 ] * 0x000100 + data[ i+2 ] * 0x000001 );

//	delete data;
//	delete fill;
//	delete context;
//	delete canvas;

	return colors;
};
