FROM node:10
WORKDIR /app/api
COPY package.json /app/api
COPY package-lock.json /app/api
RUN npm ci
COPY . /app/api
CMD npm start
EXPOSE 8000

