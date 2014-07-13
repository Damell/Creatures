'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$rootScope', '$scope', 'Global', 'Game', 'socket', '$location', function ($rootScope, $scope, Global, Game, socket, $location) {
    $scope.global = Global;
	$scope.battleStartUsers = [];
	$scope.battleStarting = false;
	if (window.user.username === undefined) {
		window.user = $rootScope.user;
	}
	var username = window.user.username;
	window.user.battleCreatures = [];
	$scope.newCreature = {
		name: window.user.username + '\'s Creature',
		attack: 10,
		health: 50,
		defense: 5
	};

	Game.get().success(function (data) { 
		console.log(data);
		$scope.food = data.food;
		$scope.creatures = data.creatures;
		if (window.user.food > 0) {
			$scope.food += window.user.food;
			$scope.update();
		}
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
		if ($scope.food > 0) {
			creature.health += 10;
			creature.attack += 2;
			creature.defense += 1;
			$scope.food -= 1;
			$scope.update();
		}
		//$scope.creatures[$scope.creatures.indexOf(creature)];
	};

	$scope.selectCreature = function (creature) {
		if ( window.user.battleCreatures.length < 3 && window.user.battleCreatures.indexOf(creature) === -1 ) {
			window.user.battleCreatures.push(creature);
		}
	};

	$scope.addCreature = function () {
		$scope.creatures.push(angular.copy($scope.newCreature));
		$scope.update();
		$scope.creatingCreature = false;
	};

	$scope.creatureActive = function (creature) {
		return window.user.battleCreatures.indexOf(creature) !== -1;
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
			$scope.feeding = false;
			$scope.creatingCreature = false;
			$scope.showConnected = false;
		}
	});

	socket.on('gameConnection', function(data) {
		window.gameConnection = data;
		socket.removeAllListeners();
		$scope.battleStarting = true;
		$scope.feeding = false;
		$scope.creatingCreature = false;
		$scope.showConnected = false;
	});
	$scope.startBattle = function () {
		console.log(window.user.battleCreatures);
		$location.url('/battle');
	};

}]);
