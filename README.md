# json-server-docker

Docker image for building a [json-server](https://github.com/typicode/json-server) application.

This image will set up the application for you and allow you to simply mount in your "database
source file", which by convention needs to be named `db.js`. You can also optionally mount in a
`middleware.js` and `routes.json` file.

Image versions are based off of the
[release versions for json-server](https://github.com/typicode/json-server/releases). However there
is not an image for every version. See the available versions
[here](https://hub.docker.com/r/codfish/json-server).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)
  - [Options](#options)
  - [Full Example](#full-example)
- [Database File](#database-file)
- [Maintaining/Contributing](#maintainingcontributing)
  - [Releasing](#releasing)
- [Todo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

The container runs the `json-server` cli 2 ways. By default it will run it directly but you can
easily override the command by running it through nodemon. The image is setup to do this already
through npm. Just change the command to `npm run dev`.

```yml
version: '3'

services:
  json-server:
    image: codfish/json-server
    command: npm run dev
    volumes:
      - ./db.js:/app/db.js
      - ./routes.json:/app/routes.json:delegated
      - ./middleware.js:/app/middleware.js:delegated
```

To test this image directly you can run:

```sh
git clone git@github.com:codfish/json-server-docker.git
cd json-server-docker
docker-compose up -d
```

I highly recommend installing [`dotdocker`](https://github.com/aj-may/dotdocker) first. The
container will then be accessible at <http://json-server.docker>.

### Options

`json-server` cli options: <https://github.com/typicode/json-server#cli-usage>

For the most part this image will rely on the default options that `json-server` has set. For
certain options like `--port` and `--host`, it overrides the defaults with it's own defaults that
work well with containers out of the box. We've also set a default routes & middleware filename so
all you need to do is mount over the files. No configuration is necessary for that.

However you still have the ability to override _almost_ every option yourself as well. Options
should be passed in as environment variables. The currently supported options available for:

| Option        | Description                                                      | Default                                                     |
| ------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| `PORT`        | Set port                                                         | `80`                                                        |
| `HOST`        | Set host                                                         | `0.0.0.0`                                                   |
| `ROUTES`      | Path to routes file                                              | `routes.json` (Stored in image, optionally mount over it)   |
| `MIDDLEWARES` | Path to middleware file                                          | `middleware.js` (Stored in image, optionally mount over it) |
| `CONFIG`      | Path to config file                                              | Defers to `json-server` default                             |
| `ID`          | Set database id property (e.g. `address`)                        | Defers to `json-server` default                             |
| `FKS`         | Set foreign key suffix, (e.g. `Address` as in `contractAddress`) | Defers to `json-server` default                             |
| `DELAY`       | Add delay to responses (ms)                                      | -                                                           |
| `STATIC`      | Set static files directory                                       | Defers to `json-server` default                             |
| `QUIET`       | Suppress log messages from output                                | Boolean flag only true if set                               |
| `NO_GZIP`     | Disable GZIP Content-Encoding                                    | Boolean flag only true if set                               |
| `NO_CORS`     | Disable Cross-Origin Resource Sharing                            | Boolean flag only true if set                               |
| `READ_ONLY`   | Allow only GET requests                                          | Boolean flag only true if set                               |

For details on the options
[view `json-server`'s documentation](https://github.com/typicode/json-server#cli-usage).

### Full Example

Here's a recommended setup for local development with some optional overrides as an example.

```yaml
services:
  json-server:
    image: codfish/json-server
    command: npm run dev
    volumes:
      - ./db.js:/app/db.js:delegated
      - ./routes.json:/app/routes.json:delegated
      - ./middleware.js:/app/middleware.js:delegated
    environment:
      VIRTUAL_HOST: json-server.docker
      FKS: Address
      ID: address
      NO_CORS: 'true'
      NO_GZIP: 'true'
```

## Database File

When building your mock api's you'll most like want to generate some fake data and return a number
of items for a specific collection. I've included [Lodash](https://lodash.com/) &
[faker.js](https://github.com/Marak/faker.js) in the image to help facilitate doing these sorts of
things inside your source file, or middleware for that matter. Here's an example of what I mean:

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

## Maintaining/Contributing

- Bump version of `json-server` in [`Dockerfile`](./Dockerfile)
- Bump node dependencies
- Test it out

```sh
docker-compose up -d --build
```

Check out <http://json-server.docker>. Update [`db.js`](./db.js), [`routes.json`](./routes.json), or
[`middleware.js`](./middleware.js) to test out functionality. Changes should propagate
automatically, just refresh the page.

### Releasing

**New version**:

```sh
git tag -f -m 'v0.17.0' v0.17.0
git push origin master --tags
```

**Updating old version**

We keep our versions in sync with `json-server`. This scenario would happen if there's a bug fix or
feature change with our implementation but the `json-server` version doesn't change.

```sh
git tag -d v0.16.1
git push origin :v0.16.1
git tag -f -m 'v0.16.1' v0.16.1
git push origin master --tags
```

Docker Hub is configured to automatically build on new tags pushed to GitHub.

## Todo

- Add examples of using this with docker cli, without a compose file
