const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3000',
    path: '/peerjs'
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    video.classList.add('rounded-xl')
    videoGrid.append(video)
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}

document.getElementById('off-call').addEventListener('click', () => {
    window.location.href = '/leave';
})

document.getElementById('off-camera').addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(enabled);
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
})

document.getElementById('off-micro').addEventListener('click', () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    console.log(enabled);
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
})