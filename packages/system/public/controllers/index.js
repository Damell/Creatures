'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
	$scope.battleStartUsers = [];

	socket.emit('connect', user.username);
	socket.on('echo', function() {
		socket.emit('prev_connected', user.username);
	});
	socket.on('join', function (user) {
		console.log( 'join ' + user);
		$scope.battleStartUsers.push(user);
		$.unique($scope.battleStartUsers);
	});
	socket.on('prev_connected', function (user) {
		console.log( 'prev_connected ' + user);
		$scope.battleStartUsers.push(user);
		$.unique($scope.battleStartUsers);
	});

	socket.on('join', function () {
		console.log('join');
	});
    $scope.global = Global;
}]);
