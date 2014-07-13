'use strict';

var sliderApp=angular.module('mean.users',['ngAnimate']);

sliderApp.directive('slider', function () {
  /*jslint unparam: true*/
  return {
    restrict: 'AE',
	replace: true,
	scope:{
		images: '='
	},
    link: function (scope, elem, attrs) {

		scope.currentIndex=0;

		scope.next=function(){
			if (scope.currentIndex<scope.images.length-1){
        scope.currentIndex++;}
        else{
          scope.currentIndex=0;
        }
		};

		scope.prev=function(){
			if (scope.currentIndex>0){
        scope.currentIndex--;}else{
          scope.currentIndex=scope.images.length-1;
        }
		};

		scope.$watch('currentIndex',function(){
			scope.images.forEach(function(image){
				image.visible=false;
			});
			scope.images[scope.currentIndex].visible=true;
		});


    },
	templateUrl:'/users/assets/templates/slider-tmpl.html'
  };
});
