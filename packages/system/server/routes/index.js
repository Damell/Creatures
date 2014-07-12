'use strict';

module.exports = function(System, app, auth, database) {

	// Home route
	var index = require('../controllers/index');
	app.route('/') .get(index.render);

	app.io.on('connection', function (socket) {

		/**
		 * Update users waiting for game
		 */
		socket.on('start', function (data) {
			socket.broadcast.emit('join', data);
			socket.broadcast.emit('echo', '');
		});
		
		socket.on('prev_connected', function (data) {
			socket.broadcast.emit('prev_connected', data);
		});

		/**
		 * Init game
		 */
		socket.on('initGame', function (data) {
			socket.join(data.room);
			socket.broadcast.emit('initGame', data);
		});

		socket.on('joinGame', function (data) {
			socket.join(data.room);
			socket.to(data.room).emit('gameConnection', data);
		});

		/**
		 * Game connection
		 */
		socket.on('gameConnection', function (data) {
			socket.to(data.room).emit('gameConnection', data);
		});
	});

};
