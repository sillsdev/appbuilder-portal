FROM kekel87/node-chrome-firefox

WORKDIR /app

ENV YARN_CACHE_FOLDER=/.yarn-cache

COPY \
  package.json \
  yarn.lock \
  /app/

RUN yarn install --pure-lockfile

COPY . /app
