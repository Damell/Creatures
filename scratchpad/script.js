/*global d3*/
'use strict';

// Game state is contiained in this structure, which is synchronized between devices
var gameState,
    me,
    opponent,
    fire,
    render;

// Create SVG to hold game arena
var width = 800;
var height = 600;
var arena = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g');

// Helper functions and behaviours for creatures
var positionCreature = function( creature ) {
  creature
    .attr('cx', function(d) { return d.position.x; })
    .attr('cy', function(d) { return d.position.y; })
    .attr('r', function(d) { return d.health; });
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
    console.log( 'Dragged in direction:' );
    console.log( dragDirection );
    var shot = {
      position: d._dragStart,
      direction: dragDirection,
      player: me
    };

    fire( shot );
  });

var fire = function( shot ) {
  // Normalize direction
  var factor = shot.direction.y > 0 ? ( height - shot.position.y ) / shot.direction.y : shot.position.y / shot.direction.y;
  shot.direction.x *= factor;
  shot.direction.y *= factor;
  gameState.shots.push( shot );
  render();
};

// Rendering, binds actions to SVG elements using d3
var render = function() {
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

  // Bind drag behaviour to creatures
  creatures.call( drag );

  // Add shots
  arena.selectAll( 'circle.shot' )
    .data( gameState.shots )
    .enter().append( 'circle' )
      .classed('shot', true)
      .attr('r', 10)
      .attr('cx', function(d) { return d.position.x; })
      .attr('cy', function(d) { return d.position.y; })
      .style('fill', '#ffffff')
    .transition()
      .ease( 'linear' )
      .attr('cx', function(d) { return d.position.x + d.direction.x; })
      .attr('cy', function(d) { return d.position.y + d.direction.y; });
};

d3.json('data.json', function(error, json) {
  if (error) {
    return console.warn(error);
  }
  gameState = json;
  // TODO do not hardcode
  me = gameState.players[0];
  opponent = gameState.players[1];
  render();
});
