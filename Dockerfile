FROM node:11.12

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only="prod"

COPY index.js .

EXPOSE 4000
CMD npm run start
