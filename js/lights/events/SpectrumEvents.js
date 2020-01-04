/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 22/08/2011
 * Time: 12:37
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.SpectrumEvents = function( director ) {

	this.initialize( director );
};

LIGHTS.SpectrumEvents.prototype = {

	amplitudeTarget:    1 / 4096,

	spectrumData:       [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		this.displacement = director.terrain.displacement;
		this.vox = director.vox;

		this.displacement.spectrum = [];
		this.averageSpectrum = [];

		this.createSpectrumData();
    },

	createSpectrumData: function() {

		var image = LIGHTS.images.spectrumData,
			lineLength = 64,
			imageCanvas = document.createElement( 'canvas' ),
			imageContext = imageCanvas.getContext( '2d' ),
			imageData, i, il, j, d, r, g, b, a, line;

		imageCanvas.width = image.width;
		imageCanvas.height = image.height;
		imageContext.drawImage( image, 0, 0 );
		imageData = imageContext.getImageData( 0, 0, image.width, image.height ).data;
		//document.body.appendChild( imageCanvas )

		d = 0;

		for( i = 0, il = Math.floor( imageData.length / (lineLength * 4)); i < il; i++ ) {

			line = this.spectrumData[ i ] = [];

			for( j = 0; j < lineLength; j++ ) {

				r = imageData[ d++ ];
				g = imageData[ d++ ];
				b = imageData[ d++ ];
				a = imageData[ d++ ];

				line[ j ] = (r << 16) + (g << 8) + b;
			}
		}
	},

    // _______________________________________________________________________________________ Start

    start: function( target, blur ) {

	    this.amplitudeTarget = target;
	    this.blur = blur;
	    this.offset = 0;
	    this.amplitude = 0;

	    var displacementSpectrum = this.displacement.spectrum,
	        i, il;

		for( i = 0, il = this.spectrumData[ 0 ].length; i < il; i++ )
			displacementSpectrum[ i ] = 0;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

	    if( LIGHTS.Music.phase.index < 23 ) {

		    var deltaTime = LIGHTS.deltaTime,
		        easingMore = deltaTime * 20,
		        easingLess = deltaTime * 10,
			    spectrumData = this.spectrumData,
		        averageSpectrum = this.averageSpectrum,
		        displacementSpectrum = this.displacement.spectrum,
		        voxSpectrum = this.vox.spectrum,
			    offset = this.offset,
			    frame = Math.floor( LIGHTS.time * 60 ),
		        spectrum = spectrumData[ frame ],
		        blur = this.blur,
		        averageCount = (blur * 2 + 1),
		        averageMult = this.amplitude / averageCount,
			    average, i, il, j, jl, index, alpha, disp;

		    if( frame > 0 ) {

			    for( i = 0, il = spectrum.length; i < il; i++ ) {

				    average = 0;

				    for( j = i - blur, jl = i + blur; j <= jl; j++ ) {

					    if( j >= 0 )
					        average += spectrum[ j % il ];
					    else
					        average += spectrum[ (j + il) % il ];
				    }

				    averageSpectrum[ i ] = average * averageMult;
			    }

			    for( i = 0, il = spectrum.length; i < il; i++ ) {

					alpha = i + offset * il;
					index = Math.floor( alpha );
				    alpha = alpha - index;

				    average = averageSpectrum[ index % il ] * (1 - alpha) + averageSpectrum[ (index + 1) % il ] * alpha;
				    disp = displacementSpectrum[ i ];

				    if( disp > average )
				        displacementSpectrum[ i ] -= (disp - average) * easingMore;
				    else
				        displacementSpectrum[ i ] -= (disp - average) * easingLess;

				    voxSpectrum[ i ] = displacementSpectrum[ i ];
			    }

			    this.offset = (this.offset + LIGHTS.deltaTime) % 1;
			    this.amplitude -= (this.amplitude - this.amplitudeTarget) * (LIGHTS.deltaTime / 4);
		    }
	    }
    }
};
