/* Router */

var AppRouter = Marionette.AppRouter.extend({

  appRoutes: {
    '': 'home',
    ':city/:stations': 'share'
  }

});
