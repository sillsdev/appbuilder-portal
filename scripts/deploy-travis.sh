#!/bin/bash
# $1 - current version (e.g. commit sha)
# $2 - deployment level (e.g. staging/production)

REPO_PORTAL_NGINX=appbuilder-portal-nginx
REPO_PORTAL_API=appbuilder-portal-api
CURRENT_VERSION=$1
DEPLOY_LEVEL=$2

docker --version # document the version travis is using
pip install --user awscli # install aws cli w/o sudo
export PATH=$PATH:$HOME/.local/bin # put aws in path
(cd $HOME/.local/bin && curl -O https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy && chmod +x ecs-deploy) 
eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

NGINX_BUILD_TAG=nginx-$CURRENT_VERSION
NGINX_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX
(cd source && docker build . -f Dockerfile.nginx -t $NGINX_BUILD_TAG --target release)
docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$DEPLOY_LEVEL
docker push $NGINX_IMAGE_URL:$DEPLOY_LEVEL
docker tag $NGINX_BUILD_TAG $NGINX_IMAGE_URL:$CURRENT_VERSION
docker push $NGINX_IMAGE_URL:$CURRENT_VERSION

API_BUILD_TAG=api-$CURRENT_VERSION
API_IMAGE_URL=$AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API
(cd source && docker build . -f Dockerfile.backend -t $API_BUILD_TAG --target runtime-release)
docker tag $API_BUILD_TAG $API_IMAGE_URL:$DEPLOY_LEVEL
docker push $API_IMAGE_URL:$DEPLOY_LEVEL
docker tag $API_BUILD_TAG $API_IMAGE_URL:$CURRENT_VERSION
docker push $API_IMAGE_URL:$CURRENT_VERSION

