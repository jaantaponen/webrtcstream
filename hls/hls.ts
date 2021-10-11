import {
    RTCPeerConnection
} from "werift";


import { io } from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4000";
const socket = io(ENDPOINT);
console.log("started")

socket.on("offer", async (id, description) => {
    const receiver = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    receiver.onRemoteTransceiverAdded.subscribe(async (transceiver) => {
        const [track] = await transceiver.onTrack.asPromise();
        transceiver.sender.replaceTrack(track);

        track.onReceiveRtp.subscribe((rtp) => {
            console.log(rtp)
        })
    });

    await receiver.setRemoteDescription(description);
    const sdp = await receiver.setLocalDescription(
        await receiver.createAnswer()
    );
    console.log(JSON.stringify(sdp))
    socket.emit("answer", id, sdp)
    //socket.send(JSON.stringify(sdp));
});

socket.on("candidate", (id, candidate) => {
    // peerConnection
    //     .addIceCandidate(new RTCIceCandidate(candidate))
    //     .catch(e => console.error(e));
});

socket.on("connect", () => {
    socket.emit("watcher");
});

socket.on("broadcaster", () => {
    socket.emit("watcher");
});

// (async () => {
//   server.on("connection", async (socket) => {
//     console.log("new peer");
//     

//     pc.ontrack = ({ track, transceiver }) => {
//       setInterval(() => {
//         transceiver.receiver.sendRtcpPLI(track.ssrc);
//       }, 3000);
//       track.onReceiveRtp.subscribe(async (rtp) => {
//         const h264 = H264RtpPayload.deSerialize(rtp.payload);

//         if (h264.isKeyframe && rtp.header.marker) {
//           console.log("on keyframe", rtp.payload.length);
//         }
//       });
//     };
//     pc.addTransceiver("video", { direction: "recvonly" });

//     const sdp = await pc.setLocalDescription(await pc.createOffer());
//     socket.send(JSON.stringify(sdp));

//     socket.on("message", (data: any) => {
//       const obj = JSON.parse(data);
//       if (obj.sdp) pc.setRemoteDescription(obj);
//     });
//   });
// })();