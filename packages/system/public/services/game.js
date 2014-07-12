'use strict';

//Global service for global variables
angular.module('mean.system').factory('Game', ['$http', 'socket', function ($http, socket) {
	return {
		get: function() {
			return $http.get('/gameData/' + window.user.username);
		},
		update: function(data) {
			return $http.post('/gameData/' + window.user.username, data);
		}
	};
}
]);
