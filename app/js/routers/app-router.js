/* Router */

var AppRouter = Marionette.AppRouter.extend({

  appRoutes: {
    ':city/:stations': 'share',
    '*unknown': 'home'
  }

});
