import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
 

Meteor.startup(() => {
    console.log("dropping users");
    Meteor.users.remove({}); 
})

Meteor.publish(null, function() {
    if (this.userId) {
        return Meteor.users.find({}, {
            fields: {
                username: 1,
                _id: 1,
                status: 1
            }
        });
    }
});
