set -a

./build-setup.sh $1 $2

API_BUILD_TAG="api-$CURRENT_VERSION"
API_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API
docker build . -f Dockerfile.backend -t $API_BUILD_TAG --target runtime-release
docker tag $API_BUILD_TAG $API_IMAGE_URL:$DEPLOY_LEVEL
docker push $API_IMAGE_URL:$DEPLOY_LEVEL
docker tag $API_BUILD_TAG $API_IMAGE_URL:$CURRENT_VERSION
docker push $API_IMAGE_URL:$CURRENT_VERSION