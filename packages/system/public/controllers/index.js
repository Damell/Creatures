'use strict';

angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}])
.controller('CreatureController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
	socket.on('hello', function (data) {
		console.log('hello');
		console.log(data);
	});
	socket.on('broad', function () {
		console.log('broadcast');
	});
    $scope.global = Global;
}]);
