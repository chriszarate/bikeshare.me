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
    '505': 'Herald Sq'
  },

  // Request availablility data.
  fetchUpdate = function(geolocate) {

    // Hide existing availability information.
    $('.bikes, .docks').hide();

    // Fetch API response.
    api.promise = $.ajax(config.api[config.city].ajaxOptions)
      .then(config.api[config.city].parseData)
      .then(populateAvailability)
      .fail(showError);

    // Start geolocation, if requested.
    if(geolocate) {
      app.vent.trigger('geolocation:initialize');
    }

  },

  // Data parsing functions.
  parseDataNYC = function(data) {

    if(data.ok) {

      // Pass along messages from the API.
      if(data.meta.length) {
        var warning = $.map(data.meta, function(str) { return str; });
        app.vent.trigger('messages:warn', warning.join('<br>'));
      }

      // Cache station IDs.
      config.stations = {};
      $.each(data.results, function(i, station) {
        config.stations[station.id] = {
          id: station.id,
          title: makeReplacements(station.label),
          alt: alternateNames[station.id] || false,
          lat: station.latitude,
          lng: station.longitude,
          availability: {
            status: station.status,
            available: {
              bikes: station.availableBikes,
              docks: station.availableDocks
            },
            flags: {
              station: station.status.toLowerCase(),
              bikes: applyUIThreshholds(station.availableBikes),
              docks: applyUIThreshholds(station.availableDocks)
            }
          }
        };
      });

      // Change last updated date.
      app.vent.trigger('messages:api:updated', new Date());

    } else {

      // Data was not usable.
      app.vent.trigger('messages:api:error', 'Cannot read availability data.');

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
    app.main.currentView.populateAvailability(config.stations);
    if(app.nearby.currentView) {
      app.nearby.currentView.populateAvailability(config.stations);
    }
    app.vent.trigger('suggestions:initialize', config.stations);
  },

  // Show server error message.
  showError = function() {
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
      ajaxOptions: {
        url: 'http://appservices.citibikenyc.com/data2/stations.php',
        dataType: 'jsonp',
        timeout: 5000
      },
      parseData: parseDataNYC
    },
    chicago: {
      apiBaseURL: 'http://appservices.citibikenyc.com',
      apiUpdatePath: '/data2/stations.php?updateOnly=true'
    }
  };

  // Placeholder for API response promise.
  api.promise = false;

  // Bind to "refresh" button.
  config.els.api.button.on('click', updateAvailability);

  // Bind to events.
  app.vent.bind('api:update:fetch', fetchUpdate);

});
