/* Snapshot module */

app.module('snapshot', function(snapshot, app, Backbone, Marionette, $) {

  // Create a Base-62 constructor.
  var base62 = new Base62(),

  // Valid Base-62 chunk.
  characters = /^[a-e][A-Za-z0-9]+$/,

  // Color markers corresponding to indexes in colorFlags.
  colorMarkers = 'abcdef',

  // Separator.
  separator = /[-\.]/;

  // Encode a station's ID and color index.
  this.encode = function(model) {
    return colorMarkers[model.attributes.color] + base62.encode(parseInt(model.id, 10));
  };

  // Decode a snapshot URL into a station datum.
  this.decode = function(str) {

    var stations = [];

    $.each(str.split(separator), function(i, chunk) {
      if(characters.test(chunk)) {
        var colorIndex = Math.max(colorMarkers.indexOf(chunk[0]), 0),
            id = parseInt(base62.decode(chunk.substring(1)), 10);
        if(!isNaN(id)) {
          stations.push({
            id: id,
            color: colorIndex
          });
        }
      }
    });

    return stations;

  };

});
