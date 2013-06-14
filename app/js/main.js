/*
 * BikeShare.me v0.1.0
 * Chris Zarate
 * http://github.com/chriszarate/bikeshare.me
 */


/* Main */

// Prefetch availability data.
app.vent.trigger('api:update:bootstrap');

// Start application.
app.start();
