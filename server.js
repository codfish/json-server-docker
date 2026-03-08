#!/usr/bin/env node

import chalk from 'chalk';
import { createApp } from 'json-server/lib/app.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { $, fs } from 'zx';

// Install extra dependencies passed in by the user with the `DEPENDENCIES` envvar.
// Note: Needs to be done before compiling.
// Store a custom cache so we don't need to re-install every time the server restarts.
const extraDeps = process.env.DEPENDENCIES;

let cache = '';
if (await fs.exists('.cache')) {
  cache = await fs.readFile('.cache', { encoding: 'utf8' });
}

if (extraDeps && cache.trim() !== extraDeps) {
  const deps = process.env.DEPENDENCIES.split(/\s+/).filter(Boolean);
  await $`pnpm add ${deps}`;
  await fs.writeFile('.cache', extraDeps);
}

// Compile typescript
await $`pnpm run build`;

// Copy non-js/ts files to dist/ cause tsc won't do it.
try {
  await $`cp *.json dist`;
} catch {
  // No JSON files to copy — that's fine.
}

if (await fs.pathExists('public')) {
  await fs.copy('public', 'dist');
}

// Resolve the database.
// JSON files are used directly via lowdb's JSONFile adapter.
// JS/TS files (compiled) are dynamically imported — their default export
// is called to generate data, which is then written to dist/db.json.
let dbPath;

if (await fs.exists('./dist/db.json')) {
  dbPath = './dist/db.json';
} else if (await fs.exists('./dist/db.js')) {
  const mod = await import('./dist/db.js');
  const generate = mod.default;
  const data = typeof generate === 'function' ? generate() : generate;
  await fs.writeJson('./dist/db.json', data);
  dbPath = './dist/db.json';
} else {
  // eslint-disable-next-line no-console
  console.error('No db file found. Mount a db.json, db.js, or db.ts file into /app.');
  process.exit(1);
}

// Create lowdb instance
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, {});
await db.read();

// Create the json-server app
const staticDirs = [];
if (await fs.pathExists('./dist/public')) {
  staticDirs.push('dist/public');
}
if (process.env.STATIC) {
  const staticPath = process.env.STATIC;
  if (staticPath.includes('..')) {
    // eslint-disable-next-line no-console
    console.error(`STATIC path must not contain '..'. Got: ${staticPath}`);
    process.exit(1);
  }
  staticDirs.push(staticPath);
}

const app = createApp(db, {
  static: staticDirs,
});

// Middleware to prepend to the app's internal stack (before json-server's routes).
// Equivalent to regexparam.parse('/', true) — matches all paths.
const rootRegex = { keys: [], pattern: /^(?=$|\/)/i };
const prependMiddleware = [];

// Request logging middleware
prependMiddleware.push({
  handler: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        `${chalk.gray(req.method)} ${req.originalUrl} ${chalk.green(res.statusCode)} ${chalk.gray(`${duration}ms`)}`,
      );
    });
    next();
  },
  type: 'mw',
  path: '/',
  fullPath: '/',
  regex: rootRegex,
  fullPathRegex: rootRegex,
});

// Load user middleware if it exists.
// We unshift it into the app's internal middleware stack so it runs BEFORE
// json-server's route handlers (which send the response). Appending via
// app.use() after createApp would place it after the catch-all response
// handler, meaning it would never execute for matched routes.
if (await fs.exists('./dist/middleware.js')) {
  const middlewareMod = await import('./dist/middleware.js');
  if (typeof middlewareMod.default === 'function') {
    prependMiddleware.push({
      handler: middlewareMod.default,
      type: 'mw',
      path: '/',
      fullPath: '/',
      regex: rootRegex,
      fullPathRegex: rootRegex,
    });
  }
}

app.middleware.unshift(...prependMiddleware);

const port = Number(process.env.PORT) || 3000;

// Note: tinyhttp's listen signature is (port, cb, host), not (port, host, cb).
app.listen(
  port,
  () => {
    const endpoints = Object.keys(db.data);
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        chalk.bold(`JSON Server started on PORT :${port}`),
        chalk.dim('Press CTRL-C to stop'),
        '',
        '♡⸜(˶˃ ᵕ ˂˶)⸝♡',
        '',
        chalk.bgBlue.bold('Index:'),
        `http://localhost:${port}/`,
        '',
        '',
        chalk.bgBlue.bold('Endpoints:'),
        ...(endpoints.length > 0
          ? endpoints.map(key => `http://localhost:${port}/${chalk.blueBright(key)}`)
          : [chalk.gray('No endpoints found, try adding some data to your db file')]),
        '',
        '',
      ].join('\n'),
    );
  },
  '0.0.0.0',
);
