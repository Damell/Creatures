'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$scope', 'Global', 'Game', 'socket', '$location', function ($scope, Global, Game, socket, $location) {
    $scope.global = Global;
	$scope.battleStartUsers = [];
	$scope.battleStarting = false;
	var username = window.user.username;
	window.user.battleCreatures = [];

	Game.get().success(function (data) { 
		console.log(data);
		$scope.food = data.food;
		$scope.creatures = data.creatures;
		data.food = 5;
		Game.update(data).success(function (data) { 
		});
	});

	$scope.update = function () {
		var data = { 
			creatures: $scope.creatures,
			food: $scope.food 
		};
		Game.update(data).success(function (data) { 
			$scope.food = data.food;
			$scope.creatures = data.creatures;
		});
	};

	$scope.feed = function () {
	};

	$scope.feedCreature = function (creature) {
		creature.health += 10;
		creature.attack += 2;
		creature.defense += 1;
		$scope.update();
		//$scope.creatures[$scope.creatures.indexOf(creature)];
	};

	$scope.selectCreature = function (creature) {
		if ( window.user.battleCreatures.length < 3) {
			window.user.battleCreatures.push(creature);
		}
	};


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
			$scope.battleStarting = true;
		}
	});

	socket.on('gameConnection', function(data) {
		window.gameConnection = data;
		socket.removeAllListeners();
		$scope.battleStarting = true;
	});
	$scope.startBattle = function () {
		console.log(window.user.battleCreatures);
		$location.url('/battle');
	};

}]);
