FROM --platform=linux/amd64 node:12.22.12-bullseye

ARG CHROME_VERSION="google-chrome-stable"

RUN mkdir /app \
  && apt update \
  # Python is needed for libsass...
  && apt install -y python \

  # Chrome is needed for automated acceptance testing
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install ${CHROME_VERSION:-google-chrome-stable} \

  # Clean up (smaller resulting image)
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

WORKDIR /app

ENV YARN_CACHE_FOLDER=/.yarn-cache

COPY \
  package.json \
  yarn.lock \
  /app/

RUN echo \
  # latest yarn (bugfixes, performance, etc)
  &&  curl -o- -L https://yarnpkg.com/install.sh | bash \
  # our dependencies
  && yarn install --pure-lockfile

COPY . /app


# Dev Server
ENV PORT=9091
# Hot Reload
ENV HMR_PORT=9092

CMD ["yarn", "start"]
