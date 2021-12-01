# WEBRTC STREAMING


The first wave of delay comes from the socket.io library which uses webrtc as the base with some additional protocol enchancements according to their documentation.

The bigger delay is produced by the HLS stream encoding, the raw stream needs first a few seconds the be able to be passed to FFMPEG, which then encodes the segments. This usually happens by manual inspection in about 2-3 seconds. The stream itsels