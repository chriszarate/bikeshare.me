/*
 * Released under the WTFPL (Do What the Fuck You Want to Public License)
 */

// Dependencies
var http = require('http'),
    path = require('path'),
    fs = require('fs'),

// Options for HTTP request.
apiURL = 'http://citibikenyc.com/stations/json',

// City code.
cityCode = 'nyc',

// File name for API cache.
outputCache = path.resolve(__dirname, '../app/build/stations.js'),

// Standardize abbreviations and grammar.
replacements = [
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
  ['Square', 'Sq'],
  [' - ', '—'],
  ["'", '’']
],

// Provide alternate names for some stations.
alternateNames = {
  '382': 'Union Sq',
  '285': 'Union Sq',
  '497': 'Union Sq',
  '293': 'Astor Pl',
  '304': 'Bowling Green',
  '444': 'Madison Sq',
  '402': 'Madison Sq',
  '517': 'Grand Central',
  '519': 'Grand Central',
  '318': 'Grand Central',
  '153': 'Bryant Park',
  '465': 'Times Sq',
  '490': 'Penn Station',
  '492': 'Penn Station',
  '379': 'Penn Station',
  '521': 'Penn Station',
  '477': 'Port Authority',
  '529': 'Port Authority',
  '538': 'Rockefeller Center',
  '504': 'Stuyvesant Town',
  '511': 'Stuyvesant Town',
  '2003': 'Stuyvesant Town',
  '487': 'Stuyvesant Town / Peter Cooper Village',
  '545': 'Peter Cooper Village',
  '387': 'Brooklyn Bridge / City Hall',
  '3002': 'World Financial Center',
  '427': 'Staten Island Ferry',
  '259': 'Staten Island Ferry',
  '534': 'Staten Island Ferry',
  '315': 'Pier 11',
  '458': 'Chelsea Piers',
  '459': 'Chelsea Piers',
  '498': 'Herald Sq',
  '505': 'Hearld Sq'
},

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
      var title = makeReplacements(station.stationName),
      stationData = {
        id: station.id,
        title: title,
        alt: alternateNames[station.id] || false,
        lat: station.latitude,
        lng: station.longitude
      };
      stationData.alt || delete stationData.alt;
      stations[station.id] = stationData;
    }
  });

  return 'var config={},cache={"city":"' + cityCode + '","stations":' + JSON.stringify(stations) + '};';

},

makeReplacements = function(str) {

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
