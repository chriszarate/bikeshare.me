/*
 * Released under the WTFPL (Do What the Fuck You Want to Public License)
 */

// Dependencies
var http = require('http'),
    fs = require('fs'),

// Options for HTTP request.
apiURL = 'http://citibikenyc.com/stations/json',

// City code.
cityCode = 'nyc',

// File name for API cache.
outputCache = '../app/build/stations.js',

// Process HTTP response.
getData = function(res) {

  if(res.statusCode === 200) {

    var output = '';

    // Collect chunks.
    res.on('data', function(chunk) {
      output += chunk;
    });

    // Process full response.
    res.on('end', function() {

      // Parse data.
      output = parseData(output);

      // Write to cache.
      fs.writeFile(outputCache, output);


    });

  } else {
    console.log(res.statusCode);
  }

},

// Parse response to extract details of latest strike.
parseData = function(data) {

  // Parse data as JSON.
  var obj = JSON.parse(data),

  // New target object.
  stations = {};

  obj.stationBeanList.forEach(function(station) {
    if(!station.testStation) {
      var title = makeReplacements(station.stationName);
      stations[station.id] = {
        id: station.id,
        title: title
      };
    }
  });

  return 'var config={},cache={"city":"' + cityCode + '","stations":' + JSON.stringify(stations) + '};';

},

makeReplacements = function(str) {

  var replacements = [
    [' +', ' '],
    ['Street', 'St'],
    [' st$', ' St'],
    ['Avenue', 'Ave'],
    ['Av ', 'Ave '],
    ['Av$', 'Ave'],
    ['East ([0-9])', 'E $1'],
    ['West ([0-9])', 'W $1'],
    [' and ', ' & '],
    ['Plz', 'Plaza'],
    ['Place', 'Pl'],
    [' - ', '—'],
    ["'", '’']
  ];

  // Replacements
  replacements.forEach(function(replacement) {
    var regex = new RegExp(replacement[0], 'g');
    str = str.replace(regex, replacement[1]);
  });

  // Ordinals :/
  str = str.replace(/([0-9]+) /g, makeOrdinals);
  str = str.replace(/([0-9]+)$/, makeOrdinals);

  return str;

},

makeOrdinals = function(match, submatch) {

  var lastChar = submatch[submatch.length - 1],
      irregular = ['11', '12', '13'],
      ordinal = 'th';

  if(irregular.indexOf(submatch) === -1) {
    if(lastChar === '1') {
      ordinal = 'st';
    }
    if(lastChar === '2') {
      ordinal = 'nd';
    }
    if(lastChar === '3') {
      ordinal = 'rd';
    }
  }

  return match.replace(submatch, submatch + ordinal);

};

// Send request.
http.get(apiURL, getData);
