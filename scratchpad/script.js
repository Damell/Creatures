/*global d3*/
console.log( 'hi' );
d3.json("data.json", function(error, json) {
  if (error) {
    return console.warn(error);
  }
  console.log( json );
});
