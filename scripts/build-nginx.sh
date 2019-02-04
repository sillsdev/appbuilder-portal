#!/bin/bash
#
# shell flags
#  -e aborts the script if any subcommand fails
#  -a shares the environment variables between parent and subshells
set -ea

source ./scripts/build-setup.sh

NGINX_BUILD_TAG="nginx-$CURRENT_VERSION"
NGINX_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX

if [[ $CURRENT_BRANCH == *"develop"* ]]; then
  echo "Building a develop-only image. This will show debug info in the bottom left."

  docker build . -f Dockerfile.nginx \
    -t $NGINX_BUILD_TAG \
    --target release \
    --build-arg SHOW_DEBUG=true \
    --build-arg REVISION=$(git rev-parse HEAD)
else
  docker build . -f Dockerfile.nginx -t $NGINX_BUILD_TAG --target release
fi

if [[ $PUSH_TO_DOCKER_REGISTRY == "true" ]]; then
  docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$DEPLOY_LEVEL
  docker push $NGINX_IMAGE_URL:$DEPLOY_LEVEL
  docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$CURRENT_VERSION
  docker push $NGINX_IMAGE_URL:$CURRENT_VERSION
fi
