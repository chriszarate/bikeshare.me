/*!
 * bikeshare.me v0.1.4
 * Chris Zarate
 * https://github.com/chriszarate/bikeshare.me
 * License: MIT
 */

/* Initialize variables */

var app, config = {};

/* jQuery UI Sortable/Droppable configuration */

config.jqueryui = {
  sortable: {
    handle: '.title',
    items: '> li'
  },
  droppable: {
    hoverClass: 'hovered'
  },
  dropTarget: $('#delete')
};

/* jQuery Timeago configuration */

$.timeago.settings.refreshMillis = 5000;
$.timeago.settings.strings = $.extend($.timeago.settings.strings, {
  suffixAgo: '',
  seconds: 'Updated',
  minute: '1m',
  minutes: '%dm',
  hour: '1h',
  hours: '%dh',
  day: '1d',
  days: '%dd',
  month: '1mo',
  months: '%dmo'
});

/* UI configuration */

// Threshholds
config.threshholds = {
  danger: 5,
  caution: 10
};

// Station CSS classes
config.colorFlags = [
  'color1',
  'color2',
  'color3',
  'color4',
  'color5',
  'color6'
];

config.els = {
  app: {
    main: $('#main')
  },
  api: {
    button: $('#refresh')
  },
  geolocation: {
    main: $('#nearby-stations'),
    container: $('#nearby'),
    button: $('#geolocate'),
    close: $('#nearby .close-button'),
    message: $('#nearby h3')
  },
  messages: {
    error: $('#error'),
    warning: $('#warning'),
    city: $('#city'),
    map: $('#map')
  },
  snapshot: {
    button: $('#snapshot')
  },
  suggestions: {
    stations: {
      main: $('#suggestions'),
      input: $('#station-input'),
      button: $('#add')
    },
    city: {
      main: $('#cities'),
      input: $('#city-input'),
      button: $('#city')
    }
  }
};

/* Station model */

var Station = Backbone.Model.extend({

  // Set defaults.
  defaults: function() {
    return {
      title: 'Loading',
      color: 0,
      order: this.collection.nextOrder()
    };
  },

  // Unsynced attributes.
  availability: {
    available: {},
    flags: {}
  },

  alt: '',
  distance: '',

  _updating: false,

  // Change availability of station.
  updateAvailability: function(data) {
    this._updating = true;
    this.availability = data;
    this.trigger('change');
  },

  // Change availability of station.
  updateDistance: function(data) {
    this._updating = true;
    this.distance = data;
    this.trigger('change');
  },

  // Change the color of station.
  nextColor: function() {
    var i = this.get('color') + 1;
    this.save({
      color: (i < config.colorFlags.length) ? i : 0
    });
  },

  // Get the title of the station.
  getTitle: function() {
    // Use updated station data, if available.
    // Fallback to a shrug.
    return {
      title: (config.stations && config.stations[this.id]) ? config.stations[this.id].title : this.get('title')
    };
  },

  // Get the class name of the color.
  getColor: function() {
    return {
      color: config.colorFlags[this.get('color')]
    };
  },

  // Get the alternate name of the station.
  getAlternate: function() {
    return {
      alt: this.alt
    };
  },

  // Get the distance of the station.
  getDistance: function() {
    return {
      distance: this.distance
    };
  }

});


/* Stations collection */

var Stations = Backbone.Collection.extend({

  model: Station,
  comparator: 'order',

  nextOrder: function() {
    return (!this.length) ? 1 : this.last().get('order') + 1;
  }

});

/* Station view */

var StationView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: JST['app/js/templates/station.tmpl'],

  serializeData: function() {
    return $.extend(
      this.model.toJSON(),
      this.model.availability,
      this.model.getTitle(),
      this.model.getAlternate(),
      this.model.getDistance(),
      this.model.getColor()
    );
  },

  events: {
    'click': 'nextColor',
    'drop:item': 'clear'
  },

  initialize: function(options) {
    this.options = options;
    this.listenTo(this.model, 'change', this.render);
  },

  onBeforeRender: function() {
    if(!this.model._changing && !this.model._updating) {
      this.$el.hide();
    }
  },

  onRender: function() {
    if(!this.model._changing && !this.model._updating) {
      this.$el.slideDown('fast');
    }
    this.model._updating = false;
  },

  nextColor: function() {
    if(this.options.editable) {
      this.model.nextColor();
    }
  },

  clear: function(e) {
    e.stopPropagation();
    this.model.destroy();
  }

});

/* Stations view */

var StationsView = Backbone.Marionette.CollectionView.extend({

  itemView: StationView,

  tagName: 'ul',

  events: {
    'sortstart':  'startDrag',
    'sortstop':   'stopDrag',
    'sortupdate': 'changeOrder'
  },

  initialize: function(options) {

    // Save options.
    this.options = options;

    // Listen to events.
    this.listenTo(this.collection, 'reset', this.updateAvailability);
    this.listenTo(this.collection, 'add', this.updateStation);
    this.listenTo(this.collection, 'add remove change sort reset', this.createSnapshot);

    // Activate dragging and dropping.
    if(this.options.editable) {
      this.startDragDrop();
      this.itemViewOptions = {
        editable: true
      };
    }

  },

  addStation: function(datum) {

    // Add station to collection.
    this.collection.add({
      id: datum.id,
      title: datum.title
    }, datum);

    // Update drag and drop.
    if(this.options.editable) {
      this.updateDragDrop();
    }

  },

  updateStation: function(model, collection, attributes) {

    // Save model as needed.
    if(this.options.editable) {
      model.save();
    }

    // Set availability data, if present.
    if(attributes && attributes.availability) {
      model.updateAvailability(attributes.availability);
    }

    // Set distance data, if present.
    if(attributes && attributes.distance) {
      model.updateDistance(attributes.distance);
    }

  },

  updateAvailability: function() {
    if(config.stations) {
      this.populateAvailability(config.stations);
    }
  },

  populateAvailability: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id]) {
        if(stationData[model.id].availability) {
          model.updateAvailability(stationData[model.id].availability);
        }
      } else {
        // Station does not exist, make it appear inactive.
        model.updateAvailability({
          available: {},
          flags: {station: 'inactive'}
        });
      }
    });
  },

  populateDistance: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id] && stationData[model.id].distance) {
        model.updateDistance(stationData[model.id].distance);
      }
    });
  },

  createSnapshot: function() {
    if(this.options.editable && !this.isSorting) {
      var base62link = this.collection.map(app.snapshot.encode);
      app.vent.trigger('messages:snapshot:link', base62link.join('-'));
    }
  },

  startDragDrop: function() {

    // Make list sortable.
    this.$el.sortable(config.jqueryui.sortable);

    // Make target droppable.
    config.jqueryui.dropTarget
      .droppable(config.jqueryui.droppable)
      .on('drop', this.processDrop);

  },

  updateDragDrop: function() {
    this.$el.sortable('refresh');
  },

  startDrag: function() {
    app.vent.trigger('suggestions:close');
    config.jqueryui.dropTarget.show();
    config.els.suggestions.stations.button.hide();
  },

  stopDrag: function() {
    config.jqueryui.dropTarget.hide();
    config.els.suggestions.stations.button.show();
  },

  processDrop: function(event, ui) {
    ui.draggable.trigger('drop:item');
  },

  changeOrder: function() {

    // Announce sorting.
    this.isSorting = true;

    // Update order of each model (via its view).
    _.each(this.children._views, function(view) {
      var newOrder = view.$el.index() + 1;
      if(newOrder !== view.model.get('order')) {
        view.model.save({order: newOrder});
      }
    });

    // Unannounce sorting.
    this.isSorting = false;

    // Resort and create snapshot.
    this.collection.sort();

  }

});

/* App controller */

var AppController = Marionette.Controller.extend({

  home: function(city) {

    // Create new stations collection.
    var stations = new Stations();

    // Get city.
    this.getCity(city);

    // Set local storage for the collection.
    stations.localStorage = new Backbone.LocalStorage(config.city + '-stations');

    // Append view for saved stations.
    app.main.show(
      new StationsView({
        collection: stations,
        editable: true
      })
    );

    // Append view for nearby stations.
    app.nearby.show(
      new StationsView({
        collection: new Stations()
      })
    );

    // Fetch stations from local storage.
    stations.fetch({reset: true});

    // Remove snapshot class from body.
    $('body').removeClass('snapshot');

    // Send triggers to app modules.
    app.vent.trigger('suggestions:initialize:cities', config.api);
    app.vent.trigger('api:update:fetch', true);

  },

  share: function(city, str) {

    // Decode request.
    var snapshot = app.snapshot.decode(str);

    // Set city.
    this.setCity(city);

    // Proceed if valid.
    if(snapshot.length) {

      // Create new stations collection.
      var stations = new Stations();

      // Append new read-only view.
      app.main.show(
        new StationsView({
          collection: stations
        })
      );

      // Add snapshot stations to read-only view.
      stations.reset(snapshot);

      // Add snapshot class to body.
      $('body').addClass('snapshot');

      // Send triggers to app modules.
      app.vent.trigger('api:update:fetch');

    } else {
      this.error('Could not load snapshot.');
    }

  },

  getCity: function(city) {

    // If no city was supplied, find one in local storage.
    if(!city) {
      if(window.localStorage) {
        city = localStorage.getItem('city') || 'nyc';
      } else {
        this.error('Your browser does not support local storage.');
      }
    }

    // Set city.
    this.setCity(city);

  },

  setCity: function(city) {

    // Strip extraneous characters.
    city = city.replace(/[ \/]+/, '');

    // Make sure requested city is supported.
    if(config.api[city]) {

      // Announce city selection.
      config.city = city;
      localStorage.setItem('city', city);
      app.vent.trigger('messages:city:change', city);

      // Delete existing station data.
      delete config.stations;

    } else {
      this.setCity('nyc');
      this.error('Unsupported city.');
    }

  },

  error: function(message) {
    Backbone.history.navigate('', true);
    app.vent.trigger('messages:error', message);
  }

});

/* Router */

var AppRouter = Marionette.AppRouter.extend({

  appRoutes: {
    ':city/:stations': 'share',
    '*unknown': 'home'
  }

});

/* App */

// Create the app.
app = new Backbone.Marionette.Application();

// Define regions.
app.addRegions({
  main: '#stations',
  nearby: '#nearby-stations'
});

// Create the router and controller.
app.addInitializer(function() {
  app.router = new AppRouter({
    controller: new AppController()
  });
});

// Start the history listener.
app.on('initialize:after', function() {
  Backbone.history.start({pushState: true});
});

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
    map = config.api[config.city].attributeMap || defaultMap,

    // Get title formatter if one is supplied.
    formatter = config.api[config.city].formatter;

    // Drill down in results if required.
    if(map.root) {
      stations = stations[map.root];
    }

    // Cache station information.
    config.stations = {};
    $.each(stations, function(i, station) {
      var id = station[map.id],
          title = makeReplacements(station[map.title], replacements),
          bikes = station[map.bikes],
          docks = station[map.docks],
          lat = station[map.lat],
          lng = station[map.lng];
      config.stations[id] = {
        id: id,
        title: (formatter) ? formatter(title) : title,
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

  // Convert to title case.
  // http://stackoverflow.com/questions/196972/
  titleCase = function(str) {
    return str.replace(/\w\S*/g, function(word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
  },

  // Make an ordinal from a number. 1 -> 1st, 2 -> 2nd, et al.
  makeOrdinal = function(match, submatch) {

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

  // Make ordinals in a string.
  makeOrdinals = function(str) {
    return str.replace(/([0-9]+) /g, makeOrdinal)
              .replace(/([0-9]+)$/, makeOrdinal);
  },

  makeReplacements = function(str, replacementArr) {

    // Replacements
    replacementArr.forEach(function(replacement) {
      var regex = new RegExp(replacement[0], 'g');
      str = str.replace(regex, replacement[1]);
    });

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
      url: 'http://api.citybik.es/citibikenyc.json',
      map: 'http://api.citybik.es/citibikenyc.html',
      lat: 40730286,
      lng: -73990764,
      formatter: makeOrdinals,
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
      formatter: titleCase,
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
      formatter: titleCase,
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
      formatter: titleCase,
      altNames: {}
    },
    seville: {
      id: 'seville',
      oid: 0,
      title: 'Sevilla Sevici',
      url: 'http://api.citybik.es/sevici.json',
      lat: 37371724,
      lng: -6003312,
      formatter: titleCase,
      altNames: {}
    },
    dublin: {
      id: 'dublin',
      oid: 1,
      title: 'Dublin dublinbikes',
      url: 'http://api.citybik.es/dublin.json',
      lat: 53330662,
      lng: -6260177,
      formatter: titleCase,
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
      formatter: titleCase,
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

/* Geolocation module */

app.module('geolocation', function(geolocation, app, Backbone, Marionette, $) {

  // Threshholds and defaults
  var options = {
    enableHighAccuracy: true,  // effectiveness varies
    desiredAccuracy: 20,       // m
    warnableAccuracy: 76.2,    // m
    acceptableAccuracy: 152.4, // m
    usefulRadius: 0.25,        // mi
    flexRadius: 5,             // mi
    timeout: 5000,             // ms
    maximumAge: 0              // ms
  },

  // Information, warnings, and error messages.
  messages = {
    standard: 'Nearby',
    unusable: 'Your location cannot be found within %str% ft.',
    inaccurate: 'Your location is accurate to about %str% ft.',
    tooDistant: 'You are %str% miles from the nearest station.',
    betterChoice: 'Switch to %str%?',
    error: 'Unable to find your location.',
    errorPermission: 'Permission to find your location was denied.',
    errorTimeout: 'The location request timed out.'
  },

  // Internal process indicator.
  isLocating = false,

  // Adapted from
  // https://github.com/gwilson/getAccurateCurrentPosition
  getPosition = function(success, error) {

    var fallback = false, eventCount = 0,

    checkLocation = function(pos) {

      // Ignore the first event because it's sometimes from cache.
      if(eventCount > 0) {
        if(pos.coords.accuracy <= options.desiredAccuracy) {
          cancelWatch();
          success(pos);
        }
      }

      // Increment event count.
      eventCount = eventCount + 1;

      // Store last-checked position.
      fallback = pos;

    },

    stopTrying = function(err) {

      // Clear the watch.
      cancelWatch();

      // Potentially warn the user of a level of inaccuracy.
      error(fallback, err);

      // Use the last-checked position if it's acceptable.
      if(fallback && fallback.coords.accuracy < options.acceptableAccuracy) {
        success(fallback);
      }

    },

    cancelWatch = function() {

      // Clear internal indicator.
      isLocating = false;

      // Clear watch and timeout.
      navigator.geolocation.clearWatch(watchID);
      clearTimeout(timerID);

    },

    // Set timeouts that will abandon the location loop.
    watchID = navigator.geolocation.watchPosition(checkLocation, stopTrying, options),
    timerID = setTimeout(stopTrying, options.timeout);

  },

  // Parse position returned from navigator.geolocation.
  parsePosition = function(pos) {

    // Format coordinates for helper function.
    geolocation.pos = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    // Hide loading indicator.
    config.els.geolocation.container.removeClass('loading');

    // Proceed when station data has been loaded.
    app.api.promise.then(function() {

      // Loop through stations and add location data.
      $.each(config.stations, function(i, station) {
        station.rank = calculateDistance(station, geolocation.pos);
        station.distance = formatDistance(station.rank);
      });

      // Send location data to main view.
      app.main.currentView.populateDistance(config.stations);

      // Sort stations from closest to farthest.
      var sortedStations = _.sortBy(config.stations, 'rank');

      // Show closest stations.
      showNearby(sortedStations);

    });

  },

  positionError = function(pos, err) {

    // Hide loading indicator.
    config.els.geolocation.container.removeClass('loading');

    // Warn user if location is inaccurate.
    if(pos) {
      if(pos.coords.accuracy > options.acceptableAccuracy) {
        showMessage(messages.unusable, mToFt(options.acceptableAccuracy));
      } else if(pos.coords.accuracy > options.warnableAccuracy) {
        showMessage(messages.inaccurate, mToFt(pos.coords.accuracy));
      }
    } else {
      // Show specific error messages.
      if(err && err.code) {
        switch(err.code) {
        case err.PERMISSION_DENIED:
          showMessage(messages.errorPermission);
          break;
        case err.TIMEOUT:
          showMessage(messages.errorTimeout);
          break;
        default:
          showMessage(messages.error);
          break;
        }
      } else {
        showMessage(messages.error);
      }
    }

  },

  // Process user selection from nearby stations.
  selectNearbyStation = function(e) {

    // Stop bubbling.
    e.stopPropagation();

    // Add station.
    var id = $(event.target).closest('p').data('oid');
    app.main.currentView.addStation(config.stations[id]);

  },

  showNearby = function(stations) {

    // Add nearby station suggestions.
    $.each(stations, function(i, station) {

      // If the nearest station is very far away, show a warning or suggest
      // another city.
      if(i === 0 && station.rank > options.flexRadius) {

        var foundCloserCity = false;

        // Loop through available cities.
        $.each(config.api, function(i, city) {

          var pos = {
            lat: convertE6(city.lat),
            lng: convertE6(city.lng)
          };

          // If this city is within the acceptable range, offer it up.
          if(calculateDistance(pos, geolocation.pos) < options.flexRadius) {
            foundCloserCity = true;
            showMessage(messages.betterChoice, '<a href="/' + city.id + '">' + city.title + '</a>');
            return false;
          }

        });

        // Otherwise, show comically far distance to nearest station.
        if(!foundCloserCity) {
          showMessage(messages.tooDistant, Math.round(station.rank));
        }

        // Break each loop.
        return false;

      }

      // Show the closest five stations and any others within a useful radius.
      if(i < 5 || station.rank < options.usefulRadius) {
        app.nearby.currentView.addStation($.extend({}, station, {
          distance: formatDistance(station.rank, true)
        }));
      }

    });

  },

  // Show warning or error message.
  showMessage = function(message, replacement) {
    if(replacement) {
      message = message.replace('%str%', replacement);
    }
    config.els.geolocation.message.html(message);
  },

  // Attempt geolocation.
  geolocate = function() {

    if(navigator.geolocation && !isLocating) {

      if(app.localstorage.get('disable-geolocation') === 'true') {

        // Show geolocation button.
        config.els.geolocation.button.show();

      } else {

        // Turn on internal indicator.
        isLocating = true;

        // Remove existing stations.
        app.nearby.currentView.collection.reset();

        // Adjust UI.
        showMessage(messages.standard);
        config.els.geolocation.button.hide();
        config.els.geolocation.container.addClass('loading');
        config.els.geolocation.container.slideDown();

        // Get current position.
        getPosition(parsePosition, positionError);

      }

    }

  },

  retryGeolocation = function() {
    app.localstorage.set('disable-geolocation', 'false');
    geolocate();
  },

  // Disable geolacation by user request.
  disableGeolocation = function() {

    // Hide nearby stations, show button, and store decision.
    config.els.geolocation.container.slideUp();
    config.els.geolocation.button.show();
    app.localstorage.set('disable-geolocation', 'true');

  },

  // Hide geolacation for errors and snapshots.
  hideGeolocation = function() {
    config.els.geolocation.container.slideUp();
  },

  // Convert from E6 geodata to decimal.
  convertE6 = function(int) {
    return int / 1000000;
  },

  // Calculate distance between two points.
  calculateDistance = function(p1, p2) {

    /*
      By Andrew Hedges, andrew(at)hedges(dot)name
    */

    // radians = degrees * pi / 180
    var deg2rad = function(deg) {
      return deg * Math.PI / 180;
    },

    // mean radius of the earth at 39 degrees
    Rm = 3961,

    // convert coordinates to radians
    lat1 = deg2rad(p1.lat),
    lon1 = deg2rad(p1.lng),
    lat2 = deg2rad(p2.lat),
    lon2 = deg2rad(p2.lng),

    // find the differences between the coordinates
    dlat = lat2 - lat1,
    dlon = lon2 - lon1,

    // here's the heavy lifting
    a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2),

    // great circle distance in radians
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),

    // great circle distance in miles
    dm = c * Rm;

    // round the results down to the nearest 1/1000
    return Math.round(dm * 1000) / 1000;

  },

  // Convert meters to feet.
  mToFt = function(m) {
    return Math.round(m * 3.28084);
  },

  // Format the distance in conversational terms.
  formatDistance = function(distance, expandRadius) {
    if(distance <= 0.12) {
      // Round short distances to the nearest ten feet.
      return (Math.round(distance * 5280 / 10) * 10) + ' ft';
    } else {
      if(distance < 1 || (expandRadius && distance <= options.flexRadius)) {
        // Round farther distances to the nearest tenth of a mile.
        return (Math.round(distance * 10) / 10) + ' mi';
      }
      return '';
    }
  },

  // Initialize geolocation features.
  initialize = function() {

    if(navigator.geolocation) {

      // Activate UI.
      config.els.api.button.on('click', geolocate);
      config.els.geolocation.button.on('click', retryGeolocation);
      config.els.geolocation.close.on('click', disableGeolocation);
      config.els.geolocation.main.on('click', selectNearbyStation);

      // Geolocate.
      geolocate();

    }

  };

  // Bind to events.
  app.vent.bind('geolocation:initialize', initialize);
  app.vent.bind('geolocation:update', geolocate);
  app.vent.bind('geolocation:hide', hideGeolocation);

});

/* LocalStorage module */

app.module('localstorage', function(localstorage) {

  // Set local storage.
  localstorage.set = function(key, value) {
    if(window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  };

  // Get local storage.
  localstorage.get = function(key) {
    return (window.localStorage) ? window.localStorage.getItem(key) : null;
  };

});

/* Messages module */

app.module('messages', function(messages, app, Backbone, Marionette, $) {

  // Last updated date.
  var lastUpdated = app.localstorage.get('last-updated'),

  // Internal loading indicator.
  isLoading = false,

  // How long to show messages.
  messageInterval = 7000,

  // Report error (and hide after interval).
  showError = function(error) {
    config.els.messages.error.html(error).slideDown();
    setTimeout(function() {
      config.els.messages.error.slideUp();
    }, messageInterval);
  },

  // Report error with API.
  showErrorAPI = function(error) {
    lastUpdated = null;
    config.els.api.button.html('Error').removeClass();
    showError(error);
  },

  showLoadingAPI = function() {
    isLoading = true;
    config.els.api.button.html('Loading').removeClass().addClass('dimmed');
  },

  // Warn the user (and hide after interval).
  showWarning = function(warning) {
    config.els.messages.warning.html(warning).slideDown();
    setTimeout(function() {
      config.els.messages.warning.slideUp();
    }, messageInterval);
  },

  // Reset errors and warnings.
  resetMessages = function() {
    config.els.messages.error.slideUp();
  },

  // Change last-updated date.
  updateDate = function(date) {
    if(typeof date === 'undefined') {
      if(lastUpdated !== null && !isLoading) {
        var timeago = $.timeago(lastUpdated);
        if(timeago !== config.els.api.button.html()) {
          config.els.api.button.html(timeago)
            .removeClass()
            .toggleClass('old', timeago !== '1 min');
        }
      }
    } else {
      lastUpdated = date;
      isLoading = false;
      app.localstorage.set('last-updated', lastUpdated);
      config.els.api.button.html('Updated').removeClass().addClass('dimmed');
    }
  },

  // Update the city.
  updateCity = function(city) {
    var info = config.api[city],
        map = info.map || info.url.replace(/\.json$/, '.html');
    config.els.messages.city.html(info.title);
    config.els.messages.map.attr('href', map);
  },

  // Update the "share a snapshot" link.
  updateSnapshotLink = function(link) {
    config.els.snapshot.button.attr('href', '/' + config.city + '/' + link);
    config.els.snapshot.button.toggle(Boolean(link));
  };

  // Bind to events.
  app.vent.bind('messages:error', showError);
  app.vent.bind('messages:warn', showWarning);
  app.vent.bind('messages:reset', resetMessages);
  app.vent.bind('messages:api:error', showErrorAPI);
  app.vent.bind('messages:api:loading', showLoadingAPI);
  app.vent.bind('messages:api:updated', updateDate);
  app.vent.bind('messages:city:change', updateCity);
  app.vent.bind('messages:snapshot:link', updateSnapshotLink);

  // Refresh last-updated date every second.
  setInterval(updateDate, 1000);

});

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

  // Decode a snapshot URL into station data.
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

    // Hide snapshot button.
    config.els.snapshot.button.hide();

    return stations;

  };

});

/* Suggestions module */

app.module('suggestions', function(suggestions, app, Backbone, Marionette, $) {

  // Expansions for common street abbreviations.
  var stationTokens = [
    ['Ft.', 'fort'],
    ['St.', 'saint'],
    ['St', 'street'],
    ['Ave', 'avenue'],
    ['Pl', 'place'],
    ['Sq', 'square'],
    ['N', 'north'],
    ['E', 'east'],
    ['S', 'south'],
    ['W', 'west'],
    ['NE', 'northeast'],
    ['NW', 'northwest'],
    ['SE', 'southeast'],
    ['SW', 'southwest'],
    ['&', 'and']
  ],

  // Expansions and alternate names for cities and bike share programs.
  cityTokens = [
    ['CitiBike', 'nyc'],
    ['B-cycle', 'bcycle'],
    ['[TO]Bike', 'tobike'],
    ['México', 'mexico'],
    ['D.F.', 'df'],
    ['Montréal', 'montreal']
  ],

  // Populate tokens.
  makeTokens = function(str, tokenArr) {

    var tokens = [],
        words = str.split(/[\/,— ]+/);

    // Tokens
    tokenArr.forEach(function(key) {
      if(words.indexOf(key[0]) !== -1) {
        tokens.push(key[1]);
      }
    });

    return $.merge(words, tokens);

  },

  // Create tokens in format expected by Typeahead.
  tokenizeStations = function(i, station) {
    var alt = (station.alt) ? ' ' + station.alt : '';
    station.tokens = makeTokens(station.title + alt, stationTokens);
  },

  // Create tokens in format expected by Typeahead.
  tokenizeCities = function(i, city) {
    city.tokens = makeTokens(city.title, cityTokens);
  },

  // Process station selection from Typeahead.
  selectStation = function(e, datum) {

    // Clear input form.
    $(this).typeahead('setQuery', '').blur();

    // Add station.
    app.main.currentView.addStation(datum);

  },

  // Process city selection from Typeahead.
  selectCity = function(e, datum) {

    // Clear input forms.
    clearQueries();

    // Proceed only if selection has changed.
    if(datum.id !== Backbone.history.fragment) {

      // Hide add station button.
      config.els.suggestions.stations.button.hide();

      // Navigate to city.
      Backbone.history.navigate(datum.id, true);

    }

  },

  // Format suggestions.
  stationTemplate = function(datum) {

    // Defaults.
    var model = {
      id: datum.id,
      title: datum.title,
      alt: datum.alt || '',
      distance: datum.distance || '',
      color: 'suggestion',
      available: {},
      flags: {}
    };

    // Extend station information.
    $.extend(model, datum.availability);

    // Return populated template.
    return JST['app/js/templates/station.tmpl'](model);

  },

  clearQueries = function() {
    config.els.suggestions.stations.input.typeahead('setQuery', '').blur();
    config.els.suggestions.city.input.typeahead('setQuery', '').blur();
  },

  showStationUI = function() {
    config.els.suggestions.stations.button.hide();
    config.els.suggestions.stations.main.show();
    config.els.suggestions.stations.input.focus();
  },

  showCityUI = function() {
    var width = config.els.suggestions.city.button.outerWidth();
    config.els.suggestions.city.button.hide();
    config.els.suggestions.city.main.width(width).show();
    config.els.suggestions.city.input.focus();
  },

  hideStationUI = function() {
    config.els.suggestions.stations.main.hide();
    config.els.suggestions.stations.button.show();
  },

  hideCityUI = function() {
    config.els.suggestions.city.main.hide();
    config.els.suggestions.city.button.show();
  },

  scrollToFit = function() {
    var offset = config.els.suggestions.stations.input.offset().top;
    if(offset > 300) {
      $('html, body').animate({scrollTop: offset - 100});
    }
  },

  initializeStations = function(stations) {

    // Destory any existing Typeahead bindings.
    config.els.suggestions.stations.input.typeahead('destroy');

    // Tokenize station data.
    $.each(stations, tokenizeStations);

    // Bind Typeahead to station input field.
    config.els.suggestions.stations.input.typeahead({
      name: 'stations-' + new Date().getTime(),
      valueKey: 'title',
      local: stations,
      template: stationTemplate,
      limit: 10
    });

    // Show station button.
    config.els.suggestions.stations.button.slideDown();

  },

  initializeCities = function(cities) {

    // Destroy any existing Typeahead bindings.
    config.els.suggestions.city.input.typeahead('destroy');

    // Tokenize station data.
    $.each(cities, tokenizeCities);

    // Bind Typeahead to city input field.
    config.els.suggestions.city.input.typeahead({
      name: 'city-' + new Date().getTime(),
      valueKey: 'title',
      local: cities,
      limit: 0
    });

  };

  // Bind to events.
  config.els.suggestions.stations.button.on('click', showStationUI);
  config.els.suggestions.stations.input
    .on('typeahead:selected', selectStation)
    .on('typeahead:opened', scrollToFit)
    .on('typeahead:closed', hideStationUI);
  config.els.suggestions.city.button.on('click', showCityUI);
  config.els.suggestions.city.input
    .on('typeahead:selected', selectCity)
    .on('typeahead:opened', scrollToFit)
    .on('typeahead:closed', hideCityUI);

  app.vent.bind('suggestions:initialize:stations', initializeStations);
  app.vent.bind('suggestions:initialize:cities', initializeCities);
  app.vent.bind('suggestions:close', clearQueries);

});

/* Main */

// Start application.
app.start();
