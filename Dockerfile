FROM node:20.2.0-slim

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN npm install -g --save-exact json-server@0.17.3 typescript@4.9.5

# copy in files
COPY ./tsconfig.json \
     ./db.js \
     ./middleware.js \
     ./routes.json \
     ./server.sh \
     ./main.sh ./

EXPOSE 80

CMD [ "./main.sh" ]
