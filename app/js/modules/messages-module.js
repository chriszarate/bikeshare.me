/* Messages module */

app.module('messages', function(messages, app, Backbone, Marionette, $) {

  // jQuery selectors.
  var $error = $('#error'),
      $warning = $('#warning'),
      $updated = $('#last-updated'),
      $refresh = $('#refresh'),
      $share = $('#share-link'),

  // Report error.
  showError = function(error) {
    $error.html(error).slideDown();
  },

  // Warn the user (usually passing something along from elsewhere).
  showWarning = function(warning) {
    $warning.html(warning).slideDown();
  },

  // Reset errors and warnings.
  resetMessages = function() {
    $error.slideUp();
    $warning.slideUp();
  },

  // Change last-updated date.
  updateDate = function(date) {
    var recent = (date === 'now');
    date = (recent) ? 'a few seconds ago' : $.timeago(date);
    $updated.html('Updated ' + date + '.');
    $refresh.toggle(!recent);
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
    $(this).hide();
    app.vent.trigger('api:update:hard');
  });

});
