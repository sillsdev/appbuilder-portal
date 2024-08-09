# Temporary container to build output
FROM node:20-alpine3.19 AS builder

WORKDIR /build

# Run npm i before copying all source code because Docker caches each layer
# and reuses them if nothing has changed. This way if package.json is unchanged,
# docker will skip the install even if other source files have changed.
COPY package*.json /build/
RUN npm i 

# Run prisma generate to rebuild with the correct target, also caching
COPY prisma /build/
RUN npx prisma generate

# Copy all source and run a build
COPY . /build/
RUN npm run build

# Now the output is in /build/out/build
# Build the node-server code (output goes into /build/out as defined in tsconfig.json)
RUN (cd /build/node-server/; npx tsc)


# Real container that will run
FROM node:20-alpine3.19

WORKDIR /app

# Bring in package.json and install deps
COPY --from=builder /build/package*.json /app/

# Install production dependencies
RUN npm ci --omit dev

# Bring in source code
COPY --from=builder /build/out /app

# Copy prisma data (npm ci nukes node_modules, so this must be last)
COPY --from=builder /build/node_modules/.prisma /app/node_modules/.prisma

EXPOSE 3000
CMD ["node", "/app/index.js"]
