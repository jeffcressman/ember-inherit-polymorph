import Ember from 'ember';
import { initialize } from 'ember-inherit-polymorph/initializers/simple-auth-firebase-simple-login';

var container, application;

module('SimpleAuthFirebaseSimpleLoginInitializer', {
  setup: function() {
    Ember.run(function() {
      container = new Ember.Container();
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function() {
  initialize(container, application);

  // you would normally confirm the results of the initializer here
  ok(true);
});

