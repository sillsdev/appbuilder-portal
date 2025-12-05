# Temporary container to build output
FROM node:24-alpine3.21 AS builder

WORKDIR /build
RUN apk add --no-cache openssl

# Run npm i before copying all source code because Docker caches each layer
# and reuses them if nothing has changed. This way if package.json is unchanged,
# docker will skip the install even if other source files have changed.
COPY package*.json .
RUN npm i

# Run prisma generate to rebuild with the correct target, also caching
COPY src/lib/prisma /build/src/lib/prisma
COPY prisma.config.ts /build/
RUN npx prisma generate

# Copy all source and run a build
COPY . /build/
RUN npm run build

# Fix sourcemaps
RUN npm run fix-sourcemaps

# Docs Container
FROM linuxserver/libreoffice:25.2.5 AS docs-builder
WORKDIR /docs 

COPY ./docs /docs/
RUN mkdir -p /docs/pdf

# Convert fodt and fodg files to pdf
RUN libreoffice --headless --convert-to pdf /docs/*.fodt --outdir /docs/pdf && \
    libreoffice --headless --convert-to pdf /docs/*.fodg --outdir /docs/pdf

# Real container that will run
FROM node:24-alpine3.21

WORKDIR /app
RUN apk add --no-cache openssl

# Bring in package.json and install deps
COPY --from=builder /build/package*.json /app/

# Install production dependencies
RUN npm ci

# Bring in source code
COPY --from=builder /build/out/build /app

# Bring docs into /app/client/docs (SvelteKit serves static files from client/)
RUN mkdir -p /app/client/docs
COPY --from=docs-builder /docs/pdf/*.pdf /app/client/docs/

# Copy prisma data (npm ci nukes node_modules, so this must be last)
COPY --from=builder /build/node_modules/.prisma /app/node_modules/.prisma
# Copy prisma migrations
COPY --from=builder /build/src/lib/prisma/migrations /app/node_modules/.prisma/client/migrations

EXPOSE 6173
ENV PORT=6173
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./node_modules/.prisma/client/schema.prisma && node --enable-source-maps index.js"]
