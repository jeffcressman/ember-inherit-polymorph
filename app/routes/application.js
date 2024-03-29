import Ember from 'ember';
import ENV from 'ember-inherit-polymorph/config/environment';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

// function for seeding db
// Creating a profile does not work unless it is created with a reference for its
// belongsTo relationship, a user in this case
var createUserProfile = function(store, profileType, theUser) {
	var profile = profileType;
	var user = theUser;
	// var user = store.createRecord('user'); // This works
	store.createRecord(profile, {
		// If we pass in a user the following we get this error:
		// Assertion Failed: You passed in a promise that did not originate from an EmberData relationship. You can only pass promises that come from a belongsTo or hasMany relationship to the get call.
		// The error is generated in the code here: https://github.com/emberjs/data/blob/680337b6678d76cb04329667c97341aa827d940c/packages/ember-data/lib/system/relationships/relationship.js
		// The issue is that the promise 'content !=== undefined'
		// So, look at the difference between the Promise I'm passing in as theUser and the Promise when I create it
		// here directly.
		// Assertion error fixed by calling createUserProfile after calling then on the new user but we're still not persisting the Profile...
		// Think the issue is as follows: store.createRecord('user') returns a DS.Model where store.createRecord('user').save() returns a Promise
		user: user,
		timestamp: new Date()
	}).save().then(function(newProfile) {
		Ember.Logger.debug('Create Profile succeeded');

		// Add the Profile to the user
		// If we do this everything saves properly but we get this error then:
		// Uncaught TypeError: Cannot read property 'typeKey' of undefined
		// user.set('profile', newProfile);
		// user.save();
	}, function(){
		Ember.Logger.debug('Create Profile failed');
	});
};
var createUser = function(store, type, name, email, password) {
	var profileType = type;
	var user = store.createRecord('user', {
		name: name,
		password: password,
		email: email,
		timestamp: new Date()
	}).save().then(function(newUser){
		// Success callback
		Ember.Logger.debug('Create User succeeded');
		createUserProfile(store, profileType, newUser);
	}, function() {
		// Error callback
		Ember.Logger.debug('Create User failed');
	});
	return user; // return user Promise
};
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

	// TODO: Now we are saving Polymorphic relationships with Ember.MODEL_FACTORY_INJECTIONS = false
	//       As a result, looking up the users is resulting in:
	//       Error while processing route: index Cannot read property 'typeKey' of undefined TypeError: Cannot read property 'typeKey' of undefined
  model: function() {
    return this.store.find('user');
  },

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

		  	// TODO: need to empty the local store as well by the looks of it
		  	//       Well, in the following thread it is suggested that reloading the page/app 
		  	//       is really the way to accomplish this. So, refresh then seed.
		  	//       Could disable seed button once its used and add a message re re-loading 
		  	//       the app.
		  	//       https://github.com/emberjs/data/issues/235

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
		  	var student = createUser(store, 'student-profile', 'fred', 'fred@me.com', 'pass');
		  	// student.then(function(newStudent){ // newStudent is turning out undefined. Don't understand at the moment
					// createUserProfile(store, 'profile', newStudent);
		  	// });

				// // Let's try this another way
				// // Can't look up the user straight: Uncaught Error: Assertion Failed: You tried to load a query but your adapter does not implement `findQuery` 
				// // This section works!
				// var users = store.find('user');
				// var student;
				// users.then(function(students) {
				// 	student = students.findBy('email', 'fred@me.com');
				// 	createUserProfile(store, 'student-profile', student);
				// });
				// // debugger; // Right, this can be hit before users.then finishes because its all async

				// // What we need then is to be able to get the profile and update it
		  // 	student.then(function(student){
			 //  	student.get('profile').set('grade', 4);
			 //  	student.save(); // will this save our profile as well?
		  // 	});
		  }
		}
	}
});
