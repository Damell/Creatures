/*global angular, d3*/
'use strict';

angular.module('mean.system')
.controller('BattleController', ['$scope', 'Global', 'socket', function ($scope, Global, socket) {
    $scope.global = Global;
    console.log( 'Battle started' );

    // Game state is contiained in this structure, which is synchronized between devices
    var gameState,
        me,
        opponent,
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

    // Helper functions and behaviours for creatures
    var positionCreature = function( creature ) {
      creature
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; })
        .attr('r', creatureSize);
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
        //console.log( 'Dragged in direction:' );
        //console.log( dragDirection );
        var shot = {
          position: start,
          direction: dragDirection,
          player: me
        };

        fire( shot );
      });

    fire = function( shot ) {
      // Normalize direction
      var factor = shot.direction.y > 0 ? ( height - shot.position.y - 50 ) / shot.direction.y : ( shot.position.y -50 ) / shot.direction.y;
      shot.direction.x *= factor;
      shot.direction.y *= factor;
      gameState.shots.push( shot );
      updateArena();
    };

    // Rendering, binds actions to SVG elements using d3
    updateArena = function() {
      // Add creatures for player one (assuming it's `me`)
      var creatures = arena.selectAll( 'circle.me' )
        .data( me.creatures ) // Bind creatures data set to selection
        .enter().append( 'circle' )
          .classed('me', true)
          .call( positionCreature );

      // Add creatures for player two (assuming it's the opponent)
      arena.selectAll( 'circle.opponent' )
        .data( opponent.creatures ) // Bind creatures data set to selection
        .enter().append( 'circle' )
          .classed('opponent', true)
          .call( positionCreature );

      // Add health labels
      var health = arena.selectAll( 'text.health' )
        .data( me.creatures.concat( opponent.creatures ) );

      health
        .enter().append( 'text' )
          .classed('health', true)
          .style('fill', '#ff7700')
          .attr('x', function(d) { return d.position.x; })
          .attr('y', function(d) { return d.position.y; });

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
            for ( var c in opponent.creatures ) {
              var creature = opponent.creatures[c];
              if ( Math.abs( d.position.x + d.direction.x - creature.position.x ) < 1.1 * creatureSize ) {
                creature.health -= 10;
                updateArena();
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
      // TODO do not hardcode
      me = gameState.players[0];
      opponent = gameState.players[1];
      updateArena();
    });

	$scope.sendData = function (data) {
		var dataReady = window.gameConnection;
		dataReady.data = data;
		socket.emit('gameConnection', dataReady);
	};

	socket.on('gameConnection' function (data) {
		console.log(data);
	});
	sendData();

}]);
