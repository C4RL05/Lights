/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 27/07/2011
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapLines = function( map ) {

	this.initialize( map );
};

LIGHTS.MapLines.prototype = {

    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
    lineCount:      64,

    colorIndex:     0,
    drawCount:      0,
    lines:          [],
    lineMaterials:  [],
    addLine:        false,
    removeLine:     false,

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;

        // Circle texture
        var r = LIGHTS.TerrainMap.size * 0.5,
            i, line, material, height;

		var sizes = [ 2, 4, 8, 16, 32, 64 ];
        // Plane
        for( i = 0; i < this.lineCount; i++ ) {

            material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
	        height = Math.ceil( Math.random() * 4 );
//	        height = LIGHTS.TerrainMap.size / 16;
//	        height = sizes[ Math.floor( i / 4 ) ];
            line = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, height ), material  );

            this.lines.push( line );
            this.lineMaterials.push( material );
        }
    },

    // _______________________________________________________________________________________ Update

    drawLines: function( count ) {

        this.drawCount = count;

        var i, line, scale, size, posMax;

        for( i = 0; i < count; i++ ) {

            scale = 0.05 + 0.1 * Math.random(),
            size = LIGHTS.TerrainMap.size * scale,
            posMax = this.map.viewRadius - size * 0.5;

            line = this.lines[ i ];
            line.position.x = 0;
            line.position.y = Math.random() * 2 * posMax - posMax;
//            line.position.y = Math.floor( Math.random() * 16 ) * LIGHTS.TerrainMap.size / 16;
			line.speed = 0; //Math.random() * 32 + 32;
			line.speed *= (line.position.y > 0)? -1 : 1;

            this.map.scene.addChild( line );
            this.lineMaterials[ i ].color.setHex( this.colors[ (this.colorIndex++) % this.colors.length ] );

            this.addLine = true;
            this.removeLine = false;
        }
    },

	// TODO
	moveLines: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.lines[ i ].rotation.z += Math.random() * 0.1;

	},

	clear: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.map.scene.removeChild( this.lines[ i ] );
	},

	update: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.lines[ i ].position.y += this.lines[ i ].speed * LIGHTS.deltaTime;

return;
		/*
        if( this.addLine ) {

		    this.addLine = false;
            this.removeLine = true;
        }
        else if( this.removeLine ) {

            for( var i = 0; i < this.drawCount; i++ )
                this.map.scene.removeChild( this.lines[ i ] );

            this.removeLine = false;
        }
        */
    }
}