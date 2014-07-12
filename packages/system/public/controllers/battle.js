/*global angular, d3*/
'use strict';

angular.module('mean.system')
.controller('BattleController', ['$scope', 'Global', function ($scope, Global) {
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
    var arena = d3.select('body').append('svg')
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
        // Stash away drag start location
        d._dragStart = {
          x: d3.event.sourceEvent.x,
          y: d3.event.sourceEvent.y
        };
      })
      .on('dragend', function( d ) {
        var dragDirection = {
          x: d3.event.sourceEvent.x - d._dragStart.x,
          y: d3.event.sourceEvent.y - d._dragStart.y
        };
        //console.log( 'Dragged in direction:' );
        //console.log( dragDirection );
        var shot = {
          position: d._dragStart,
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
}]);
