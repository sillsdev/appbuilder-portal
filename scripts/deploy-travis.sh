#!/bin/bash
# $1 - docker tag

REPO_PORTAL_API=appbuilder-portal-api
REPO_PORTAL_NGINX=appbuilder-portal-nginx
TAG_ID=$1

docker --version # document the version travis is using
pip install --user awscli # install aws cli w/o sudo
export PATH=$PATH:$HOME/.local/bin # put aws in path
(cd $HOME/.local/bin && curl -O https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy && chmod +x ecs-deploy) 
eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

(cd source && docker build . -f Dockerfile.nginx -t $REPO_PORTAL_NGINX:$TAG_ID --target release)
docker tag $REPO_PORTAL_NGINX:$TAG_ID $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$TAG_ID
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_NGINX:$TAG_ID

(cd source && docker build . -f Dockerfile.backend -t $REPO_PORTAL_API:$TAG_ID --target runtime-release)
docker tag $REPO_PORTAL_API:$TAG_ID $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$TAG_ID
docker push $AWS_ECR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/$REPO_PORTAL_API:$TAG_ID
