import Ember from 'ember';
import ENV from 'ember-inherit-polymorph/config/environment';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

// function for seeding db
var createUser = function(store, type, name, email, password) {
	var profileType = type;
	return store.createRecord('user', {
		name: name,
		password: password,
		email: email,
		timestamp: new Date()
	}).save().then(function(newUser){
		// Success callback
		Ember.Logger.debug('Create User succeeded');
	}, function() {
		// Error callback
		Ember.Logger.debug('Create User failed');
	});
};
var createUserProfile = function(store, profileType, user) {
	var profile = profileType
	store.createRecord(profile, {
		timestamp: new Date()
	}).save().then(function(newProfile) {
		Ember.Logger.debug('Create Profile succeeded');
		// user.addObject(newProfile); // think we're supposed to use this instead of user.set('profile', newProfile)
		// user.save();
	}, function(){
		Ember.Logger.debug('Create Profile failed');
	});
}
var authenticateUser = function(session, userEmail, userPassword) {
	session.authenticate('simple-auth-authenticator:firebase', {
		identification:  userEmail,
		password: userPassword
	});
};
var createFirebaseUserLogin = function(firebaseRef, userEmail, userPassword) {
	var ref = new window.Firebase(ENV.firebase);
	ref.createUser({
		email    : userEmail,
		password : userPassword
	}, function(error) {
		if (error === null) {
			Ember.Logger.debug('Create Firbase UserLogin succeeded');
		} else {
			Ember.Logger.debug('Create Firbase UserLogin failed', error);
		}
	});
};
// To create a SimpleLogin we need the Firebase uid, which we can
// get only afer creating the Firbase login and authenticating it.
var createUserSimpleLogin = function(store, session, user, userType) {
	store.createRecord('simple-login', {
	simpleLoginId: session.get('user_id').replace(/.*:/, ''), // Extract the id from format "simplelogin:14"
		userId: user.get('id'), // this is saved with the same value as user.get('id'), the Frirebase/EmberData id
		email: user.get('email'),
		userType: userType,
		timestamp: new Date()
	}).save().then(function() {
		// Success callback
		Ember.Logger.debug('Create SimpleLogin succeeded');
	}, function() {
		// Error callback
		Ember.Logger.debug('Create SimpleLogin failed');
	});
};
var removeUserLogin = function(firebaseRef, userEmail, userPassword) {
  firebaseRef.removeUser({
		email    : userEmail,
		password : userPassword
	}, function(error) {
		if (error === null) {
			Ember.Logger.debug('Remove user succeeded');
		} else {
			Ember.Logger.debug('Remove user failed', error);
		}
	});
};

export default Ember.Route.extend(ApplicationRouteMixin, {

  // model: function() {
  //   return this.store.find('user');
  // },

	actions: {

    sessionAuthenticationSucceeded: function () {
      Ember.Logger.debug('Login : Session authentication succeeded');
      this._super();
    },

    sessionAuthenticationFailed: function (error) {
      Ember.Logger.debug('Login : Session authentication failed with message:',
        error.message);
      // show generic error
      this.controller.set('errorMessage', 'Invalid email/password combination.');
      this._super();
    },

    sessionInvalidationSucceeded: function () {
      Ember.Logger.debug('Login : Session invalidation succeeded');
      this._super();
    },

    // Currently no Firebase callback for invalidation so this will never
    // be called
    sessionInvalidationFailed: function (error) {
      Ember.Logger.debug('Login : Session invalidation failed with message:',
        error.message);
      this._super();
    },

    authorizationFailed: function (error) {
      Ember.Logger.debug('Login : Authorization failed with message:', error.message);
      this._super();
    },

		seed: function(){
		  if (ENV.environment === 'development') {
				var store = this.container.lookup('store:main');
				var session = this.container.lookup('simple-auth-session:main');
		  	// clear out old data
		  	var ref = new window.Firebase(ENV.firebase);
		  	ref.remove(); // removes everything!

		  	// clear out old authentications
		  	// hmm. if we're just adding the users back then we actually don't need to do this
		  	// as we'll just get an error for creating the same auth twice but no harm will come.
		  	// Or, our logins won't be created so we have a problem then.
		  	// removeUserLogin(ref, 'fred@me.com', 'pass');

		  	// seed new data
		  	//
		  	// For the purposing of testing with seeded data we don't
		  	// need to create SimpleLogins for all users.
		  	// Hmm, going to be a problem I think when we create Guardians and 
		  	// 
		  	// Why do we need the simpleLoginId again? We need the user email and password to 
		  	// delete the Firebase login, not the id... Right we need it to figure out which user has logged in,
		  	// or do we... authWithPassword returns authData which includes the email address
		  	// var newStudent = createUser(store, 'student-profile', 'fred', 'fred@me.com', 'pass');
		  	var newStudent;
		  	createUserProfile(store, 'student-profile', newStudent); // !!! This is not saving a profile...
		  	// newStudent.then(function(student){
			  // 	student.get('profile').set('grade', 4);
			  // 	student.save(); // will this save our profile as well?
		  	// });
		  }
		}
	}
});
