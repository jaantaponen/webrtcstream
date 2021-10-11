

import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import Video from './Video'

const ENDPOINT = "http://127.0.0.1:4000";

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

      let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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

  const getStreamRuutu = async event => {
    event.preventDefault();
    const b = await navigator.mediaDevices.getDisplayMedia()
    console.log(b)
  }

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
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    setSrcVid(stream)
    socket.emit("broadcaster");
  }

  return (
    <div>
      <button onClick={getStreamRuutu}>naurujaaruutu</button>
      <button onClick={getStreamKamera}>naurujaakamera</button>
      <p>maoltime</p>
      {srcVid && <Video srcObject={srcVid} muted={true} autoPlay={true} />}
    </div>
  );
}

export default Broadcast