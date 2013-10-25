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

    // Destory any existing Typeahead bindings.
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
