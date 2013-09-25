/* Messages module */

app.module('messages', function(messages, app, Backbone, Marionette, $) {

  // Last updated date.
  var lastUpdated = false,

  // Internal loading indicator.
  isLoading = false,

  // Report error.
  showError = function(error) {
    lastUpdated = false;
    config.els.api.button.html('Error').removeClass();
    config.els.messages.error.html(error).slideDown();
  },

  // Warn the user (and hide after 7s).
  showWarning = function(warning) {
    config.els.messages.warning.html(warning).slideDown();
    setTimeout(function() {
      config.els.messages.warning.slideUp();
    }, 7000);
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
    config.els.snapshot.button.attr('href', '/' + cache.city + '/' + link).toggle(Boolean(link));
  };

  // Bind to events.
  app.vent.bind('messages:error', showError);
  app.vent.bind('messages:warn', showWarning);
  app.vent.bind('messages:reset', resetMessages);
  app.vent.bind('messages:updated', updateDate);
  app.vent.bind('messages:share', updateSnapshotLink);

  // Bind to "refresh" link.
  config.els.api.button.on('click', function() {
    isLoading = true;
    $(this).html('Loading').removeClass().addClass('dimmed');
  });

  // Refresh last-updated date every second.
  setInterval(updateDate, 1000);

});
