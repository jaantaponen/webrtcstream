import {
  RTCPeerConnection, Vp8RtpPayload, MediaRecorder, RTCRtpCodecParameters,
} from "werift";
import { io } from "socket.io-client";
import { spawn } from 'child_process'
import { waitUntil } from 'async-wait-until';
const fs = require("fs"); // Load the filesystem module
const fsExtra = require('fs-extra')
const path = require('path'); 
const ENDPOINT = "http://127.0.0.1:4000";
const socket = io(ENDPOINT);

let receiver
const output = path.resolve("output")
fsExtra.emptyDirSync(output)
console.log("started")

const spawnffmpeg = async () => {
  await waitUntil(() => {
    if (fs.existsSync(`${output}/test.webm`)) {
      const stats = fs.statSync(`${output}/test.webm`)
      const fileSizeInBytes = stats.size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
      console.log(fileSizeInMegabytes)
      return fileSizeInMegabytes > 0.1
    }
  });

  const args = ["-re", "-i", `${output}/test.webm`, "-c:v", "libx264", "-c:a", "aac", "-ac", "1", "-strict", "-2", "-crf", "18", "-profile:v", "baseline", "-maxrate", "1000k", "-bufsize", "1835k", "-pix_fmt", "yuv420p", "-flags", "-global_header", "-hls_time", "10", "-hls_list_size", "6", "-hls_wrap", "10", "-start_number", "1", `${output}/index.m3u8`]
  const ffmpeg = spawn('ffmpeg', args);
  console.log('Spawning ffmpeg ' + args.join(' '));
  ffmpeg.on('exit', () => console.log("FFMPEG EXITED"));

  ffmpeg.stderr.on('data', function (data) {
    console.log('grep stderr: ' + data);
  });
  return ffmpeg
}

socket.on("offer", async (id, description) => {
  const recorder = new MediaRecorder([], "./output/test.webm", {
    width: 640,
    height: 360,
  });

  receiver = new RTCPeerConnection({
    codecs: {
      video: [
        new RTCRtpCodecParameters({
          mimeType: "video/VP9",
          clockRate: 90000,
          rtcpFeedback: [
            { type: "nack" },
            { type: "nack", parameter: "pli" },
            { type: "goog-remb" },
          ],
        }),
      ],
    },
  });

  {
    const transceiver = receiver.addTransceiver("video");
    transceiver.onTrack.subscribe((track) => {
      transceiver.sender.replaceTrack(track);

      recorder.addTrack(track);
      if (recorder.tracks.length === 2) {
        console.log("recing boi1")
        recorder.start();
        spawnffmpeg()
      }
      setInterval(() => {
        transceiver.receiver.sendRtcpPLI(track.ssrc);
      }, 10_000);
    });
  }
  {
    const transceiver = receiver.addTransceiver("audio");
    transceiver.onTrack.subscribe((track) => {
      transceiver.sender.replaceTrack(track);

      recorder.addTrack(track);
      if (recorder.tracks.length === 2) {
        recorder.start();
      }
    });
  }

  await receiver.setRemoteDescription(description);
  const sdp = await receiver.setLocalDescription(
    await receiver.createAnswer()
  );
  //console.log(JSON.stringify(sdp))
  socket.emit("answer", id, sdp)
  //socket.send(JSON.stringify(sdp));
});

socket.on("candidate", (id, candidate) => {
  // peerConnection
  //     .addIceCandidate(new RTCIceCandidate(candidate))
  //     .catch(e => console.error(e));
  if (!candidate) {
    const sdp = JSON.stringify(receiver?.localDescription);
    console.log(sdp);
    socket.send(sdp);
  }
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});