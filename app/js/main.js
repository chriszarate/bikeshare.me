/* Main */

// Prefetch availability data.
app.vent.trigger('api:update:bootstrap');

// Start application.
app.start();
