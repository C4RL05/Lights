/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 10/08/2011
 * Time: 15:44
 * To change this template use File | Settings | File Templates.
 */


LIGHTS.VolumeEvents = function( director ) {

	this.initialize( director );
};

LIGHTS.VolumeEvents.prototype = {


    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		this.vox = director.vox;
    },

    // _______________________________________________________________________________________ Start

    start: function() {

	    this.voxVolume = 0;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

	    var voxData = LIGHTS.VolumeData.vox,
		    voxVolume = voxData[ frame ] / 512,
		    frame = Math.floor( LIGHTS.time * 60 ),
			voxAverageVolume = 0,
	        voxPeakEase = 5 * LIGHTS.deltaTime,
	        i;

	    if( frame > 0 ) {

		    for( i = Math.max( 0, frame - 6 ); i <= frame; i++ ) {

			    voxAverageVolume += voxData[ i ] / 512;
		    }

		    voxAverageVolume /= Math.min( 6, frame );

//		    voxDeltaVolume = voxVolume - voxData[ frame - 3 ] / 512;

		    voxVolume = voxAverageVolume;

		    if( this.voxVolume < voxVolume )
		        this.voxVolume = voxVolume;
		    else
				this.voxVolume -= (this.voxVolume - voxVolume) * voxPeakEase;

		    // Assign
		    this.vox.volume = this.voxVolume;
	    }
    },
};
