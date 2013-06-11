/* Autocomplete module */

app.module('typeahead', function(typeahead, app, Backbone, Marionette, $) {

  // Map stations data to datum format expected by Typeahead.
  var mapStations = function(station) {
    station.tokens = makeTokens(station.title);
    return station;
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

  // Populate tokens for common street abbreviations.
  makeTokens = function(str) {

    var tokenKeys = [
      ['Ft.', 'fort'],
      ['St.', 'saint'],
      ['St', 'street'],
      ['Ave', 'avenue'],
      ['Pl', 'place'],
      ['N', 'north'],
      ['E', 'east'],
      ['S', 'south'],
      ['W', 'west']
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

  };

  // Bind Typeahead to input field.
  $('#add-station').typeahead({
    name: 'stations',
    valueKey: 'title',
    local: $.map(cache.stations, mapStations),
    template: suggestionTemplate,
    limit: 10
  }).on('typeahead:selected', selectStation);

});
