import Ember from 'ember';
import Session from 'simple-auth/session';

export function initialize() {
	// initialize function parameters: /* container, application */
  // application.inject('route', 'foo', 'service:foo');
	Session.reopen({

		setCurrentUser: function() {
			var userID = this.get('user_id');
			if (!Ember.isEmpty(userID)) {
				var self = this;
				var store = this.container.lookup('store:main');

				// So, we could just load all of the users here and check the email, which must
				// be unique across users to get the Current User.
				//
				// This is also brings us back to a problem we had with the Rails and Devise 
				// setup where we don't know which model type to search in Ember so we'd have to
				// search them all.
				//
				// What we can do then is create a login model, add the user email to it, get
				// all of the login models from the store, look for the matching email, get the
				// user id from the match and then load that user, setting attributes of a 
				// currentUser hash with the relevant data (name, role (model type or role), and
				// the model id, which we'd need if we have to actually load the current user)
				//
				// This all feels pretty hacky still. We could just set CurrentUser to whatever the 
				// model is as there are no type restrictions. Our code should make sense as we'll 
				// be using the notion of roles to control what happens after sign in and thus never
				// call any method on the Current User that doesn't fit with its role.
				//
				// first we grab the login and then set Current User to the user
				// it belongs to.
				//

				// HA!! This always seems to be a challenge: single signon for multiple user/model types
				//
				// Ok, so we can't use a belongsTo in the login model because we don't know which type it
				// it will belong to.
				//
				// Instead, we'll use the email address, which we only allow to be used once, to check
				// each of the user model types we create. We'll create a simple-login model where we only store
				// the email address so that we can verify it hasn't been used already during registration.
				
				// Having problem where authenticate after creating 'User' so that we can get the simple login id
				// to create the SimpleLogin record. But, here we're trying to get the currentLogin before its 
				// created when a user signs up... Think maybe we can just call Session.setCurrentUser again once
				// we've created the SimpleLogin...

				self = this;
				store.find('simple-login').then(function(logins){
					var simpleLoginId = self.get('user_id').replace(/.*:/, '');
					var currentLogin = logins.findBy('simpleLoginId', simpleLoginId);
					if (Ember.isEmpty(currentLogin)) {
						Ember.Logger.debug("Session : Couldn't find SimpleLogin for id=" + simpleLoginId);
					} else {
						// look up the user by type
						store.find(currentLogin.get('userType')).then(function(users){
							var currentUser = users.findBy('email', currentLogin.get('email'));
							if (!Ember.isEmpty(currentUser)){
								currentUser.set('role', currentLogin.get('userType'));
								self.set('currentUser', currentUser);
							} else {
								Ember.Logger.debug("Session : Couldn't find " + currentLogin.get('userType') + " for id=" + currentLogin.get('email'));
							}
						});
					}
				});
			}
		}.observes('user_id'), // This probably doesn't trigger if the same user logs out and then back in?
	});
}

export default {
  name: 'simple-auth-custom-session',
  initialize: initialize,
	before: 'simple-auth'
};
