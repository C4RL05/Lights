/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 11/08/2011
 * Time: 12:09
 * To change this template use File | Settings | File Templates.
 */


LIGHTS.Stopwatch = function() {

	this.initialize();
};

LIGHTS.Stopwatch.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

		this.date = new Date();
	},

    // _______________________________________________________________________________________ Public

	start: function() {

		this.startTime = this.date.getTime();
	},

	stop: function() {

		this.time = this.date.getTime() - this.startTime;
		console.log( this.time );
	}
}