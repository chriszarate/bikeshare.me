/* Messages module */

app.module('messages', function(messages, app, Backbone, Marionette, $) {

  // Last updated date.
  var lastUpdated = false,

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
    lastUpdated = false;
    config.els.api.button.html('Error').removeClass();
    showError(error);
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
      if(lastUpdated && !isLoading) {
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
      config.els.api.button.html('Updated').removeClass().addClass('dimmed');
    }
  },

  // Update the "share a snapshot" link.
  updateSnapshotLink = function(link) {
    config.els.snapshot.link.attr('href', '/' + cache.city + '/' + link);
    config.els.snapshot.button.toggle(Boolean(link));
  };

  // Bind to events.
  app.vent.bind('messages:error', showError);
  app.vent.bind('messages:warn', showWarning);
  app.vent.bind('messages:reset', resetMessages);
  app.vent.bind('messages:api:error', showErrorAPI);
  app.vent.bind('messages:api:updated', updateDate);
  app.vent.bind('messages:snapshot:link', updateSnapshotLink);

  // Bind to "refresh" link.
  config.els.api.button.on('click', function() {
    isLoading = true;
    $(this).html('Loading').removeClass().addClass('dimmed');
  });

  // Refresh last-updated date every second.
  setInterval(updateDate, 1000);

});
