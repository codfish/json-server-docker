#!/usr/bin/env node

import { $, fs } from 'zx';
import jsonServerCli from 'json-server/lib/cli/run.js';

// Install extra dependencies passed in by the user with the `DEPENDENCIES` envvar.
// Note: Needs to be done before compiling.
// Store a custom cache so we don't need to re-install every time the server restarts.
const extraDeps = process.env.DEPENDENCIES;

let cache = '';
if (await fs.exists('.cache')) {
  cache = await fs.readFile('.cache', { encoding: 'utf8' });
}

if (extraDeps && cache.trim() !== extraDeps) {
  // https://github.com/google/zx/issues/164#issuecomment-886630046
  const command = `npm install --no-save ${process.env.DEPENDENCIES}`;
  await $([command]);
  await fs.writeFile('.cache', extraDeps);
}

// Compile typescript
await $`npm run build`;

// Copy non-js/ts files to api directory cause tsc won't do it.
await $`cp *.json dist`;
if (await fs.pathExists('public')) {
  await fs.copy('public', 'dist');
}

// Infer the correct source file
const source = (await fs.exists('./dist/db.json')) ? 'dist/db.json' : 'dist/db.js';

// Run json-server
//
// https://github.com/typicode/json-server/cli-usage
//
// json-server [options] <source>
//
// Options:
//   --config, -c       Path to config file           [default: "json-server.json"]
//   --port, -p         Set port                                    [default: 3000]
//   --host, -H         Set host                             [default: "localhost"]
//   --watch, -w        Watch file(s)                                     [boolean]
//   --routes, -r       Path to routes file
//   --middlewares, -m  Paths to middleware files                           [array]
//   --static, -s       Set static files directory
//   --read-only, --ro  Allow only GET requests                           [boolean]
//   --no-cors, --nc    Disable Cross-Origin Resource Sharing             [boolean]
//   --no-gzip, --ng    Disable GZIP Content-Encoding                     [boolean]
//   --snapshots, -S    Set snapshots directory                      [default: "."]
//   --delay, -d        Add delay to responses (ms)
//   --id, -i           Set database id property (e.g. _id)         [default: "id"]
//   --foreignKeySuffix, --fks  Set foreign key suffix, (e.g. _id as in post_id)
//                                                                  [default: "Id"]
//   --quiet, -q        Suppress log messages from output                 [boolean]
//   --help, -h         Show help                                         [boolean]
//   --version, -v      Show version number                               [boolean]

jsonServerCli({
  _: [source],
  config: 'json-server.json',
  delay: process.env.DELAY === 'true',
  foreignKeySuffix: process.env.FOREIGN_KEY_SUFFIX || process.env.FKS || 'Id',
  host: '0.0.0.0',
  id: process.env.ID || 'id',
  middlewares: (process.env.MIDDLEWARES || 'middleware.js').split(' ').map((m) => `dist/${m}`),
  noCors: process.env.NO_CORS === 'true',
  noGzip: process.env.NO_GZIP === 'true',
  quiet: process.env.QUIET === 'true',
  readOnly: process.env.READ_ONLY === 'true',
  port: 80,
  routes: 'dist/routes.json',
  snapshots: process.env.SNAPSHOTS || '.',
  static: (await fs.pathExists('./dist/public')) ? 'dist/public' : null,
  watch: false,
});
