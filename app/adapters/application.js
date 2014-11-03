import DS from 'ember-data';
import ENV from 'ember-inherit-polymorph/config/environment';

export default DS.FirebaseAdapter.extend({
  firebase: new window.Firebase(ENV.firebase)
});

