'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // For unmatched routes:
        $urlRouterProvider.otherwise('/');

        // states for my app
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'system/views/index.html'
            })
            .state('creature', {
                url: '/creature',
                templateUrl: 'system/views/creature.html'
            })
            .state('battle', {
                url: '/battle',
                templateUrl: 'system/views/battle.html'
            });
    }
]).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
