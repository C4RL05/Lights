/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 11/08/2011
 * Time: 19:01
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BitmapFont = function( fnt, png ) {

	this.initialize( fnt, png );
};

LIGHTS.BitmapFont.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( fnt, png ) {

		var canvas = document.createElement( "canvas" );
		canvas.width = png.width;
		canvas.height = png.height;
		var context = canvas.getContext("2d");
		context.drawImage( png, 0, 0 );
		var imageData = context.getImageData( 0, 0, canvas.width, canvas.height ).data;

		var lines = fnt.split( '\n' ),
			lineCount = lines.length,
			dataWidth = png.width,
			id, x, y, width, height, xoffset, yoffset, xadvance, letter,
			words, l;

		this.font = [];

		for( l = 0; l < lineCount; l++ ) {

			words = lines[ l ].split( ' ' );

			if( words[ 0 ] == 'char' ) {

				id = parseInt( words[ 1 ].split( '=' )[ 1 ] );
				x = parseInt( words[ 2 ].split( '=' )[ 1 ] );
				y = parseInt( words[ 3 ].split( '=' )[ 1 ] );
				width = parseInt( words[ 4 ].split( '=' )[ 1 ] );
				height = parseInt( words[ 5 ].split( '=' )[ 1 ] );
				xoffset = parseInt( words[ 6 ].split( '=' )[ 1 ] );
				yoffset = parseInt( words[ 7 ].split( '=' )[ 1 ] );
				xadvance = parseInt( words[ 8 ].split( '=' )[ 1 ] );
				letter = words[ 11 ].split( '=' )[ 1 ].charAt( 1 );

				this.font[ id ] = new LIGHTS.FontChar( imageData, dataWidth, id, x, y, width, height, xoffset, yoffset, xadvance, letter );
			}
		}
	}
};

LIGHTS.FontChar = function( data, dataWidth, id, x, y, width, height, xoffset, yoffset, xadvance, letter ) {

	this.id = id;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.xoffset = xoffset;
	this.yoffset = yoffset;
	this.xadvance = xadvance;
	this.letter = letter;

	// Pixels
	this.pixels = [];

	var xl = x + width,
		yl = y + height,
		xi, yi;

	for( xi = 0; xi < width; xi++ ) {

		for( yi = 0; yi < height; yi++ )
			if( data[ ((x + xi) + ((y + yi) * dataWidth)) * 4 ] > 64 )
				this.pixels.push( [ xi, yi ] );
	}
};
