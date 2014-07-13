'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$scope', 'Global', 'Game', 'socket', '$location', function ($scope, Global, Game, socket, $location) {
    $scope.global = Global;
	$scope.battleStartUsers = [];
   //scope.images=[{src:'img1.png',title:'Pic 1'},{src:'img2.jpg',title:'Pic 2'},{src:'img3.jpg',title:'Pic 3'},{src:'img4.png',title:'Pic 4'},{src:'img5.png',title:'Pic 5'}];

	var username = window.user.username;

	Game.get().success(function (data) {
		data.food = 5;
		Game.update(data).success(function (data) {
			console.log(data);
		});
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
