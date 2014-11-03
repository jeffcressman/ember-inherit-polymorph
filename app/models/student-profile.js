import DS from 'ember-data';
import Profile from 'ember-inherit-polymorph/models/profile';

export default Profile.extend({
  grade: DS.attr('number'),
  teacher: DS.belongsTo('teacher-profile', {async: true})
});
