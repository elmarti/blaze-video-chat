import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { VideoCallServices } from 'meteor/elmarti:video-chat';

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
    VideoCallServices.init({
        'iceServers': [{ urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }, { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ]
    });
    VideoCallServices.onReceiveCall = (userId) => {
        const user = Meteor.users.findOne({
            _id: userId
        });
        updateState({
            statusText:"Recieving call from " + user.username,

            ringing: true
        });
    };
    VideoCallServices.onTargetAccept = () => {
        updateState({
            statusText: "Target accepted"
        })
    };
    VideoCallServices.onTerminateCall = () => {
        updateState({
            statusText: "Call terminated",
            inProgress: false,
            ringing: false
        });
    };
    VideoCallServices.onCallRejected = () => {
        updateState({
            statusText: "Call rejected",
            inProgress: false
        })
    };

    VideoCallServices.setOnError(err => {
        console.error(err);
        updateState({
            statusText: err
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

        }).forEach(user => users.push({ 
            email: user.username, 
            status: user.status.online !== undefined ? user.status.online : undefined, 
            _id: user._id }));

        return users;
    },
    getState() {
        return dashboardState.get();
    }
});

Template.dashboard.events({
    "click .user-button" () {
        if (this.status) {
            VideoCallServices.call({
                id: this._id,
                localElement: document.querySelector("#localVideo"),
                remoteElement: document.querySelector("#remoteVideo"),
                video: true,
                audio: true
            });
            updateState({
                statusText: "Calling " + this.email,
                inProgress: true
            });
        }
    },
    "click .answer-call" () {
        VideoCallServices.answerCall({
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
        VideoCallServices.rejectCall();
        updateState({
            ringing: false,
            statusText: "Call rejected"
        });
    },
    "click .end-call" () {
        VideoCallServices.endCall();
        updateState({
            inProgress: false,
            statusText: "Call ended"
        })
    }
})
