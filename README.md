# json-server-docker

Dockerized [json-server](https://github.com/typicode/json-server) for building a full fake RESTful API.

[![json-server version](https://img.shields.io/docker/v/codfish/json-server)](https://hub.docker.com/r/codfish/json-server)
[![pulls](https://img.shields.io/docker/pulls/codfish/json-server.svg)](https://hub.docker.com/r/codfish/json-server)
[![MIT License](https://img.shields.io/github/license/codfish/json-server-docker)](http://opensource.org/licenses/MIT)

> Created with <3 for front-end developers who need a quick back-end for prototyping and mocking.

> **Note**: This version uses json-server v1 (beta), which is a ground-up rewrite. Many CLI options from v0 have been
> removed. See [Options](#options) for the current set of supported configuration.

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
- [Typescript Support](#typescript-support)
- [Options](#options)
- [Query Parameters](#query-parameters)
- [Maintaining/Contributing](#maintainingcontributing)
  - [Examples](#examples)
  - [Releasing](#releasing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- 💨 **Up and running quickly** - Spin up a RESTful mock API in seconds.
- ⚙️ **Configurable** - Supports `json-server` v1 configuration via environment variables.
- <img src="ts.png" width="16" height="16" alt="TypeScript"> **Typescript support** - Use TS for your db, middleware, or
  any file you mount into the container.
- 💻 **Mount in any supporting files you'd like!** - For instance, want to use your custom data fixtures, utils, etc. in
  your db/middleware? Mount them in, import & prosper.
- 📦 **Useful dependencies are pre-installed** in the image for your convenience. Use [`lodash-es`](https://lodash.com/)
  & [`@faker-js/faker`](https://github.com/faker-js/faker) in any of the files powering your mock api.
- 🧳 **Install your own dependencies** - Use the `DEPENDENCIES` envvar to pass a list of additional npm dependencies to
  use in your server files.
- 🔂 **Hot reloading** the server on any changes.

## Getting Started

**Latest Version**: `codfish/json-server:1.0.0-beta.12`

> [!NOTE]
>
> You are reading the docs for the **v1 beta** of json-server-docker. If you'd prefer the stable v0 release, run
> `docker run -p 3000:80 codfish/json-server:0.17.4` and view the
> [v0 documentation](https://github.com/codfish/json-server-docker/blob/0.17.4/README.md).

By default, the image runs an instance of `json-server` with some dummy data for show. Spin up the example mock api in
seconds.

```sh
# Visit <http://localhost:3000> to see it in action.
docker run -p 3000:3000 codfish/json-server
```

That's all good, but not very useful to you. You're meant to mount in your own db file(s) into the container. Read on
for usage...

## Usage

> [!WARNING]
>
> It's recommended to specify the tag of the image you want rather than using the latest image, which might break. Image
> tags are based off of the [release versions for json-server](https://github.com/typicode/json-server/releases).
> However there is not an image for every version. See the available versions
> [on Docker Hub](https://hub.docker.com/r/codfish/json-server/tags).

This project actually dogfoods itself. View the [docker-compose.yml](./docker-compose.yml) & the
[examples/](./examples/) directory to see various usage examples. Also visit the
[`json-server` docs](https://github.com/typicode/json-server) for more detailed examples on how to use the tool.

**Examples**

- [Simple json file](./examples/json/)
- [Installing extra dependencies](./examples/deps/)
- [Typescript](./examples/typescript/)
- [Mount in additional files](./examples/support-files/)
- [Custom middleware](./examples/middlewares/)
- [Static files](./examples/static/)

### Docker Compose (Recommended)

```yml
services:
  api:
    image: codfish/json-server:1.0.0-beta.12
    ports:
      - 3000:3000
    volumes:
      - ./my-db.js:/app/db.js:delegated
      - ./my-middleware.js:/app/middleware.js:delegated
```

Run `docker compose up api`. Visit <http://localhost:3000/> to see your API.

### Docker cli

> [!TIP]
>
> The server listens on `0.0.0.0:3000` by default inside the container. Mapping a different host port (e.g.
> `-p 3001:3000`) will work fine, but your logs will still say `localhost:3000`. For the best DX, pass the `PORT` env
> var to sync them (e.g., `docker run -e PORT=3001 -p 3001:3001 ...`).

```sh
docker run -d -e PORT=3001 -p 3001:3001 \
  -v ./my-db.js:/app/db.js \
  -v ./my-middleware.js:/app/middleware.js \
  codfish/json-server:1.0.0-beta.12
```

### Advanced

Set configuration via environment variables.

```yaml
services:
  json-server:
    image: codfish/json-server:1.0.0-beta.12
    volumes:
      - ./db.ts:/app/db.ts:delegated
      - ./middleware.ts:/app/middleware.ts:delegated
    environment:
      DEPENDENCIES: chance@1 node-emoji@1
```

See all the [available options below](#options).

### Important Usage Notes

- **IDs must be strings.** json-server v1 uses strict equality (`===`) to match URL params against record IDs. Since URL
  params are always strings, integer IDs will never match on individual resource lookups (e.g., `GET /users/1`). Use
  string IDs like `"1"` or UUIDs.
- All mounted files should use **ESM syntax** (`import`/`export default`).
- All files should be mounted into the `/app` directory in the container.
- The following files are special and will "just work" when **mounted over**:
  - `/app/db.{ts,js,json}` - The database file. JS/TS files must `export default` a function that returns your data.
  - `/app/middleware.{ts,js}` - Custom middleware file. Must `export default` a `(req, res, next)` function.
  - `/public` - Static files directory.

## Database File

When building your mock api's you'll most like want to generate some fake data and return a number of items for a
specific collection. [Faker](https://github.com/faker-js/faker) is included in the image to help facilitate doing these
sorts of things inside your db or middleware files. For example:

```js
// db.js
import { faker } from '@faker-js/faker';

export default () => ({
  posts: faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      body: faker.lorem.paragraphs(3),
    }),
    { count: 100 },
  ),
});
```

## Middleware

Mount a `middleware.{js,ts}` file to add custom middleware that runs **before** json-server's route handlers. This is
useful for things like authentication checks, request mutation, custom headers, and logging.

```ts
// middleware.ts
export default (req, res, next) => {
  // Add custom response headers
  res.set('X-Custom-Header', 'my-value');

  // Require authorization for non-browser requests
  if (!req.accepts('html') && !req.header('Authorization')) {
    res.status(401).send();
    return;
  }

  next();
};
```

## Typescript Support

**Important**

- Use `export default ...` for default exports from your ts files.
- TS is [configured](./tsconfig.json) to target ESM (`es2022` / `nodenext`).
- A [path alias](https://www.typescriptlang.org/tsconfig#paths) is configured for your convenience to map to the `/app`
  directory where all server files should be mounted.
- When importing local files in TS, use the `.js` extension (e.g., `import foo from './fixtures/bar.js'`).

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

export default (): Database => ({
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
docker run -d -e PORT=3000 -p 3000:3000 -v ./db.ts:/app/db.ts codfish/json-server:1.0.0-beta.12
```

## Options

`json-server` v1 has significantly fewer configuration options than v0. The following environment variables are
supported:

| Option         | Description                                                                          | Default |
| -------------- | ------------------------------------------------------------------------------------ | ------- |
| `DEPENDENCIES` | Install extra npm dependencies in the container for you to use in your server files. | —       |
| `STATIC`       | Serve an additional static files directory (`./public` is always served)             | —       |
| `PORT`         | Set the port the server listens on inside the container.                             | 3000    |

> [!CAUTION]
>
> The `DEPENDENCIES` env var runs `pnpm add` with whatever packages you specify. A malicious package's install script
> will execute inside the container. Only use packages you trust.

## Query Parameters

json-server v1 supports the following query parameters:

- **Pagination**: `_page` and `_per_page` (e.g., `?_page=1&_per_page=10`)
- **Sorting**: `_sort` (e.g., `?_sort=id` or `?_sort=-id` for descending)
- **Filtering**: Use field names directly (e.g., `?title=foo`)
- **Embedding**: `_embed` (e.g., `?_embed=comments`)

> **Note**: The `_expand` and `q` (full-text search) parameters from v0 have been removed in v1.

## Maintaining/Contributing

This project dogfoods itself. To test it directly you can run:

```sh
git clone git@github.com:codfish/json-server-docker.git
cd json-server-docker
docker compose up -d
```

If you want to test it locally without docker, you can `pnpm install` and then `pnpm start` to run the server directly
on your machine.

### Examples

The [docker-compose.yml](./docker-compose.yml) defines several services that exercise different features. Each one maps
to a directory in [examples/](./examples/).

| Service                         | Port | Description                                           |
| ------------------------------- | ---- | ----------------------------------------------------- |
| `docker-compose up basic`       | 3000 | Default db.js with faker-generated data               |
| `docker-compose up typescript`  | 9998 | TypeScript db & middleware                            |
| `docker-compose up json-db`     | 9997 | Plain JSON database file                              |
| `docker-compose up middlewares` | 9996 | Custom middleware that sets response headers          |
| `docker-compose up deps`        | 9995 | Extra dependencies installed via `DEPENDENCIES` envar |
| `docker-compose up static`      | 9993 | Custom public directory with static HTML              |
| `docker-compose up dags`        | 9994 | Supporting files mounted alongside the db             |

Run all examples:

```sh
docker compose up --build
```

Or run a specific one:

```sh
docker compose up --build typescript
```

Visit the corresponding port (e.g., <http://localhost:9998>) to verify.

**To update:**

- Bump version of `json-server` in [`package.json`](./package.json)
- Bump node dependencies
- Test it out

```sh
docker compose up -d --build
```

Visit <http://localhost:3000>. Update [`db.js`](./db.js) or [`middleware.js`](./middleware.js) to test out
functionality. Changes should propagate automatically, just refresh the page.

### Releasing

**New version**:

```sh
git tag -m '1.0.0-beta.12' 1.0.0-beta.12
git push origin 1.0.0-beta.12
```

Pushing a tag triggers the release workflow, which builds and pushes the Docker image tagged with the version.

**Updating old version**

We keep our versions in sync with `json-server`. This scenario would happen if there's a bug fix or feature change with
our implementation but the `json-server` version doesn't change.

```sh
git tag -fa 1.0.0-beta.12 -m "Update 1.0.0-beta.12 tag" && git push origin 1.0.0-beta.12 --force
```

Force-pushing the tag re-triggers the release workflow to rebuild the image.
