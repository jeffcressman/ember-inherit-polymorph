import Ember from 'ember';
import AuthenticatorBase from 'simple-auth/authenticators/base';
import AuthorizerBase from 'simple-auth/authorizers/base';
import ENV from 'ember-inherit-polymorph/config/environment';

// Uses the Firebase built in email/password authentication capabilities
//
// Developed based on work by https://github.com/outaTiME
// from https://github.com/simplabs/ember-simple-auth/issues/265
var FirebaseAuthenticator = AuthenticatorBase.extend({

	// !!! This can cause problems if you change, and I think delete, your user
	// models while still logged in
  // restore: function (data) {
  //   Ember.Logger.debug('Authenticator restore with data:', data);
  //   return new Ember.RSVP.Promise(function (resolve, reject) {
  //     var now = (new Date()).getTime();
  //     if (!Ember.isEmpty(data.expires_at) && data.expires_at < now) {
  //       // expired
  //       reject('Authentication token expired');
  //     } else {
  //       resolve(data);
  //     }
  //   });
  // },

  authenticate: function (credentials) {
    Ember.Logger.debug('Authenticator authenticate with credentials:', credentials);
    var ref = new window.Firebase(ENV.firebase);
    return new Ember.RSVP.Promise(function (resolve, reject) {
			ref.authWithPassword({
			  email    : credentials.identification,
			  password : credentials.password
			}, function(error, authData) {
			  if (error === null) {
			    // user authenticated with Firebase
			    Ember.run(function () { // not sure why Ember.run is used by example code was using it...
			    	// console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
				    resolve({token: authData.token, user_email: authData.password.email, user_id: authData.uid});
			  	});
			  } else {
			  	Ember.run(function() {
				  	reject(error);
			  	});
			  }
			});
		});
  },

  invalidate: function () {
    Ember.Logger.debug('Authenticator invalidate');
    var ref = new window.Firebase(ENV.firebase);
    return new Ember.RSVP.Promise(function (resolve) {
    	ref.unauth();
      resolve();
    });
  }

});

var FirebaseAuthorizer = AuthorizerBase.extend({

  // pass

});

export function initialize(container) {
	container.register('simple-auth-authenticator:firebase', FirebaseAuthenticator);
	container.register('simple-auth-authorizer:firebase', FirebaseAuthorizer);
}

export default {
  name: 'simple-auth-firebase',
  before: 'simple-auth',
  initialize: initialize
};
