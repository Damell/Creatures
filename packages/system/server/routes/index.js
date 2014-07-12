'use strict';

module.exports = function(System, app, auth, database) {

	// Home route
	var index = require('../controllers/index');
	app.route('/') .get(index.render);

	app.io.on('connection', function (socket) {

		socket.on('start', function (data) {
			console.log('connect ' + data);
			socket.broadcast.emit('join', data);
			socket.broadcast.emit('echo', '');
		});
		
		socket.on('prev_connected', function (data) {
			console.log('prev_connected ' + data);
			socket.broadcast.emit('prev_connected', data);
		});

	});

};
