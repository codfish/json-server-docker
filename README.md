# json-server-docker

Docker image for building a [json-server](https://github.com/typicode/json-server) application.

This image will set up the application for you and allow you to simply mount in your "database
source file". Currently it's required that file be `index.js`. You can also optionally mount in a
`middleware.js` and `routes.json` file.

Example `docker-compose.yml` file:

```yml
version: '3'

services:
  docs:
    image: codfish/json-server:0.14.2
    command: npm run dev
    volumes:
      - ./index.js:/app/index.js:delegated
      - ./routes.json:/app/routes.json:delegated
      - ./middleware.js:/app/middleware.js:delegated
```

Image versions are based off of the
[release versions for json-server](https://github.com/typicode/json-server/releases). However there
is not an image for every version. See the available versions
here](https://hub.docker.com/r/codfish/json-server).

## Helper Libraries

When building your mock api's you'll most like want to generate some fake data and return a number
of items for a specific collection. I've included [Lodash](https://lodash.com/) &
[faker.js](https://github.com/Marak/faker.js) in the image to help facilitate doing these sorts of
things inside your source file, or middleware for that matter. Here's an example of what I mean:

#### index.js

The source file you provide to json-server needs to be a json file, or js file that export's an
object. You will have access to `faker.js` and `Lodash` to help you out.

```js
const faker = require('faker');
const times = require('lodash/times');
const startCase = require('lodash/startCase');

module.exports = () => ({
  posts: times(100, index => ({
    id: index,
    title: startCase(faker.lorem.words(3)),
    body: faker.lorem.paragraphs(3),
    // and so on...
  })),
});
```

## Todo

- Support multiple database file types (`db.json` vs `index.js` for instance)
- Add examples of using this with docker cli, without a compose file
