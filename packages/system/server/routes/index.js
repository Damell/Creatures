'use strict';

module.exports = function(System, app, auth, database) {

	// Home route
	var index = require('../controllers/index');
	app.route('/') .get(index.render);

	app.io.on('connection', function (socket) {

		socket.on('start', function (data) {
			console.log('connect ' + data);
			app.io.emit('join', data);
			app.io.emit('echo');
		});
		
		app.io.on('prev_connected', function (data) {
			console.log('prev_connected ' + data);
			app.io.emit('prev_connected', data);
		});

		// event listeners
		socket.on('my other event', function (data) {
			// call your controller function here
		});
	});

};
