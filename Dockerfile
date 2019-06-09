FROM node:12.4

RUN mkdir /app
WORKDIR /app

RUN npm install -g json-server
COPY package.json package-lock.json ./
RUN npm ci --only="prod"

COPY ./db.js ./middleware.js ./routes.json ./server.sh ./

EXPOSE 80
CMD [ "./server.sh" ]
