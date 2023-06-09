const socket = io('/')
const videoGrid = document.getElementById('grid2')
let localStream = null;
let constraints = {
  audio: true,
  video: {
      width: {
          max: 300
      },
      height: {
          max: 300
      }
  }
}



constraints.video.facingMode = {
  ideal: "user"
}

/**
 * All peer connections
 */

const myPeer = new Peer(undefined, {url:'stun:stun01.sipphone.com'},

{url:'stun:stun.ekiga.net'},
{url:'stun:stun.fwdnet.net'},
{url:'stun:stun.ideasip.com'},
{url:'stun:stun.iptel.org'},
{url:'stun:stun.rixtelecom.se'},
{url:'stun:stun.schlund.de'},
{url:'stun:stun.l.google.com:19302'},
{url:'stun:stun1.l.google.com:19302'},
{url:'stun:stun2.l.google.com:19302'},
{url:'stun:stun3.l.google.com:19302'},
{url:'stun:stun4.l.google.com:19302'},
{url:'stun:stunserver.org'},
{url:'stun:stun.softjoys.com'},
{url:'stun:stun.voiparound.com'},
{url:'stun:stun.voipbuster.com'},
{url:'stun:stun.voipstunt.com'},
{url:'stun:stun.voxgratia.org'},
{url:'stun:stun.xten.com'},
{
	url: 'turn:numb.viagenie.ca',
	credential: 'muazkh',
	username: 'webrtc@live.com'
},
{
	url: 'turn:192.158.29.39:3478?transport=udp',
	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	username: '28224511:1379330808'
},
{
	url: 'turn:192.158.29.39:3478?transport=tcp',
	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	username: '28224511:1379330808'
}
)

const myVideogrid = document.getElementById('grid1');
const myVideo = document.createElement('video');
myVideo.setAttribute("onclick", "openFullscreen(this)");

myVideo.setAttribute("style",'height:400px!important;width:350px!important;')
myVideogrid.append(myVideo);
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  localStream = stream;
  localVideo = myVideo;
  addmyVideoStream(myVideo, stream)
  $("#nobodythere1").remove();
  myPeer.on('call', call => {
    
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log("user-cam-activated");
      playsound();        
        addVideoStream(video, userVideoStream)
    })
  })
function playsound()
{
  var audio = new Audio('/ring.mp3');
    audio.play();
} 
 socket.on('user-connected', userId => {
    console.log("user-connected");
    playsound();
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  console.log("user-disconnected");
  playdisconnect();
  if (peers[userId]) peers[userId].close()
})
function playdisconnect()
{
  var audio = new Audio('/disconnect.mp3');
    audio.play();
} 


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  video.setAttribute("onclick", "openFullscreen(this)");

  video.setAttribute("style",'height:400px!important;width:350px!important;')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}


function addmyVideoStream(video, stream) {
    console.log("added");
  video.srcObject = stream
 
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  
}
function addVideoStream(video, stream) {
    $("#nobodythere2").remove();
    console.log("addedtheirs");
  video.srcObject = stream
 
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
function openFullscreen(myVideo) {
    console.log("hitting")
    var elem = myVideo
    console.log(elem)
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

socket.emit('joining msg', name);

    		$('form').submit(function(e) {
    			e.preventDefault();            // will prevent page reloading
      			socket.emit('chat message', (name + ':  ' + $('#m').val()));
                        $('#messages').append($('<li id="list">').text('You:  ' + $('#m').val()));
      			$('#m').val('');
      			return false;
    		});
    		socket.on('chat message', function(msg){
      			$('#messages').append($('<li>').text(msg));
    		});


        function switchMedia() {
          if (constraints.video.facingMode.ideal === 'user') {
              constraints.video.facingMode.ideal = 'environment'
          } else {
              constraints.video.facingMode.ideal = 'user'
          }
      
          const tracks = localStream.getTracks();
      
          tracks.forEach(function (track) {
              track.stop()
          })
      
          localVideo.srcObject = null
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      
              for (let socket_id in peers) {
                  for (let index in peers[socket_id].streams[0].getTracks()) {
                      for (let index2 in stream.getTracks()) {
                          if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                              peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                              break;
                          }
                      }
                  }
              }
      
              localStream = stream
              localVideo.srcObject = stream
      
              updateButtons()
          })
      }
      
      /**
       * Enable screen share
       */
      function setScreen() {
          navigator.mediaDevices.getDisplayMedia().then(stream => {
              for (let socket_id in peers) {
                  for (let index in peers[socket_id].streams[0].getTracks()) {
                      for (let index2 in stream.getTracks()) {
                          if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                              peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                              break;
                          }
                      }
                  }
      
              }
              localStream = stream
      
              localVideo.srcObject = localStream
              socket.emit('removeUpdatePeer', '')
          })
          updateButtons()
      }
      function toggleMute() {
        for (let index in localStream.getAudioTracks()) {
            localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
            muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
        }
    }
    /**
     * Enable/disable video
     */
    function toggleVid() {
        for (let index in localStream.getVideoTracks()) {
            localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
            vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
        }
    }
    function updateButtons() {
      for (let index in localStream.getVideoTracks()) {
          vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
      }
      for (let index in localStream.getAudioTracks()) {
          muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
      }
  }