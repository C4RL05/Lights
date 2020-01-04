/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 18/07/2011
 * Time: 18:28
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 22/07/2011
 * Time: 11:03
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Stars = function( director ) {

	this.initialize( director );
};

LIGHTS.Stars.particleCount = 10;//24;
LIGHTS.Stars.particleSize = 4;

LIGHTS.Stars.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.terrain = director.terrain;
        this.player = director.player;

        var p, star, material;

        // Geometry
        this.particles = new THREE.Geometry();
        this.particles.dynamic = true;
        this.particles.colors = [];
        this.stars = [];

        // Materials
        material = new THREE.ParticleBasicMaterial({
                vertexColors: true,
                size: LIGHTS.Stars.particleSize * 2,
//                map: this.getCircleTexture( 32 ),
                map: LIGHTS.TextureUtils.getCircleTexture( 32 ),
//                map: THREE.ImageUtils.loadTexture( "images/BluePlasmaBall.png" ),
                blending: THREE.AdditiveBlending,
                transparent: true
        });

        for( p = 0; p < LIGHTS.Stars.particleCount; p++ ) {

            star = new LIGHTS.Star();
            star.position = new THREE.Vector3( 999999, 0, 999999 );
            star.color = new THREE.Color( 0xFF0000 );
            this.stars.push( star );

            this.particles.vertices.push( new THREE.Vertex( star.position ) );
            this.particles.colors.push( star.color );
        }

        this.particleSystem = new THREE.ParticleSystem( this.particles, material );
        this.particleSystem.sortParticles = false;
        this.particleSystem.dynamic = true;
        director.view.scene.addChild( this.particleSystem );
    },

   // _______________________________________________________________________________________ Update

    lifeFade:    0.5,

    update: function() {

        var i, star;

        this.particles.__dirtyColors = true;

        for( i = 0; i < LIGHTS.Stars.particleCount; i++ ) {

            star = this.stars[ i ];

            star.life += LIGHTS.deltaTime;

            if( star.life < star.fadeIn )
                star.color.setHex( 0x010101 * Math.floor( 256 * star.life / star.fadeIn ));
            else if( star.life > star.fadeOut )
                star.color.setHex( 0x010101 * Math.floor( 256 * (1 - (star.life - star.fadeOut) / star.fadeOutTime ) ) );

            if( star.life > star.lifeTime || ! this.terrain.isVisible( star.position.x, star.position.z ) ) {

//                this.terrain.selectRandomTileAtRadius( 1 );
	            this.terrain.selectCenterTile();
//                this.terrain.selectRandomTileAtRadius( 1 + Math.ceil( Math.random() * (this.terrain.gridRadius - 3) ) );
                this.terrain.selectTerrainRandomVertex( false );

                star.position.copy( this.terrain.randomPosition );
                star.position.y += 50 + 150 * Math.random();
                star.color.setHex( 0x000000 );
                star.life = 0;
                star.lifeTime = 0.5 + Math.random() * 0.5;
                star.fadeIn = (0.5 + Math.random() * 0.5) * star.lifeTime;
                star.fadeOut = (0.5 + Math.random() * 0.5) * (star.lifeTime - star.fadeIn);
                star.fadeOutTime = star.lifeTime - star.fadeOut;

                this.particles.__dirtyVertices = true;
            }
        }
    }
};

// _______________________________________________________________________________________ STAR

LIGHTS.Star = function() {

	this.initialize();
};

LIGHTS.Star.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        this.position = null;
        this.color = null;
        this.life = 0;
        this.lifeTime = 0;
        this.fadeIn = 0;
        this.fadeOut = 0;
    }
};
