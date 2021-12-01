FROM node:16-buster
WORKDIR /usr/src/app
COPY package*.json ./
# the wait for it script requires netcat (and build essentials to be sure)
RUN apt update && apt install build-essential netcat ffmpeg -y
RUN npm ci
COPY . ./
EXPOSE 5000
CMD [ "npm", "run", "hls" ]
