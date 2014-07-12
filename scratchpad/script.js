/*global d3*/
'use strict';
console.log( 'hi' );
var render = function( data ) {
  // Create SVG to hold game arena
  var width = 800;
  var height = 600;
  var arena = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g');

  var positionCreature = function( creature ) {
    creature
      .attr('cx', function(d) { return d.position.x; })
      .attr('cy', function(d) { return d.position.y; })
      .attr('r', function(d) { return d.health; });
  };

  // Add creatures for player one (assuming it's `me`)
  var creatures = arena.selectAll( 'circle.me' )
    .data( data.players[1].creatures ) // Bind creatures data set to selection
    .enter().append( 'circle' )
    .call( positionCreature )
    .classed('me', true);
  
  // Add creatures for player two (assuming it's the opponent)
  var opponents = arena.selectAll( 'circle.opponent' )
    .data( data.players[0].creatures ) // Bind creatures data set to selection
    .enter().append( 'circle' )
    .call( positionCreature )
    .classed('opponent', true);

  // Add behaviour for dragging, to shoot
  var drag = d3.behavior.drag()
    .origin(function(d) { return d.position; })
    .on('dragstart', function( d ) {
      // Stash away drag start location
      d._dragStart = d3.event.sourceEvent;
    })
    .on('dragend', function( d ) {
      var dragDirection = {
        x: d3.event.sourceEvent.x - d._dragStart.x,
        y: d3.event.sourceEvent.y - d._dragStart.y
      };
      console.log( 'Dragged in direction:' );
      console.log( dragDirection );
    });

  // Bind drag behaviour to creatures
  creatures.call( drag );
};

d3.json('data.json', function(error, json) {
  if (error) {
    return console.warn(error);
  }
  render( json );
});
