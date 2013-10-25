/* API module */

app.module('api', function(api, app, Backbone, Marionette, $) {

  // Standardize abbreviations and grammar.
  var replacements = [
    ['/', ' / '],
    [' +', ' '],
    ['Street', 'St'],
    [' st$', ' St'],
    ['St. /', 'St /'],
    ['Avenue', 'Ave'],
    ['Av ', 'Ave '],
    ['Av$', 'Ave'],
    ['East ([0-9])', 'E $1'],
    ['West ([0-9])', 'W $1'],
    [' and ', ' & '],
    ['Plz', 'Plaza'],
    ['Pza', 'Plaza'],
    ['Place', 'Pl'],
    ['Square', 'Sq'],
    ['Court', 'Ct'],
    ['Crt', 'Ct'],
    [' - ', '—'],
    ['\'', '’'],
    ['^[0-9]+[—_]', '']
  ],

  // Convert from E6 geodata to decimal.
  convertE6 = function(int) {
    return int / 1000000;
  },

  // Request availablility data.
  fetchUpdate = function(geolocate) {

    // Send event triggers.
    app.vent.trigger('messages:reset');
    app.vent.trigger('messages:api:loading');

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
          docks = station[map.docks],
          lat = station[map.lat],
          lng = station[map.lng];
      config.stations[id] = {
        id: id,
        title: makeReplacements(station[map.title], map.ordinals),
        alt: config.api[config.city].altNames[id] || false,
        lat: (Math.abs(lat) > 1000) ? convertE6(lat) : lat,
        lng: (Math.abs(lng) > 1000) ? convertE6(lng) : lng,
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

  makeReplacements = function(str, ordinals) {

    // Replacements
    replacements.forEach(function(replacement) {
      var regex = new RegExp(replacement[0], 'g');
      str = str.replace(regex, replacement[1]);
    });

    // Ordinals :/
    if(ordinals) {
      str = str.replace(/([0-9]+) /g, makeOrdinals);
      str = str.replace(/([0-9]+)$/, makeOrdinals);
    }

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
        docks: 'availableDocks',
        ordinals: true
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
      oid: 21,
      title: 'BIXI Montréal',
      url: 'http://api.citybik.es/bixi.json',
      lat: 45507330,
      lng: -73578450,
      altNames: {}
    },
    dc: {
      id: 'dc',
      oid: 24,
      title: 'Washington D.C. Capital BikeShare',
      url: 'http://api.citybik.es/capitalbikeshare.json',
      lat: 38894000,
      lng: -76947974,
      altNames: {}
    },
    chicago: {
      id: 'chicago',
      oid: 55,
      title: 'Chicago Divvy',
      url: 'http://api.citybik.es/divvybikes.json',
      lat: 41897448,
      lng: -87628722,
      altNames: {}
    },
    london: {
      id: 'london',
      oid: 12,
      title: 'London Barclays Cycle Hire',
      url: 'http://api.citybik.es/barclays.json',
      lat: 51488365,
      lng: -129361,
      altNames: {}
    },
    paris: {
      id: 'paris',
      oid: 3,
      title: 'Paris Velib',
      url: 'http://api.citybik.es/velib.json',
      lat: 48874575,
      lng: 2356796,
      altNames: {}
    },
    msp: {
      id: 'msp',
      oid: 25,
      title: 'Minneapolis–St. Paul NiceRide',
      url: 'http://api.citybik.es/niceride.json',
      lat: 44975641,
      lng: -93272185,
      altNames: {}
    },
    melbourne: {
      id: 'melbourne',
      oid: 22,
      title: 'Melbourne Bike Share',
      url: 'http://api.citybik.es/melbourne.json',
      lat: -37818306,
      lng: 144945923,
      altNames: {}
    },
    mexico: {
      id: 'mexico',
      oid: 13,
      title: 'México, D.F. ECOBICI',
      url: 'http://api.citybik.es/ecobici.json',
      lat: 19434353,
      lng: -99203220,
      altNames: {}
    },
    barcelona: {
      id: 'barcelona',
      oid: 6,
      title: 'Barcelona Bicing',
      url: 'http://api.citybik.es/bicing.json',
      lat: 41398298,
      lng: 2153128,
      altNames: {}
    },
    brisbane: {
      id: 'brisbane',
      oid: 16,
      title: 'CityCycle Brisbane',
      url: 'http://api.citybik.es/citycycle.json',
      lat: -27471297,
      lng: 153022570,
      altNames: {}
    },
    seville: {
      id: 'seville',
      oid: 0,
      title: 'Sevilla Sevici',
      url: 'http://api.citybik.es/sevici.json',
      lat: 37371724,
      lng: -6003312,
      altNames: {}
    },
    dublin: {
      id: 'dublin',
      oid: 1,
      title: 'Dublin dublinbikes',
      url: 'http://api.citybik.es/dublin.json',
      lat: 53330662,
      lng: -6260177,
      altNames: {}
    },
    wien: {
      id: 'wien',
      oid: 17,
      title: 'CityBike Wien',
      url: 'http://api.citybik.es/wien.json',
      lat: 48192986,
      lng: 16398464,
      altNames: {}
    },
    denver: {
      id: 'denver',
      oid: 26,
      title: 'Denver B-cycle',
      url: 'http://api.citybik.es/denver.json',
      lat: 39679180,
      lng: -104962990,
      altNames: {}
    },
    desmoines: {
      id: 'desmoines',
      oid: 27,
      title: 'Des Moines B-cycle',
      url: 'http://api.citybik.es/desmoines.json',
      lat: 41587640,
      lng: -93626200,
      altNames: {}
    },
    sanantonio: {
      id: 'sanantonio',
      oid: 28,
      title: 'San Antonio B-cycle',
      url: 'http://api.citybik.es/sanantonio.json',
      lat: 29443560,
      lng: -98479460,
      altNames: {}
    },
    torino: {
      id: 'torino',
      oid: 29,
      title: 'Torino [TO]Bike',
      url: 'http://api.citybik.es/tobike.json',
      lat: 45067019,
      lng: 7678306,
      altNames: {}
    },
    hawaii: {
      id: 'hawaii',
      oid: 30,
      title: 'Hawai\'i B-cycle',
      url: 'http://api.citybik.es/hawaii.json',
      lat: 21392340,
      lng: -157740980,
      altNames: {}
    },
    ljubljana: {
      id: 'ljubljana',
      oid: 31,
      title: 'Ljubljana BicikeLJ',
      url: 'http://api.citybik.es/bicikelj.json',
      lat: 46057421,
      lng: 14510265,
      altNames: {}
    },
    boulder: {
      id: 'boulder',
      oid: 32,
      title: 'Boulder B-cycle',
      url: 'http://api.citybik.es/boulder.json',
      lat: 40013770,
      lng: -105280870,
      altNames: {}
    },
    milano: {
      id: 'milano',
      oid: 33,
      title: 'Milano BikeMi',
      url: 'http://api.citybik.es/bikemi.json',
      lat: 45452319,
      lng: 9177407,
      altNames: {}
    },
    roma: {
      id: 'roma',
      oid: 38,
      title: 'Roma Bike Sharing',
      url: 'http://api.citybik.es/rome.json',
      lat: 41900074,
      lng: 12473173,
      altNames: {}
    },
    venezia: {
      id: 'venezia',
      oid: 39,
      title: 'Bike Sharing Venezia',
      url: 'http://api.citybik.es/venice.json',
      lat: 45479978,
      lng: 12230497,
      altNames: {}
    },
    toronto: {
      id: 'toronto',
      oid: 41,
      title: 'BIXI Toronto',
      url: 'http://api2.citybik.es/toronto.json',
      lat: 43653743,
      lng: -79388820,
      altNames: {}
    },
    madison: {
      id: 'madison',
      oid: 42,
      title: 'Madison B-cycle',
      url: 'http://api.citybik.es/madison.json',
      lat: 43067540,
      lng: -89414030,
      altNames: {}
    },
    ottawa: {
      id: 'ottawa',
      oid: 45,
      title: 'Ottawa Capital BIXI',
      url: 'http://api.citybik.es/ottawa.json',
      lat: 45428997,
      lng: -75691066,
      altNames: {}
    },
    broward: {
      id: 'broward',
      oid: 46,
      title: 'Broward B-cycle',
      url: 'http://api.citybik.es/broward.json',
      lat: 26167390,
      lng: -80100320,
      altNames: {}
    },
    charlotte: {
      id: 'charlotte',
      oid: 47,
      title: 'Charlotte B-cycle',
      url: 'http://api.citybik.es/charlotte.json',
      lat: 35224430,
      lng: -80839780,
      altNames: {}
    },
    fortworth: {
      id: 'fortworth',
      oid: 48,
      title: 'Fort Worth B-cycle',
      url: 'http://api.citybik.es/fortworth.json',
      lat: 32745780,
      lng: -97311300,
      altNames: {}
    },
    greenville: {
      id: 'greenville',
      oid: 49,
      title: 'Greenville B-cycle',
      url: 'http://api.citybik.es/greenville.json',
      lat: 34845010,
      lng: -82404480,
      altNames: {}
    },
    houston: {
      id: 'houston',
      oid: 50,
      title: 'Houston B-cycle',
      url: 'http://api.citybik.es/houston.json',
      lat: 29757370,
      lng: -95367620,
      altNames: {}
    },
    nashville: {
      id: 'nashville',
      oid: 51,
      title: 'Nashville B-cycle',
      url: 'http://api.citybik.es/nashville.json',
      lat: 36162520,
      lng: -86774260,
      altNames: {}
    },
    spartanburg: {
      id: 'spartanburg',
      oid: 52,
      title: 'Spartanburg B-cycle',
      url: 'http://api.citybik.es/spartanburg.json',
      lat: 34947470,
      lng: -81921740,
      altNames: {}
    },
    kansascity: {
      id: 'kansascity',
      oid: 53,
      title: 'Kansas City B-cycle',
      url: 'http://api.citybik.es/kansas.json',
      lat: 39110540,
      lng: -94580740,
      altNames: {}
    },
    omaha: {
      id: 'omaha',
      oid: 54,
      title: 'Omaha B-cycle',
      url: 'http://api.citybik.es/omaha.json',
      lat: 41238050,
      lng: -96013500,
      altNames: {}
    },
    padova: {
      id: 'padova',
      oid: 56,
      title: 'GoodBike Padova',
      url: 'http://api.citybik.es/goodbike.json',
      lat: 45408944,
      lng: 11878805,
      altNames: {}
    }
  };

  // Placeholder for API response promise.
  api.promise = false;

  // Bind to "refresh" button.
  config.els.api.button.on('click', fetchUpdate);

  // Bind to events.
  app.vent.bind('api:update:fetch', fetchUpdate);

});
