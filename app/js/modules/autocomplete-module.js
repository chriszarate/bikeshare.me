/* Autocomplete module */

app.module('typeahead', function(typeahead, app, Backbone, Marionette, $) {

  // Selector cache.
  var $input = $('#add-station'), $nearby = $('#locate-menu'),

  // Placeholders.
  defaultPlaceholder = 'Type an NYC street name.',
  nearbyPlaceholder = 'Select a nearby station.',

  // Create tokens in format expected by Typeahead.
  tokenizeStations = function(i, station) {
    station.tokens = makeTokens(station.title);
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

  // Process user selection from Typeahead.
  selectStation = function(e, datum) {

    // Add station.
    app.main.currentView.addStation(datum);

    // Clear input form.
    $(this).typeahead('setQuery', '');

  },

  // Process user selection from nearby stations.
  selectNearbyStation = function(e) {

    // Stop bubbling.
    e.stopPropagation();

    // Add station.
    var id = $(event.target).closest('p').data('oid');
    app.main.currentView.addStation(cache.stations[id]);

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

  resetMenus = function() {
    $input.attr('placeholder', defaultPlaceholder);
    $nearby.hide();
  },

  showNearby = function(stations) {

    // Remove existing suggestions.
    $input
      .typeahead('setQuery', '')
      .attr('placeholder', nearbyPlaceholder)
      .blur();
    $nearby.empty();

    // Add nearby station suggestions.
    $.each(stations, function(i, station) {
      if(i < 5 || station.rank < 0.25) {
        $nearby.append(suggestionTemplate(station));
      }
    });

    // Show suggestions.
    $nearby.show();

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

    // Capture clicks in nearby stations menu.
    $nearby.on('click', selectNearbyStation);

    // Hide nearby stations on "blur".
    $(document).on('click', resetMenus);

  };

  // Bind to events.
  app.vent.bind('autocomplete:initialize', initialize);
  app.vent.bind('autocomplete:geolocate', showNearby);

});
