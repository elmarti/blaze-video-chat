import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    console.log("dropping users");
    Meteor.users.remove({}); 
})

Meteor.publish(null, function() {
    if (this.userId) {
        return Meteor.users.find({}, {
            fields: {
                emails: 1,
                _id: 1,
                status: 1
            }
        });
    }
});
