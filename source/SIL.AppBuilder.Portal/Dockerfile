# Temporary container to build output
FROM node:20-alpine3.19 AS builder

WORKDIR /build

# Run npm i before copying all source code because Docker caches each layer
# and reuses them if nothing has changed. This way if package.json is unchanged,
# docker will skip the install even if other source files have changed.
COPY package*.json /build/
COPY common/package*.json /build/common/
RUN npm i

# Run prisma generate to rebuild with the correct target, also caching
COPY common/prisma /build/common/
RUN (cd common; npx prisma generate)

# Copy all source and run a build
COPY . /build/
RUN npm run build

# Now the output is in /build/out/build
# Build the node-server code (output goes into /build/out as defined in tsconfig.json)
RUN (cd /build/common/; npx tsc)
RUN (cd /build/node-server/; npx tsc)


# Real container that will run
FROM node:20-alpine3.19

WORKDIR /app

# Bring in package.json and install deps
COPY --from=builder /build/package*.json /app/
COPY --from=builder /build/common/package*.json /app/common/

# Install production dependencies
RUN npm ci --omit dev

# Bring in source code
COPY --from=builder /build/out /app

# Bring in the common module
COPY --from=builder /build/common /app/common

# Copy prisma data (npm ci nukes node_modules, so this must be last)
COPY --from=builder /build/node_modules/.prisma /app/node_modules/.prisma

EXPOSE 3000
CMD ["node", "/app/index.js"]
