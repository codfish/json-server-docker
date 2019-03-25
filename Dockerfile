FROM node:11.12

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only="prod"

COPY index.js middleware.js routes.json ./

EXPOSE 80
CMD npm run start
