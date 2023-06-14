#!/usr/bin/env bash

# https://github.com/typicode/json-server#cli-usage
#
# json-server [options] <source>
#
# Options:
#   --config, -c       Path to config file           [default: "json-server.json"]
#   --port, -p         Set port                                    [default: 3000]
#   --host, -H         Set host                             [default: "localhost"]
#   --watch, -w        Watch file(s)                                     [boolean]
#   --routes, -r       Path to routes file
#   --middlewares, -m  Paths to middleware files                           [array]
#   --static, -s       Set static files directory
#   --read-only, --ro  Allow only GET requests                           [boolean]
#   --no-cors, --nc    Disable Cross-Origin Resource Sharing             [boolean]
#   --no-gzip, --ng    Disable GZIP Content-Encoding                     [boolean]
#   --snapshots, -S    Set snapshots directory                      [default: "."]
#   --delay, -d        Add delay to responses (ms)
#   --id, -i           Set database id property (e.g. _id)         [default: "id"]
#   --foreignKeySuffix, --fks  Set foreign key suffix, (e.g. _id as in post_id)
#                                                                  [default: "Id"]
#   --quiet, -q        Suppress log messages from output                 [boolean]
#   --help, -h         Show help                                         [boolean]
#   --version, -v      Show version number                               [boolean]
#
# Examples:
#   json-server db.json
#   json-server file.js
#   json-server http://example.com/db.json


# codfish/json-server-docker
#
# We are supporting every json-server option documented via environment
# variables passed into the docker container.
#
# `boolean` options should be passed as the string "true", i.e. NO_CORS="true"
#
# Note: --port is NOT overridable but you have full control over the port based
# on the port mapping you use when running the docker image. We will ALWAYS
# expose the api on Port 80. You can bind whatever port you want to 80.

declare -a OPTIONS

if [ -n "$ID" ]; then
  OPTIONS+=" --id $ID"
fi

if [ -n "$FKS" ]; then
  OPTIONS+=" --fks $FKS"
fi

if [ -n "$CONFIG" ]; then
  OPTIONS+=" --config $CONFIG"
fi

if [ -n "$DELAY" ]; then
  OPTIONS+=" --delay $DELAY"
fi

if [ -n "$STATIC" ]; then
  OPTIONS+=" --static $STATIC"
fi

if [ -n "$SNAPSHOTS" ]; then
  OPTIONS+=" --snapshots $SNAPSHOTS"
fi

if [ "$QUIET" == "true" ]; then
  OPTIONS+=" --quiet"
fi

if [ "$NO_CORS" == "true" ]; then
  OPTIONS+=" --no-cors"
fi

if [ "$NO_GZIP" == "true" ]; then
  OPTIONS+=" --no-gzip"
fi

if [ "$READ_ONLY" == "true" ]; then
  OPTIONS+=" --read-only"
fi

# We need to infer the database source file to use.
if [ -f db.json ]; then
  SOURCE="db.json"
else
  SOURCE="db.js"
fi

json-server \
  ${OPTIONS[*]} \
  --host ${HOST:-0.0.0.0} \
  --routes ${ROUTES:-routes.json} \
  --middlewares ${MIDDLEWARES:-middleware.js} \
  --port 80 \
  ${SOURCE}
