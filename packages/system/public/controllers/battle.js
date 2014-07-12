/*global angular, d3*/
'use strict';

angular.module('mean.system')
.controller('BattleController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    console.log( 'Battle started' );

    // Game state is contiained in this structure, which is synchronized between devices
    var gameState,
        fire,
        updateArena;
    // Create SVG to hold game arena
    var width = 800;
    var height = 600;
    var creatureSize = 50; // How big creatures should be
    var shotSize = 10; // How big shots should be
    var arena = d3.select('#arena').append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#000000')
      .append('g');

    var init = function() {
      // TODO do not hardcode
      //if ( !shift ) {
        //arena.attr( 'transform', 'translate(0, ' + height / 2 + ')' );
      //}
    };

    // Helper functions and behaviours for creatures
    var positionCreature = function( creature ) {
      creature
        .attr( 'xlink:href', function(d) {
          var uniqueName = d.player + d.id;
          // TODO Massive security hole!!!!!
          return 'http://robohash.org/' + uniqueName;
        } ) 
        .attr('x', function(d) { return d.position.x - 64; })
        .attr('y', function(d) { return d.position.y - 64; })
        .attr('width', 128)
        .attr('height', 128);
    };

    // Add behaviour for dragging, to shoot
    var drag = d3.behavior.drag()
      .origin(function(d) { return d.position; })
      .on('dragstart', function( d ) {
        // Stash away drag points
        d._dragPoints = [];
      })
      .on('drag', function( d ) {
        // Stash
        var point = {
          x: d3.event.x,
          y: d3.event.y
        };
        d._dragPoints.push( point );
      })
      .on('dragend', function( d ) {
        var start = d._dragPoints[0];
        var end = d._dragPoints[d._dragPoints.length - 1];
        console.log( d._dragPoints );
        console.log( start );
        console.log( end );
        var dragDirection = {
          x: end.x - start.x,
          y: end.y - start.y
        };
        console.log( 'Dragged in direction:' );
        console.log( dragDirection );
        var shot = {
          position: start,
          direction: dragDirection,
          creature: d
        };

        fire( shot );
      });

    fire = function( shot ) {
      // Normalize direction
      var factor = shot.direction.y > 0 ? ( height - shot.position.y - 50 ) / shot.direction.y : ( 50 - shot.position.y ) / shot.direction.y;
      shot.direction.x *= factor;
      shot.direction.y *= factor;
      gameState.shots.push( shot );
      updateArena();
	  $scope.sendData(gameState);
    };

    // Rendering, binds actions to SVG elements using d3
    updateArena = function() {
      // Add creatures for player one (assuming it's `me`)
      var creatures = arena.selectAll( 'image.creature' )
        .data( gameState.creatures ) // Bind creatures data set to selection
        .enter().append( 'image' )
          .classed('creature', true)
          .call( positionCreature );

      // Add health labels
      var health = arena.selectAll( 'text.health' )
        .data( gameState.creatures );

      health
        .enter().append( 'text' )
          .classed('health', true)
          .style('fill', '#ff4100')
          .attr('x', function(d) { return d.position.x + 30; })
          .attr('y', function(d) { return d.position.y - 20; });

      health
        .text( function( d ) { return d.health; } );

      // Bind drag behaviour to creatures
      creatures.call( drag );

      // Add shots
      arena.selectAll( 'circle.shot' )
        .data( gameState.shots )
        .enter().append( 'circle' )
          .classed('shot', true)
          .attr('r', shotSize)
          .attr('cx', function(d) { return d.position.x; })
          .attr('cy', function(d) { return d.position.y; })
        .transition()
          .ease( 'linear' )
          .attr('cx', function(d) { return d.position.x + d.direction.x; })
          .attr('cy', function(d) { return d.position.y + d.direction.y; })
          .each( 'end', function( d, i ) {
            // Remove shot at end of animation
            gameState.shots.splice( i, 1 );

            // Check if we hit something (pretty terrible hit-testing, should use line/circle intersection)
            for ( var c in gameState.creatures ) {
              if( gameState.creatures.hasOwnProperty( c ) ) {
                var creature = gameState.creatures[c];
                if ( Math.abs( d.position.x + d.direction.x - creature.position.x ) < 1.1 * creatureSize &&
                     Math.abs( d.position.y + d.direction.y - creature.position.y ) < 2.0 * creatureSize) {
                  creature.health -= 10;
                  updateArena();
                  break;
                }
              }
            }
          })
          .remove();
    };

    d3.json('system/data.json', function(error, json) {
      if (error) {
        return console.warn(error);
      }
      gameState = json;
      init();
      updateArena();
    });

	$scope.sendData = function (data) {
		var dataReady = window.gameConnection;
    if ( dataReady ) {
      dataReady.data = data;
      socket.emit('gameConnection', dataReady);
    }
	};

	socket.on('gameConnection', function (data) {
		gameState = data.data;
		updateArena();
	});

}]);
