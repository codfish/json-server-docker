FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV COREPACK_HOME="/corepack"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack install
RUN pnpm install --frozen-lockfile --prod

# copy in files
COPY ./tsconfig.json \
     ./db.js \
     ./middleware.js \
     ./server.js ./

EXPOSE 3000
ENV PORT=3000
RUN chown -R node:node /app /pnpm /corepack
USER node

ENTRYPOINT [ "tini", "--", "pnpm", "start" ]
