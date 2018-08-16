#!/bin/bash
# $1 - current version (e.g. commit sha)
# $2 - deployment level (e.g. staging/production)

REPO_PORTAL_API=appbuilder-portal-api
REPO_PORTAL_NGINX=appbuilder-portal-nginx
CURRENT_VERSION=$1
DEPLOY_LEVEL=$2

docker --version # document the version travis is using
pip install --user awscli # install aws cli w/o sudo
export PATH=$PATH:$HOME/.local/bin # put aws in path
(cd $HOME/.local/bin && curl -O https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy && chmod +x ecs-deploy) 
eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

(cd source && docker build . -f Dockerfile.nginx -t nginx-$CURRENT_VERSION --target release)
docker tag nginx-$CURRENT_VERSION $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$DEPLOY_LEVEL
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$DEPLOY_LEVEL
docker tag nginx-$CURRENT_VERSION $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$CURRENT_VERSION
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$CURRENT_VERSION

(cd source && docker build . -f Dockerfile.backend -t api-$CURRENT_VERSION --target runtime-release)
docker tag api-$CURRENT_VERSION $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$DEPLOY_LEVEL
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$DEPLOY_LEVEL
docker tag api-$CURRENT_VERSION $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$CURRENT_VERSION
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$CURRENT_VERSION
