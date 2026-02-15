FROM node:20.20.0-slim

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN npm install -g --save-exact nodemon@3.0.1

# copy in files
COPY ./tsconfig.json \
     ./db.js \
     ./middleware.js \
     ./routes.json \
     ./server.mjs ./

EXPOSE 80

ENTRYPOINT [ "nodemon", "server.mjs" ]
