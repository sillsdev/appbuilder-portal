set -a

source ./scripts/build-setup.sh

API_BUILD_TAG="api-$CURRENT_VERSION"
API_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API

docker build . -f Dockerfile.backend -t $API_BUILD_TAG --target runtime-release

if [[ $PUSH_TO_DOCKER_REGISTRY == "true" ]]; then
  docker tag $API_BUILD_TAG $API_IMAGE_URL:$DEPLOY_LEVEL
  docker push $API_IMAGE_URL:$DEPLOY_LEVEL
  docker tag $API_BUILD_TAG $API_IMAGE_URL:$CURRENT_VERSION
  docker push $API_IMAGE_URL:$CURRENT_VERSION
fi
