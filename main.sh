#!/usr/bin/env bash

# Install extra dependencies passed in by the user with the `DEPENDENCIES` envvar.
# Note: Needs to be done before compiling. Store a custom cache so we don't need to
# re-install every time the server restarts.
DEP_CACHE=`cat .cache 2> /dev/null`
DEPS=`echo $DEPENDENCIES | sed 's/ *$//g'` # trims spaces
echo ""
if [[ -n "$DEPENDENCIES" && "$DEP_CACHE" != "$DEPENDENCIES" ]]; then
  echo "Installing extra dependencies..."
  echo ""
  echo "  npm install $DEPENDENCIES"
  echo ""
  if npm install $DEPENDENCIES; then
    echo ""
    echo "Caching..."
    echo "$DEPENDENCIES" > .cache
    echo "Done install extra dependencies."
  else
    echo ""
    echo "Install failed"
  fi
elif [[ -n "$DEPENDENCIES" && "$DEP_CACHE" == "$DEPENDENCIES" ]]; then
  echo "DEPENDENCIES already installed. Using cache..."
fi
echo ""

# Build at *runtime* so devs can make updates to their db files during local
# development allowing nodemon to restart on changes and re-compile.
# Note: using Nodemon over tsc simplifies things cause you can watch everything.
rm -rf api
tsc

# Copy non-js/ts files to api directory cause tsc won't do it.
cp server.sh *.json api
if [ -d public ]; then
  cp -r public api
fi

# run the server
cd api
./server.sh
