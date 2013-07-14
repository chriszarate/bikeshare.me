/* Autocomplete module */

app.module('typeahead', function(typeahead, app, Backbone, Marionette, $) {

  var $input = $('#add-station'),

  // Create tokens in format expected by Typeahead.
  tokenizeStations = function(i, station) {

    // Generate tokens from station title.
    station.tokens = makeTokens(station.title);

    // Add an additional token for nearby stations.
    if(station.rank && i < 5) {
      station.tokens.push('nearby');
    }

  },

  // Populate tokens for common street abbreviations.
  makeTokens = function(str) {

    var tokenKeys = [
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
      ['&', 'and']
    ],
    words = str.split(/ +/),
    tokens = [];

    // Tokens
    tokenKeys.forEach(function(key) {
      if(words.indexOf(key[0]) !== -1) {
        tokens.push(key[1]);
      }
    });

    return $.merge(words, tokens);

  },

  // Process user selection.
  selectStation = function(e, datum) {

    // Add station.
    app.main.currentView.addStation(datum);

    // Clear input form.
    $(this).typeahead('setQuery', '');

  },

  // Format suggestions.
  suggestionTemplate = function(datum) {

    // Defaults.
    var model = {
      id: datum.id,
      title: datum.title,
      distance: datum.distance || '',
      color: 'suggestion',
      status: '',
      available: {},
      flags: {}
    };

    // Extend station information.
    $.extend(model, datum.availability);

    // Return populated template.
    return JST['app/js/templates/station.tmpl'](model);

  },

  showNearby = function() {
    $input.typeahead('setQuery', 'Nearby').focus();
  },

  initialize = function(stations) {

    // Tokenize station data.
    $.each(stations, tokenizeStations);

    // Bind Typeahead to input field.
    $input.typeahead({
      name: 'stations-' + new Date().getTime(),
      valueKey: 'title',
      local: stations,
      template: suggestionTemplate,
      limit: 10
    }).on('typeahead:selected', selectStation);

  };

  // Bind to events.
  app.vent.bind('autocomplete:initialize', initialize);
  app.vent.bind('autocomplete:geolocate', showNearby);

});
