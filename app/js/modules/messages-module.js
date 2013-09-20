/* Messages module */

app.module('messages', function(messages, app, Backbone, Marionette, $) {

  // jQuery selectors.
  var $error = $('#error'),
      $warning = $('#warning'),
      $refresh = $('#refresh-text'),
      $share = $('#share-link'),

  // Last updated date.
  lastUpdated = false,

  // Internal loading indicator.
  isLoading = false,

  // Report error.
  showError = function(error) {
    lastUpdated = false;
    $refresh.html('Error').removeClass('dimmed');
    $error.html(error).slideDown();
  },

  // Warn the user (and hide after 7s).
  showWarning = function(warning) {
    $warning.html(warning).slideDown();
    setTimeout(function() {
      $warning.slideUp();
    }, 7000);
  },

  // Reset errors and warnings.
  resetMessages = function() {
    $error.slideUp();
  },

  // Change last-updated date.
  updateDate = function(date) {
    var routineUpdate = (typeof date === 'undefined');
    if(routineUpdate && lastUpdated && !isLoading) {
      var timestamp = $.timeago(lastUpdated);
      $refresh.html(timestamp);
      if(timestamp !== 'Updated') {
        $refresh.removeClass('dimmed');
      }
    } else if(!routineUpdate) {
      lastUpdated = date;
      isLoading = false;
      $refresh.html('Updated').addClass('dimmed');
    }
  },

  // Update the "share a snapshot" link.
  updateSnapshotLink = function(link) {
    $share.attr('href', '/' + cache.city + '/' + link).toggle(Boolean(link));
  };

  // Bind to events.
  app.vent.bind('messages:error', showError);
  app.vent.bind('messages:warn', showWarning);
  app.vent.bind('messages:reset', resetMessages);
  app.vent.bind('messages:updated', updateDate);
  app.vent.bind('messages:share', updateSnapshotLink);

  // Bind to "refresh" link.
  $refresh.on('click', function() {
    isLoading = true;
    $(this).html('Loading').addClass('dimmed');
  });

  // Refresh last-updated date every second.
  setInterval(updateDate, 1000);

});
