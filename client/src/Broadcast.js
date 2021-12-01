

import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import Video from './Video'

const ENDPOINT = "http://localhost:4000";

const config = {
  iceServers: [{ "urls": "stun:stun.l.google.com:19302" }]
};

const Broadcast = () => {
  const [srcVid, setSrcVid] = useState(null);
  const [videoSelect, setVideoSelect] = useState(null)
  const [audioSelect, setAudioSelect] = useState(null)
  //const videoref = useRef()
  const socket = socketIOClient(ENDPOINT);

  const peerConnections = {};

  useEffect(() => {
    socket.on("answer", (id, description) => {
      peerConnections[id].setRemoteDescription(description);
    });

    socket.on("watcher", async id => {
      console.log("NEW WATCHER")
      const peerConnection = new RTCPeerConnection(config);
      peerConnections[id] = peerConnection;

      // if you want to test the screen sharing comment this line and uncomment the next two!
      // Also remember to comment out the two lines at row 90, 91
      let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      //let stream = await navigator.mediaDevices.getDisplayMedia()
      //setSrcVid(stream)
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then(sdp => {
          console.log("BROADCAST SDP ", JSON.stringify(sdp))
          return peerConnection.setLocalDescription(sdp)
        })
        .then(() => {
          socket.emit("offer", id, peerConnection.localDescription);
        });
    });

    socket.on("candidate", (id, candidate) => {
      console.log("nauraa candidate")
      peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("disconnectPeer", id => {
      try {
        peerConnections[id].close();
        delete peerConnections[id];
      } catch(e) {
        console.log(e)
      }
    });
  }, []);

  // const getStreamRuutu = async event => {
  //   event.preventDefault();
  //   const b = await navigator.mediaDevices.getDisplayMedia()
  //   setSrcVid(b)
  //   console.log(b)
  // }

  const getStreamKamera = async event => {
    event.preventDefault();
    const deviceInfos = await navigator.mediaDevices.enumerateDevices()
    console.log(deviceInfos)
    setVideoSelect(deviceInfos.find(x => x.kind === 'videoinput'))
    setAudioSelect(deviceInfos.find(x => x.kind === 'audioinput'))

    const constraints = {
      audio: { deviceId: audioSelect ? { exact: audioSelect } : undefined },
      video: { deviceId: videoSelect ? { exact: videoSelect } : undefined }
    };
    // The next two lines need to commented out in combination with the above to get screensharing working.
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    //const stream = await navigator.mediaDevices.getDisplayMedia()
    setSrcVid(stream)
    socket.emit("broadcaster");
  }

  return (
    <div>
      <button onClick={getStreamKamera}>share screen</button>
      <p>test broadcast</p>
      {srcVid && <Video style={{width: "1200px"}} srcObject={srcVid} muted={true} autoPlay={true} />}
    </div>
  );
}

export default Broadcast