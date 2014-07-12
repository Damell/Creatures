'use strict';

module.exports = function(System, app, auth, database) {

	// Home route
	var index = require('../controllers/index');
	app.route('/') .get(index.render);

	app.io.on('connection', function (socket) {

		socket.on('connect', function (data) {
			app.io.emit('join', data);
			app.io.emit('echo');
		});
		
		app.io.on('prev_connected', function (data) {
			app.io.emit('join', data);
		});

		// event listeners
		socket.on('my other event', function (data) {
			// call your controller function here
		});
	});

};
