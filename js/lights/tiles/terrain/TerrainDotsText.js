/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 12/08/2011
 * Time: 10:12
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDotsText = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainDotsText.prototype = {

	textScale:      phi,

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

		this.manager = manager;
		this.player = manager.director.player;

		this.words = [];

		var size = LIGHTS.Terrain.prototype.tileSize,
			s1 = size * (1/3 - 0.5),
			s2 = size * (2/3 - 0.5),
			s3 = size * 0.5,
			positions = [],
			position, word, i;

		positions.push( [ s1,  80, s1 ] );
		positions.push( [ s1,  90, s2 ] );
		positions.push( [ s1, 100, s3 ] );

		positions.push( [ s2, 120, s1 ] );
		positions.push( [ s2, 130, s2 ] );
		positions.push( [ s2, 140, s3 ] );

		positions.push( [ s3, 150, s1 ] );
		positions.push( [ s3, 160, s2 ] );
		positions.push( [ s3, 170, s3 ] );

		for( i = 0; i < LIGHTS.tweets.length; i++ ) {

			pos = positions[ i ];
			position = new THREE.Vector3( pos[ 0 ], pos[ 1 ], pos[ 2 ] );
			word = new LIGHTS.TerrainDotsWord( '@' + LIGHTS.tweets[ i ], position );
			this.words.push( word );
		}
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var words = this.words,
			il = words.length,
			angle = this.player.angle,
			i;

		for( i = 0; i < il; i++ )
			words[ i ].update( angle );
	}
};

// ___________________________________________________________________________________________ TerrainDotsWord

LIGHTS.TerrainDotsWord = function( word, position ) {

	this.initialize( word, position );
};

LIGHTS.TerrainDotsWord.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( word, position ) {

		this.word = word;
		this.position = position;
		this.rotation = Math.random() * rad360;
		this.scale = LIGHTS.TerrainDotsText.prototype.textScale;
		this.rotationSpeed = Math.random() * 0.1 + 0.1;
		this.rotationSpeed *= (Math.random() > 0.5)? 1 : -1;
		this.floatFreq = Math.random() * 5 + 5;
		this.floatAmp = Math.random() * 5 + 5;

		// Dots
		this.pixels = [];
		this.dots = [];

		var x = 0,
			i, j, fontChar, dot, w2, xoffset, yoffset;

		for( i = 0; i < word.length; i++ ) {

			fontChar = LIGHTS.DotsFont.font[ word.charCodeAt( i ) ];
			xoffset = fontChar.xoffset;
			yoffset = fontChar.yoffset;

			if( fontChar !== undefined ) {

				pixels = fontChar.pixels;

				for( j = 0; j < pixels.length; j++ ) {

					pixel = pixels[ j ];
					this.pixels.push( [ pixel[ 0 ] + xoffset + x, pixel[ 1 ] + yoffset ] );
					this.dots.push( new THREE.Vector3() );
				}

				x += fontChar.xadvance;
			}
			else {

				console.log( "ERROR: LIGHTS.TerrainDotsWord: Char not found in font!" );
			}
		}

		this.width = x;

		// Center
		w2 = x / 2;

		for( i = 0; i < this.pixels.length; i++ )
			this.pixels[ i ][ 0 ] -= w2;
	},

    // _______________________________________________________________________________________ Update

	update: function( angle ) {

		var pixels = this.pixels,
			dots = this.dots,
			posX = this.position.x,
			posY = this.position.y,
			posZ = this.position.z,
			scaleX = this.scale,
			scaleY = this.scale,
			s = Math.sin( this.rotation ),
			c = Math.cos( this.rotation ),
			il = pixels.length,
			dy = Math.sin( ((LIGHTS.time % this.floatFreq) / this.floatFreq) * rad360 ) * this.floatAmp,
			i, px, py, pz, pixel, dot;

		// sin( rotation - angle )
		if( s * Math.cos( angle ) - c * Math.sin( angle ) < 0 )
			scaleX = -scaleX;

		for( i = 0; i < il; i++ ) {

			pixel = pixels[ i ];
			px = pixel[ 0 ] * scaleX * s;
			py = pixel[ 1 ] * scaleY;
			pz = pixel[ 0 ] * scaleX * c;

			dot = dots[ i ];
			dot.x = posX + px;
			dot.y = posY - py + dy;
			dot.z = posZ + pz;
		}

		this.rotation += this.rotationSpeed * LIGHTS.deltaTime;
	},

	toString: function() {

		var pixels = this.pixels,
			dots = this.dots,
			posX = this.position.x,
			posY = this.position.y,
			posZ = this.position.z,
			scale = this.scale,
			matrix = [],
			output = '',
			w2 = this.width / 2,
			il = pixels.length,
			i, px, py, pixel;

		for( i = 0; i < il; i++ ) {

			pixel = pixels[ i ];
			px = pixel[ 0 ] + w2;
			py = pixel[ 1 ];

			if( matrix[ py ] === undefined )
				matrix[ py ] = [];

			matrix[ py ][ px ] = true;
		}

		for( py = 0; py < matrix.length; py++ ) {

			if( matrix[ py ] !== undefined )
				for( px = 0; px < matrix[ py ].length; px++ )
					output += (matrix[ py ][ px ] == true)? 'X' : ' ';

			output += '\n';
		}

		return output;
	}
};