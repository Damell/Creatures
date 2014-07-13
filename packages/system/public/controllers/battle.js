/*global angular, d3, _*/
'use strict';

angular.module('mean.system')
.controller('BattleController', ['$location', '$scope', 'Global', 'socket', function ($location, $scope, Global, socket) {
	$scope.connectionReady = false;
    $scope.global = Global;
    console.log( 'Battle started' );
    console.log( window.user.battleCreatures );

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

    var checkGameEnd = function() {
      // Select creatures from each team
      var teams = _.partition( gameState.creatures, function( c ) { return c.player === window.user.username; } );
      var dead = function( c ) { return c.health <= 0; };
      if ( _.every( teams[0], dead ) ) {
        console.log( 'You won!' );
		alert('You won!');
		window.user.food = 3;
        $location.url( '/creature' );
        $scope.$apply();
      }
      if ( _.every( teams[1], dead ) ) {
        console.log( 'You lost!' );
		alert('You lost!');
		window.user.food = 1;
        $location.url( '/creature' );
        $scope.$apply();
      }
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
        .data( gameState.creatures ); // Bind creatures data set to selection

      // Create new creatures
      creatures.enter().append( 'image' )
          .classed('creature', true);

      // Only enable interaction on own creatures
      creatures.filter( function( d ) { return d.player === window.user.username; } ).call( drag );

      // Update creatures
      creatures
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
                  checkGameEnd();
                  updateArena();
                  break;
                }
              }
            }
          })
          .remove();
    };

    //d3.json('system/data.json', function(error, json) {
    //  if (error) {
    //    return console.warn(error);
    //  }
    //  gameState = json;
    //  init();
    //  updateArena();
    //});

  // Receive/send data
	$scope.sendData = function (data) {
		var dataReady = {};
		if (window.gameConnection === undefined) {
			alert('Go back and pick an enemy!');
		} else {
			dataReady.room = window.gameConnection.room;
		}
		dataReady.data = data;
		socket.emit('gameConnection', dataReady);
	};

  socket.on('gameConnection', function (data) {
    mergeState( data );
    console.log( gameState );
    updateArena();
	if ( !$scope.connectionReady ) {
		$scope.sendData(gameState);
		$scope.connectionReady = true;
	}
  });

  // Generate game data
  gameState = {
    'creatures': [],
    'shots': []
  };
  for( var a = 0; a < window.user.battleCreatures.length; a++ ) {
    var creature = window.user.battleCreatures[a];
    creature.id = creature._id; // TODO refactor to avoid id duplication
    creature.player = window.user.username;
    creature.position = {
      'x': 50 + 350 * a,
      'y': 50
    };
    gameState.creatures.push( creature );
  }
  console.log( gameState );
  $scope.sendData( gameState );
  init();

  var mergeState = function( data ) {
    console.log( 'Merging state' );
    if ( data.data ) {
      // Combine all creatures
      gameState.creatures = gameState.creatures.concat( data.data.creatures );
      gameState.creatures = _.uniq( gameState.creatures, false, function( d ) { return d.player + d.id; } );

      // Combine all shots
      gameState.shots = gameState.shots.concat( data.data.shots );
      gameState.shots = _.uniq( gameState.shots, false, function( d ) { return d.creature.player + d.creature.id; } );

      // Get players to figure out who to put at bottom
      var players = _.uniq( _.pluck( gameState.creatures, 'player' ) );
      players.sort();

      // Shift bottom player's creatures to bottom of screen
      var bottomPlayer = players[0];
      console.log( 'players ' + players);
      console.log( 'Bottom ' + bottomPlayer);
      _.each( gameState.creatures, function( creature ) {
        if ( creature.player === bottomPlayer ) {
          creature.position.y = 550;
        }
      } );
      //if ( bottomPlayer === me ) {
      //  // Do something...
      //}
    }
  };
}]);
