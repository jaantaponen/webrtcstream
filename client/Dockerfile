# pull official base image
FROM node:14-alpine

# set working directory
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
CMD ["npm", "start"]
