'use strict';

//Global service for global variables
angular.module('mean.system').factory('Game', ['$http', 'socket', function ($http, socket) {
	return {
		getCreatures: function() {
			return $http.get('/creatures/' + window.user.username);
		},
		update: function(data) {
		}
	};
}
]);
