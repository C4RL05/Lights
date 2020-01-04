/**
 * @author C4RL05 / http://helloenjoy.com/
 */

THREE.RenderStats = function( renderer, parameters ) {

	this.initialize( renderer, parameters );
};

THREE.RenderStats.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( renderer, parameters ) {

        this.renderer = renderer;

		if( parameters === undefined )
    	    parameters = {};

		var color = (parameters.color !== undefined)? parameters.color : '#FF1561',
            top = (parameters.top !== undefined)? parameters.top : '42px',
            s;

        this.values = document.createElement( 'div' );
        s = this.values.style;
        s.fontFamily = 'Helvetica, Arial, sans-serif';
        s.fontSize = '16px';
        s.fontWeight = 'bold';
        s.lineHeight = '28px';
        s.textAlign = 'left';
        s.color = color;
        s.position = 'absolute';
        s.margin = '2px 2px 2px 4px';

        var labels = document.createElement( 'div' );
        s = labels.style;
        s.fontFamily = 'Helvetica, Arial, sans-serif';
        s.fontSize = '8px';
        s.fontWeight = 'bold';
        s.lineHeight = '28px';
        s.textAlign = 'left';
        s.color = color;
        s.position = 'absolute';
        s.top = '12px';
        s.margin = '2px 2px 2px 4px';
        labels.innerHTML = 'VERTS<br>TRIS<br>DRAWS';

        this.container = document.createElement( 'div' );
        s = this.container.style;
        s.zIndex = "10000";
        s.position = 'absolute';
        s.top = top;
        this.container.appendChild( labels );
        this.container.appendChild( this.values );
        document.body.appendChild( this.container );
	},

    // _______________________________________________________________________________________ Update

    update: function() {

        this.values.innerHTML = this.renderer.data.vertices;
        this.values.innerHTML += '</br>' + this.renderer.data.faces;
        this.values.innerHTML += '</br>' + this.renderer.data.drawCalls;
    }
};