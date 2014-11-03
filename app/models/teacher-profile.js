import DS from 'ember-data';
import Profile from 'ember-inherit-polymorph/models/profile';

export default Profile.extend({
  classRoom: DS.attr('number'),
  students: DS.hasMany('student-profile', {async: true})
});
