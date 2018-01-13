import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';


//Redux style state management - immutable state tree
const dashboardState = new ReactiveVar({
    ringing: false,
    statusText: "",
    inProgress: false
});
const updateState = (newData) => {
    const oldState = dashboardState.get();
    dashboardState.set(Object.assign({}, oldState, newData));
};
Template.dashboard.onCreated(function() {
    Meteor.VideoCallServices.init([{
        'iceServers': [{
            'urls': 'stun:stun.example.org'
        }]
    }]);
    Meteor.VideoCallServices.onReceiveCall = (userId) => {
        updateState({
            ringing: true
        });
    };
    Meteor.VideoCallServices.onTargetAccept = () => {
        updateState({
            statusText: "Target accepted"
        })
    };
    Meteor.VideoCallServices.onTerminateCall = () => {
        updateState({
            statusText: "Call terminated",
            inProgress: false
        });
    };
    Meteor.VideoCallServices.onCallRejected = () => {
        updateState({
            statusText: "Call rejected",
            inProgress: false
        })
    };
    
    Meteor.VideoCallServices.setOnError(err => {
        console.error(err);
        updateState({
            statusText:err
        });
    });


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
    },
    getState() {
        return dashboardState.get();
    }
});

Template.dashboard.events({
    "click .user-button" () {
        Meteor.VideoCallServices.call({
            id: this._id,
            localElement: document.querySelector("#localVideo"),
            remoteElement: document.querySelector("#remoteVideo"),
            video: true,
            audio: true
        });
        updateState({
            statusText: "Calling " + this.email,
            inProgress: true
        })
    },
    "click .answer-call" () {
        Meteor.VideoCallServices.answerCall({
            localElement: document.querySelector("#localVideo"),
            remoteElement: document.querySelector("#remoteVideo"),
            video: true,
            audio: true
        });
        updateState({
            ringing: false,
            inProgress: true,
            statusText: "Connected"
        });
    },
    "click .reject-call" () {
        Meteor.VideoCallServices.rejectCall();
        updateState({
            ringing: false,
            statusText: "Call rejected"
        });
    },
    "click .end-call" () {
        Meteor.VideoCallServices.endCall();
        updateState({
            inProgress: false,
            statusText: "Call ended"
        })
    }
})
