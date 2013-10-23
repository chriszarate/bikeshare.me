/* API module */

app.module('api', function(api, app, Backbone, Marionette, $) {

  // Standardize abbreviations and grammar.
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
    ['Square', 'Sq'],
    [' - ', '—'],
    ['\'', '’']
  ],

  // Request availablility data.
  fetchUpdate = function(geolocate) {

    // Hide existing availability information.
    $('.bikes, .docks').hide();

    // Fetch API response.
    api.promise = $.ajax({
      url: config.api[config.city].url,
      dataType: 'jsonp',
      timeout: 5000
    })
    .then(parseStations)
    .then(populateAvailability)
    .fail(showError);

    // Start geolocation, if requested.
    if(geolocate) {
      app.vent.trigger('geolocation:initialize');
    }

  },

  // Parse station data.
  parseStations = function(stations) {

    // Default attribute map.
    var defaultMap = {
      id: 'id',
      status: 'status',
      title: 'name',
      lat: 'lat',
      lng: 'lng',
      bikes: 'bikes',
      docks: 'free'
    },

    // Get attribute map if one is supplied.
    map = config.api[config.city].attributeMap || defaultMap;

    // Drill down in results if required.
    if(map.root) {
      stations = stations[map.root];
    }

    // Cache station information.
    config.stations = {};
    $.each(stations, function(i, station) {
      var id = station[map.id],
          bikes = station[map.bikes],
          docks = station[map.docks];
      config.stations[id] = {
        id: id,
        title: makeReplacements(station[map.title]),
        alt: config.api[config.city].altNames[id] || false,
        lat: station[map.lat],
        lng: station[map.lng],
        availability: {
          available: {
            bikes: bikes,
            docks: docks
          },
          flags: {
            station: parseStatus(station[map.status]),
            bikes: applyUIThreshholds(bikes),
            docks: applyUIThreshholds(docks)
          }
        }
      };
    });

    // Change last updated date.
    if($.isEmptyObject(config.stations)) {
      showError();
    } else {
      app.vent.trigger('messages:api:updated', new Date());
    }

  },

  // Parse various statuses.
  parseStatus = function(status) {
    switch(status) {
    case 'In Service':
    case 'Active':
    case 'true':
    case true:
    case '1':
    case 1:
    case undefined:
      return 'active';
    default:
      return 'inactive';
    }
  },

  // Update station availability.
  updateAvailability = function() {

    // Request update.
    fetchUpdate();

    // Send event triggers.
    app.vent.trigger('messages:reset');

  },

  // Send availability data to stations view.
  populateAvailability = function() {
    if(!$.isEmptyObject(config.stations)) {
      app.main.currentView.populateAvailability(config.stations);
      if(app.nearby.currentView) {
        app.nearby.currentView.populateAvailability(config.stations);
      }
      if(Backbone.history.fragment.indexOf('/') === -1) {
        app.vent.trigger('suggestions:initialize:stations', config.stations);
      }
    }
  },

  // Show server error message.
  showError = function() {
    app.vent.trigger('geolocation:hide');
    app.vent.trigger('messages:api:error', 'Could not connect to the server.');
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

  // Apply warning threshholds to availability data.
  applyUIThreshholds = function(num) {
    if(num < config.threshholds.danger) {
      return 'danger';
    }
    if(num < config.threshholds.caution) {
      return 'caution';
    }
    return 'ok';
  };

  // API endpoints and parsing functions.
  config.api = {
    nyc: {
      id: 'nyc',
      title: 'New York CitiBike',
      url: 'http://appservices.citibikenyc.com/data2/stations.php',
      map: 'http://api.citybik.es/citibikenyc.html',
      attributeMap: {
        root: 'results',
        id: 'id',
        status: 'status',
        title: 'label',
        lat: 'latitude',
        lng: 'longitude',
        bikes: 'availableBikes',
        docks: 'availableDocks'
      },
      altNames: {
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
        '505': 'Herald Sq'
      }
    },
    montreal: {
      id: 'montreal',
      title: 'Montreal Bixi',
      url: 'http://api.citybik.es/bixi.json',
      altNames: {}
    },
    dc: {
      id: 'dc',
      title: 'Washington D.C. Capital BikeShare',
      url: 'http://api.citybik.es/capitalbikeshare.json',
      altNames: {}
    },
    chicago: {
      id: 'chicago',
      title: 'Chicago Divvy',
      url: 'http://api.citybik.es/divvybikes.json',
      altNames: {}
    },
    london: {
      id: 'london',
      title: 'London Barclays Cycle Hire',
      url: 'http://api.citybik.es/barclays.json',
      altNames: {}
    },
    paris: {
      id: 'paris',
      title: 'Paris Velib',
      url: 'http://api.citybik.es/velib.json',
      altNames: {}
    },
    msp: {
      id: 'msp',
      title: 'Minneapolis–St. Paul NiceRide',
      url: 'http://api.citybik.es/niceride.json',
      altNames: {}
    }
  };

  // Placeholder for API response promise.
  api.promise = false;

  // Bind to "refresh" button.
  config.els.api.button.on('click', updateAvailability);

  // Bind to events.
  app.vent.bind('api:update:fetch', fetchUpdate);

});
