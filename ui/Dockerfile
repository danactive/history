FROM node:12
WORKDIR /app/ui
COPY package.json /app/ui
COPY package-lock.json /app/ui
RUN npm ci
COPY . /app/ui
CMD npm start
EXPOSE 3000

