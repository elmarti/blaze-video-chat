import { Meteor } from 'meteor/meteor';
import { VideoCallServices } from 'meteor/elmarti:video-chat';
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

VideoCallServices.setOnError(err => {
   console.log("server side error", err); 
});
VideoCallServices.checkConnect((callerId, targetId) => {
    console.info("Checking user access privileges", callerId, targetId);
    return callerId && targetId;
});