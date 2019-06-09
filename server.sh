#!/usr/bin/env bash

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

json-server \
  ${OPTIONS[*]} \
  --host ${HOST:-0.0.0.0} \
  --routes ${ROUTES:-routes.json} \
  --middlewares ${MIDDLEWARES:-middleware.js} \
  --port ${PORT:-80} \
  db.js
