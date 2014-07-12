'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$scope', 'Global', 'Game', 'socket', '$location', function ($scope, Global, Game, socket, $location) {
    $scope.global = Global;
	$scope.battleStartUsers = [];
	var username = window.user.username;

	Game.getCreatures().success(function (data) { 
		console.log(data);
	});

	/**
	 * Update users waiting for game
	 */
	socket.emit('start', username);
	socket.on('echo', function() {
		socket.emit('prev_connected', username);
	});
	socket.on('join', function (user) {
		console.log( 'join ' + user);
		if ($scope.battleStartUsers.indexOf(user) === -1)
		$scope.battleStartUsers.push(user);
	});
	socket.on('prev_connected', function (user) {
		console.log( 'prev_connected ' + user);
		if ($scope.battleStartUsers.indexOf(user) === -1)
		$scope.battleStartUsers.push(user);
	});

	$scope.initGame = function (user) {
		console.log((new Date()).toString());
		socket.emit('initGame', {user: user, room: (new Date()).toString()});
	};

	socket.on('initGame', function(data) {
		if (data.user === username) {
			window.gameConnection = data;
			socket.removeAllListeners();
			data.user = username;
			socket.emit('joinGame', data);
			$location.url('/battle');
		}
	});

	socket.on('gameConnection', function(data) {
		window.gameConnection = data;
		socket.removeAllListeners();
		$location.url('/battle');
	});

}]);
