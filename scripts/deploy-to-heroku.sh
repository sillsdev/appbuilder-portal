# NOTE: this is a work in progress and may change
HEROKU_APP_NAME=sil-appbuilder
GIT_VERSION=$(git rev-parse HEAD)
CURRENT_VERSION=${$GIT_VERSION:-TRAVIS_COMMIT}

IMAGE_NAME="api-$CURRENT_VERSION"
REGISTRY_URL="registry.heroku.com/$HEROKU_APP_NAME/web"

cd source && \
  docker build . -f Dockerfile.backend \
    --tag $IMAGE_NAME --target runtime-release

# heroku login
# heroku container:login
docker login --username=_ --password=$HEROKU_AUTH_TOKEN registry.heroku.com

docker tag $IMAGE_NAME $REGISTRY_URL
docker push $REGISTRY_URL
