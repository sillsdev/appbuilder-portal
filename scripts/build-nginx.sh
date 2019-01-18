
set -a

source ./scripts/build-setup.sh

NGINX_BUILD_TAG="nginx-$CURRENT_VERSION"
NGINX_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX
docker build . -f Dockerfile.nginx -t $NGINX_BUILD_TAG --target release
docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$DEPLOY_LEVEL
docker push $NGINX_IMAGE_URL:$DEPLOY_LEVEL
docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$CURRENT_VERSION
docker push $NGINX_IMAGE_URL:$CURRENT_VERSION