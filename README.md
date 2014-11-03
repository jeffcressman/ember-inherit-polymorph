# Ember Inheritance and Polymorphism

The questions we're exploring here are 

1. How to set up user accounts such that we can easily look up all users in users in Firebase without having to look up a specific record type in the store.
2. If we have a single user record type then we solve the above problem but we want different user types so we'll try that using polymorphism. 
3. There are some known issues with ember-cli and polymorphism. Will we hit any of these issues?

## Ember-cli and Polymorphism

See <https://github.com/emberjs/data/issues/2065> on needing to switch `Ember.MODEL_FACTORY_INJECTIONS = true` to `Ember.MODEL_FACTORY_INJECTIONS = false`

On debugger not working if above false <http://stackoverflow.com/questions/19997399/injecting-session-into-a-model>

Demo project showing issue <https://github.com/jgwhite/polymorphic>

The example [here](http://discuss.emberjs.com/t/ember-data-relationships-like-polymorphic-async-inverse-embedded/5029/3) shows that the hasMany expresses the `{{polymorphic: true}}` relationship against the base class that is being extended and that only the base class and expresses the belongsTo relationship.

We could just have a base User class and polymorphic types but we're going to use a polymorphic Profile so that users are simple to handle for login and authentication. This gives us

```javascrpt
// User's messages can be posts or comments
App.User = DS.Model.extend({
 profile: DS.belongsTo(App.UserProfile, {polymorphic: true})
});

// StudentProfiles and TeacherProfiles should inherit from same parent class
App.UserProfile = DS.Model.extend({
  created_at: DS.attr('date'),
  user: DS.belongsTo(App.User)
});

App.StudentProfile = App.UserProfile.extend({
  title: DS.attr('string'),
  body: DS.attr('string')
});

App.TeacherProfile = App.UserProfile.extend({
  title: DS.attr('string'),
  body: DS.attr('string')
});
```

Some more stuff on polymorphic relationships: 

<http://lukegalea.github.io/ember_data_polymorphic_presentation/#/>

<http://discuss.emberjs.com/t/cleaner-way-to-define-polymorphic-associations/6369>

<http://discuss.emberjs.com/t/ember-data-relationships-like-polymorphic-async-inverse-embedded/5029>

### Weird Firebase stuff

https://github.com/firebase/emberFire/issues/42

And on the proper way to save objects with hasMany <http://stackoverflow.com/questions/22876229/saving-relationships-in-ember-js-and-emberfire>

This is basically saying that Ember Data updates belongsTo and hasMany relationships on the belongsTo side: <https://github.com/emberjs/data/commit/7f752ad15eb9b9454e3da3f4e0b8c487cdc70ff0#commitcomment-4923439> So, if I create a profile its saving the profile that really handles the relationship.

## Setup

```bash
npm install -g ember-cli
npm install -g bower
ember new ember-inherit-polymorph
cd ember-inherit-polymorph
npm install --save-dev ember-cli-bootstrap
npm install --save-dev emberfire
ember generate emberfire
npm install --save-dev --save-exact ember-cli-simple-auth@0.6.6
ember generate ember-cli-simple-auth
```

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at http://localhost:4200.

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* ember: http://emberjs.com/
* ember-cli: http://www.ember-cli.com/
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

