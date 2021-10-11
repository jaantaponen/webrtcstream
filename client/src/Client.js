

import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import Video from './Video'

const ENDPOINT = "http://127.0.0.1:4000";

const config = {
    iceServers: [{"urls": "stun:stun.l.google.com:19302"}]
};

const ClientComponent = () => {
    const [srcVid, setSrcVid] = useState(null);
    const socket = socketIOClient(ENDPOINT);
    let peerConnection;
    useEffect(() => {
        socket.on("offer", (id, description) => {
            peerConnection = (new RTCPeerConnection(config))
            peerConnection
                .setRemoteDescription(description)
                .then(() => peerConnection.createAnswer())
                .then(sdp => {
                    console.log("CLIENT SDP ", JSON.stringify(sdp))
                    return peerConnection.setLocalDescription(sdp)
                })
                .then(() => {
                    socket.emit("answer", id, peerConnection.localDescription);
                });
            peerConnection.ontrack = event => {
                setSrcVid(event.streams[0])
            };
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };
        });
        socket.on("candidate", (id, candidate) => {
            peerConnection
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error(e));
        });

        socket.on("connect", () => {
            socket.emit("watcher");
        });

        socket.on("broadcaster", () => {
            socket.emit("watcher");
        });
    }, []);

    return (
        <div>
            <p>naurutime</p>
            {srcVid && <Video srcObject={srcVid} muted={true} autoPlay={true} />}
        </div>
    );
}

export default ClientComponent