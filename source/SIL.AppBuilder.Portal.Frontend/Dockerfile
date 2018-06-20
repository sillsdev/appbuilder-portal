FROM node:8.11.1

RUN mkdir /app \
  && apt update \
  # Python is needed for libsass...
  && apt install python

WORKDIR /app

ENV YARN_CACHE_FOLDER=/.yarn-cache

COPY \
  package.json \
  yarn.lock \
  /app/

RUN echo \
  && yarn install --pure-lockfile

COPY . /app


# Dev Server
ENV PORT=9091
# Hot Reload
ENV HMR_PORT=9092

CMD ["yarn", "start"]
