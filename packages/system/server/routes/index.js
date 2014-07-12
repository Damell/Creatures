'use strict';

module.exports = function(System, app, auth, database) {

	// Home route
	var index = require('../controllers/index');
	app.route('/') .get(index.render);

	app.io.on('connection', function (socket) {
		// emit data to the clients
		socket.emit('hello', { hello: 'world' });
		app.io.emit('hello', { hello: 'world' });

		// event listeners
		socket.on('my other event', function (data) {
			// call your controller function here
		});
	});

};
