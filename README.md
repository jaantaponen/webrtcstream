# WEBRTC STREAMING

## Disclaimer
Disclaimer due to not having access to native Linux where docker is not handled by Mac/WSL I cannot confirm the working condition of networking in compose environment!

Confirmed working ffmpeg version is 4.4

Please use atleast node v16 for /hls and v14 for client (see dockerfiles for reference). I use `nvm` for node management, ex: `nvm use v16`

By default the `client` shares your webcam! Make adjustments to the `Broadcast.js` file if you want to test screen sharing

# About

The first wave of delay comes from the socket.io library which uses webrtc as the base with some additional protocol enchancements according to their documentation.

The bigger delay is produced by the HLS stream encoding, the raw stream needs first a few seconds the be able to be passed to FFMPEG, which then encodes the segments. This usually happens by manual inspection in about 2-3 seconds. The stream itsels
