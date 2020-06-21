FROM node:12-alpine

RUN apk add --no-cache --virtual build-dependencies make gcc g++ python && \
  apk add --no-cache krb5-dev imagemagick graphicsmagick

WORKDIR /app/api
COPY package.json /app/api
COPY package-lock.json /app/api
RUN npm ci
COPY . /app/api
CMD npm start
EXPOSE 8000
