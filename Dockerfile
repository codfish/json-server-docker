FROM node:14.15-slim

RUN mkdir /app
WORKDIR /app

ENV JSON_SERVER_VERSION=0.16.3

RUN npm install -g json-server@${JSON_SERVER_VERSION}
COPY package.json package-lock.json ./
RUN npm ci --only="prod"

COPY ./db.js ./middleware.js ./routes.json ./server.sh ./

EXPOSE 80
CMD [ "./server.sh" ]
