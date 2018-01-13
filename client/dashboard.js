import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Template.dashboard.onCreated(() => {
    Meteor.VideoCallServices.init([{
        'iceServers': [{
            'urls': 'stun:stun.example.org'
        }]
    }]);
    
});
Template.dashboard.helpers({
    getUsers() {
        const users = [];
        Meteor.users.find({
            _id: {
                $ne: Meteor.userId()
            }
        }).forEach(user => users.push({ email: user.emails[0].address, status: user.status.online, _id: user._id }));
        return users;
    }
});

Template.dashboard.events({
    "click .user-button"(){
        Meteor.VideoCallServices.call({
            id:this._id, 
            localElement:document.querySelector("#localVideo"),
            remoteElement:document.querySelector("#remoteVideo"),
            video:true, 
            audio:true
        });
    }
})