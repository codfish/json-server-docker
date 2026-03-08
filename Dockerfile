FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# copy in files
COPY ./tsconfig.json \
     ./db.js \
     ./middleware.js \
     ./server.js ./

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT [ "pnpm", "start" ]
