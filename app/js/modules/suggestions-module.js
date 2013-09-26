/* Suggestions module */

app.module('suggestions', function(suggestions, app, Backbone, Marionette, $) {

  // Expansions for common street abbreviations.
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

  // Create tokens in format expected by Typeahead.
  tokenizeStations = function(i, station) {
    var alt = (station.alt) ? ' ' + station.alt : '';
    station.tokens = makeTokens(station.title + alt);
  },

  // Populate tokens for common street abbreviations.
  makeTokens = function(str) {

    var tokens = [],
        words = str.split(/[\/,— ]+/);

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

  // Format suggestions.
  suggestionTemplate = function(datum) {

    // Defaults.
    var model = {
      id: datum.id,
      title: datum.title,
      alt: datum.alt || '',
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

  showUI = function() {
    config.els.suggestions.button.hide();
    config.els.suggestions.main.show();
    config.els.suggestions.input.focus();
  },

  hideUI = function() {
    config.els.suggestions.main.hide();
    config.els.suggestions.button.show();
  },

  scrollToFit = function() {
    var offset = config.els.suggestions.input.offset().top;
    if(offset > 300) {
      $('html, body').animate({scrollTop: offset - 100});
    }
  },

  initialize = function(stations) {

    // Tokenize station data.
    $.each(stations, tokenizeStations);

    // Bind Typeahead to input field.
    config.els.suggestions.input.typeahead({
      name: 'stations-' + new Date().getTime(),
      valueKey: 'title',
      local: stations,
      template: suggestionTemplate,
      limit: 10
    }).on('typeahead:selected', selectStation)
      .on('typeahead:opened', scrollToFit)
      .on('typeahead:closed', hideUI);

    // Activate add station button.
    config.els.suggestions.button.on('click', showUI);

  };

  // Bind to events.
  app.vent.bind('suggestions:initialize', initialize);

});
