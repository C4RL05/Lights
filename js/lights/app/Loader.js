/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 12/08/2011
 * Time: 10:15
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.images =  {};

LIGHTS.Loader = function( callback ) {

	this.initialize( callback );
};

LIGHTS.Loader.prototype = {

    // _______________________________________________________________________________________ Vars

	totalTweets:    9,

    // _______________________________________________________________________________________ Constructor

	initialize: function( callback ) {

		this.callback = callback;

		LIGHTS.Loader.prototype.instance = this;

		this.avatarsLoaded = false;
		this.loadMusic();
	},

    // _______________________________________________________________________________________ Load Tweets

	loadMusic: function() {

		var audio = document.createElement('audio'),
			musicSrc = null;

	    if( audio.canPlayType ) {

			if( audio.canPlayType( 'audio/mpeg' ) != "" )
				musicSrc = LIGHTS.Config.musicMP3;
		    else if ( audio.canPlayType( 'audio/ogg; codecs="vorbis"' ) != "" )
				musicSrc = LIGHTS.Config.musicOGG;
        }

		if( musicSrc !== null ) {

			audio.setAttribute( 'preload', 'auto' );
			audio.setAttribute( 'src', musicSrc );
			this.canPlayThroughListener = bind( this, this.loadTweets );
			audio.addEventListener( "canplaythrough", this.canPlayThroughListener, true );
			audio.load();

			LIGHTS.musicAudio = audio;
		}
		else
			console.error( "Error: loadMusic" );
	},

    // _______________________________________________________________________________________ Load Tweets

	loadTweets: function() {

		var ok = false;

		LIGHTS.musicAudio.removeEventListener( "canplaythrough", this.canPlayThroughListener, true );

		LIGHTS.tweets = [];
		this.isServerOk = false;

		if( ! LIGHTS.releaseBuild ) {

			this.onLoadTweetsError();
		}
		else {

			try {

				var script = document.createElement( 'script' );
				script.type = 'text/javascript';
				script.src = LIGHTS.Config.tweetsFeed;
				document.body.appendChild( script );

				this.timeout = setTimeout( 'LIGHTS.Loader.prototype.instance.onLoadTweetsError()', 5000 );
			}
			catch( error ) {

				console.error( "Error: loadTweets", error );
				this.onLoadTweetsError();
			}
		}
	},

	onLoadTweetsError: function() {

		this.loadAvatarImages( [] );
	},

	onTweetsLoaded: function( json ) {

		clearTimeout( this.timeout );

		var avatars = [],
			tweet = 0,
			username, actor, i, il;

		if( json.result == 'error' ) {

			console.error( "Error: onTweetsLoaded", json );
		}
		else {

			if( ! LIGHTS.releaseBuild )
				console.log( "onTweetsLoaded!", json.entries[0] );

			var entries = json.entries;

			for( i = 0, il = entries.length; i < il; i++ ) {

				actor = entries[ i ].actor;
				username = actor.id.substr( actor.id.lastIndexOf( '/' ) + 1 );

				if( LIGHTS.tweets.indexOf( username ) == -1 ) {

					LIGHTS.tweets.push( username );
					avatars.push( actor.avatar );

					if( ! LIGHTS.releaseBuild )
						console.log( username, actor.avatar );
				}
			}
		}

		// Add handler
		for( i = 0, il = avatars.length; i < il; i++ )
			avatars[ i ] = LIGHTS.Config.avatarHandler + encodeURI( avatars[ i ] );

		this.loadAvatarImages( avatars );

	},

	loadAvatarImages: function( avatars ) {

		if( this.avatarsLoaded )
			return;

		this.avatarsLoaded = true;

		if( ! LIGHTS.releaseBuild )
			console.log( "loadAvatarImages" );

		var	tweet = 0,
			i, il;

		// Complete usernames + avatars
		for( i = LIGHTS.tweets.length, il = this.totalTweets; i < il; i++ ) {

			avatars.push( LIGHTS.Config.defaultAvatars[ tweet ] );
			LIGHTS.tweets.push( LIGHTS.Config.defaultTweets[ tweet ] );
			tweet++;
		}

		// Add to images
		for( i = 0, il = this.totalTweets; i < il; i++ )
			LIGHTS.Config.images[ 'avatar' + i ] = avatars[ i ];

		this.loadImages();
	},

	strip: function( html ) {

	   var div = document.createElement( 'div' );
	   div.innerHTML = html;

	   return div.textContent || div.innerText;
	},

    // _______________________________________________________________________________________ Load Images

	loadImages: function () {

		var callback = bind( this, this.loadFont ),
			loadedImages = 0,
			numImages = 0;

		for( var src in LIGHTS.Config.images ) {

			numImages++;

			LIGHTS.images[ src ] = new Image();

			LIGHTS.images[ src ].onload = function() {

				if( ++loadedImages >= numImages )
					 callback();
			};

			LIGHTS.images[ src ].src = LIGHTS.Config.images[ src ];
		}
	},

    // _______________________________________________________________________________________ Load Font

	loadFont: function() {

		var callback = bind( this, this.onLoaderComplete );
			client = new XMLHttpRequest();

		client.open( 'GET', LIGHTS.Config.font );

		client.onreadystatechange = function( event ) {

			if( event.currentTarget.readyState == XMLHttpRequest.DONE ) {

				LIGHTS.DotsFont = new LIGHTS.BitmapFont( client.responseText, LIGHTS.images.font );
				callback();
			}
		};

		client.send();
	},

    // _______________________________________________________________________________________ Complete

	onLoaderComplete: function() {

		this.callback();
	}
};

function onTweetsLoaded( json ) {

	LIGHTS.Loader.prototype.instance.onTweetsLoaded( json );
}