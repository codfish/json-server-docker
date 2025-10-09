# json-server-docker

Dockerized [json-server](https://github.com/typicode/json-server) for building a full fake RESTful
API.

[![version](https://img.shields.io/docker/v/codfish/json-server/0.17.3)](https://hub.docker.com/r/codfish/json-server)
[![pulls](https://img.shields.io/docker/pulls/codfish/json-server.svg)](https://hub.docker.com/r/codfish/json-server)
[![MIT License](https://img.shields.io/github/license/codfish/json-server-docker)](http://opensource.org/licenses/MIT)

> Created with <3 for front-end developers who need a quick back-end for prototyping and mocking.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Docker Compose (Recommended)](#docker-compose-recommended)
  - [Docker cli](#docker-cli)
  - [Advanced](#advanced)
  - [Important Usage Notes](#important-usage-notes)
- [Database File](#database-file)
- [Middleware](#middleware)
  - [Using Multiple Middleware files](#using-multiple-middleware-files)
- [Typescript Support](#typescript-support)
- [Options](#options)
- [Maintaining/Contributing](#maintainingcontributing)
  - [Releasing](#releasing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- 💨 **Up and running quickly** - Spin up a RESTful mock API in seconds.
- ⚙️ **Configurable** - Supports every `json-server` configuration option, with some purposeful
  exceptions.
- <img src="ts.png" width="16" height="16"> **Typescript support** - Use TS for your db, middleware,
  or any file you mount into the container.
- 💻 **Mount in any supporting files you'd like!** - For instance, want to use your custom data
  fixtures, utils, etc. in your db/middleware? Mount them in, import & prosper.
- 📦 **Useful dependencies are pre-installed** in the image for your convenience. Use
  [`lodash`](https://lodash.com/), [`@faker-js/faker`](https://github.com/faker-js/faker) &
  [`jwt-decode`](https://github.com/auth0/jwt-decode) in any of the files powering your mock api.
- 🧳 **Install your own dependencies** - Use the `DEPENDENCIES` envvar to pass a list of additional
  npm dependencies to use in your server files.
- 🔂 **Hot reloading** the server on any changes.

## Getting Started

**Latest Version**: `codfish/json-server:0.17.3`

> **Note**: It's recommended to specify the tag of the image you want rather than using the latest
> image, which might break. Image tags are based off of the
> [release versions for json-server](https://github.com/typicode/json-server/releases). However
> there is not an image for every version. See the available versions
> [here](https://hub.docker.com/r/codfish/json-server/tags).

By default, the image runs an instance of `json-server` with some dummy data for show. Spin up the
example mock api in seconds.

```sh
docker run -p 9999:80 codfish/json-server:0.17.3
```

Visit <http://localhost:9999> to see it in action.

That's all good, but not very useful to you. You're meant to mount in your own db file(s) into the
container. Read on for usage...

## Usage

This project actually dogfoods itself. View the [docker-compose.yml](./docker-compose.yml) & the
[examples/](./examples/) directory to see various usage examples. Also visit the
[`json-server` docs](https://github.com/typicode/json-server) for more detailed examples on how to
use the tool.

**Examples**

- [Simple json file](./examples/json/)
- [Multiple middlewares](./examples/middlewares/)
- [Installing extra dependencies](./examples/deps/)
- [Typescript](./examples/typescript/)
- [Mount in additional files](./examples/support-files/)

### Docker Compose (Recommended)

```yml
version: '3'

services:
  api:
    image: codfish/json-server:0.17.3
    ports:
      - 9999:80
    volumes:
      - ./my-db.js:/app/db.js:delegated
      - ./my-middleware.js:/app/middleware.json:delegated
      - ./my-routes.json:/app/routes.json:delegated
```

Run `docker-compose up api`. Visit <http://localhost:9999/> to see your API.

### Docker cli

```sh
docker run -d -p 9999:80 \
  -v ./my-db.js:/app/db.js \
  -v ./my-middleware.js:/app/middleware.json \
  -v ./my-routes.json:/app/routes.json \
  codfish/json-server:0.17.3
```

### Advanced

Set configuration via environment variables.

```yaml
services:
  json-server:
    image: codfish/json-server:0.17.3
    volumes:
      - ./db.ts:/app/db.ts:delegated
      - ./middleware.ts:/app/middleware.ts:delegated
      - ./routes.json:/app/routes.json:delegated
    environment:
      FKS: Address
      ID: address
      NO_CORS: true
      NO_GZIP: true
```

See all the [available options below](#options).

### Important Usage Notes

> - **LIMITATION**: `json-server` ONLY supports `commonjs`! If you try to use any ESM dependency in
>   your db files, it will fail. For our Typescript support, while ESM is supported in your db
>   files, we're [compiling](./tsconfig.json) to target es5 & commonjs and dependencies are not
>   compiled, so when using 3rd party deps, use versions that export commonjs modules.

- Your `db.{js,ts}` & any middleware files need to return a function as their **default** export.
- When mounting `*.js` files, make sure they are using commonjs (`modules.exports = ...`). That's
  what `json-server` is expecting.
- When mounting `*.ts` files, use ESModules, but instead of using `export default ...`, use
  `export = ...`.
- All files should be mounted into the `/app` directory in the container.
- The following files are special and will "just work" when **mounted over**.
  - `/app/db.{ts,js,json}` - The database file.
  - `/app/middleware.{ts,js}` - Custom
    [middleware file](https://github.com/typicode/json-server#add-middlewares).
  - `/app/routes.json` - Custom
    [routes file](https://github.com/typicode/json-server#add-custom-routes).
  - `/public` - Static files directory.

## Database File

When building your mock api's you'll most like want to generate some fake data and return a number
of items for a specific collection. [Faker](https://github.com/faker-js/faker) is included in the
image to help facilitate doing these sorts of things inside your db or middleware files. For
example:

```js
// db.js
const times = require('lodash/times');
const { faker } = require('@faker-js/faker');

module.exports = (req, res) => {
  return {
    posts: times(100, () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      body: faker.lorem.paragraphs(3),
    })),
  };
};
```

## Middleware

Example middleware.

```ts
// middleware.ts
import { faker } from '@faker-js/faker';

export = (req, res, next) => {
  // If you're making an ajax request and not viewing in the browser, require an Authorization header.
  if (!req.accepts('html') && !req.header('Authorization')) {
    res.status(401).send();
  }

  // Force uuid's for id's for primary keys instead of integers.
  if (req.method === 'POST') {
    req.body.id = faker.string.uuid();
  }

  next();
};
```

### Using Multiple Middleware files

Use the `MIDDLEWARES` to pass the
[`--middlewares`](https://github.com/typicode/json-server#add-middlewares) option to `json-server`.

**Important**: Notice here the files you're mounting in are using \*.ts extentions, but the
`MIDDLEWARES` env var uses `js` extensions. TS compiling happens _before_ `json-server` loads the
files.

```yml
services:
  middlewares:
    image: .
    volumes:
      - ./db.json:/app/db.json
      - ./middleware_a.ts:/app/middleware_a.ts:delegated
      - ./middleware_b.ts:/app/middleware_b.ts:delegated
    ports:
      - 9996:80
    environment:
      VIRTUAL_HOST: middlewares.json-server.docker
      MIDDLEWARES: 'middleware_a.js middleware_b.js'
```

## Typescript Support

**Important**

- Instead of using `export default ...`, use `export = ...` for any default exports from your ts
  files.
- TS is [configured](./tsconfig.json) to target commonjs es5 modules to work well with
  `json-server`.
- A [path alias](https://www.typescriptlang.org/tsconfig#paths) is configured for your convenience
  to map to the `/app` directory where all server files should be mounted.
- You can technically mount in your tsconfig file (`-v ./tsconfig.json:/app/tsconfig.json`) with
  your own configuration file, but beware, `json-server` needs the resulting compiled files to be
  commonjs modules.

```ts
// db.ts
import { faker } from '@faker-js/faker';

interface Database {
  posts: Array<{
    id: string;
    title: string;
    body: string;
  }>;
}

export = (): Database => ({
  posts: faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      body: faker.lorem.paragraphs(3),
    }),
    { count: 10 },
  ),
});
```

```sh
docker run -d -p 9999:80 -v ./db.ts:/app/db.ts codfish/json-server
```

## Options

`json-server` cli options: <https://github.com/typicode/json-server#cli-usage>

We will use the default options that `json-server` has set unless an override is provided. For
certain options like `--port` and `--host` we will explicitly set them to work well within a
container.

Here's the list of `json-server` options that are **NOT** configurable:

- `--host` - Always set to `0.0.0.0` within the container.
- `--port` - Always set to `80` within the container but you're still in full control of what port
  you want the api to run on on your machine by mapping any port to port `80` on the container (i.e.
  `docker run -p 9999:80 ...`).
- `--routes` - The `/app/routes.json` will always be the path to the
  [routes file](https://github.com/typicode/json-server#add-custom-routes) used in the container,
  but you're free to mount any json file from your machine over it.

However you still have the ability to override _almost_ every option yourself as well. All options
should be **passed in as environment variables**. They are named exactly like `json-server`'s but
upper snake-case (i.e. `--no-cors` -> `NO_CORS`).

`⋆` = Custom option. Not an official `json-server` option.

| Option           | Description                                                                          | Default                                                                         |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `MIDDLEWARES`    | Path to middleware file                                                              | `middleware.js` (Stored in image, optionally mount over it or provide your own) |
| `CONFIG`         | Path to config file                                                                  | Defers to `json-server` default                                                 |
| `SNAPSHOTS`      | Set snapshots directory                                                              | Defers to `json-server` default                                                 |
| `ID`             | Set database id property (e.g. `address`)                                            | Defers to `json-server` default                                                 |
| `FKS`            | Set foreign key suffix, (e.g. `_id` as in `user_id`)                                 | Defers to `json-server` default                                                 |
| `DELAY`          | Add delay to responses (ms)                                                          | —                                                                               |
| `STATIC`         | Set static files directory                                                           | Defers to `json-server` default                                                 |
| `QUIET`          | Suppress log messages from output                                                    | Boolean flag only true if set to "true"                                         |
| `NO_GZIP`        | Disable GZIP Content-Encoding                                                        | Boolean flag only true if set to "true"                                         |
| `NO_CORS`        | Disable Cross-Origin Resource Sharing                                                | Boolean flag only true if set to "true"                                         |
| `READ_ONLY`      | Allow only GET requests                                                              | Boolean flag only true if set to "true"                                         |
| ⋆ `DEPENDENCIES` | Install extra npm dependencies in the container for you to use in your server files. | —                                                                               |

For details on the options
[view `json-server`'s documentation](https://github.com/typicode/json-server#cli-usage).

## Maintaining/Contributing

This project actually dogfoods itself. To test it directly you can run:

```sh
git clone git@github.com:codfish/json-server-docker.git
cd json-server-docker
docker-compose up -d
```

**To update:**

- Bump version of `json-server` in [`Dockerfile`](./Dockerfile)
- Bump node dependencies
- Test it out

```sh
docker-compose up -d --build
```

Visit <http://localhost:9999>. Update [`db.js`](./db.ts), [`routes.json`](./routes.json), or
[`middleware.ts`](./middleware.ts) to test out functionality. Changes should propagate
automatically, just refresh the page.

### Releasing

**New version**:

```sh
git tag -f -m '0.17.3' 0.17.3
git push origin 0.17.3
```

**Updating old version**

We keep our versions in sync with `json-server`. This scenario would happen if there's a bug fix or
feature change with our implementation but the `json-server` version doesn't change.

```sh
git tag -fa 0.16.1 -m "Update 0.16.1 tag" && git push origin 0.16.1 --force
```
