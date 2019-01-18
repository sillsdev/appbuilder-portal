#!/bin/bash
# $1 - current version (e.g. commit sha)
# $2 - branch

time ( sudo ./run clean:api )


REPO_PORTAL_NGINX=appbuilder-portal-nginx
REPO_PORTAL_API=appbuilder-portal-api
CURRENT_VERSION=$1

DEPLOY_LEVEL=staging
case "$2" in
  master)  DEPLOY_LEVEL=alpha ;;
  develop) DEPLOY_LEVEL=staging ;;
  "")      DEPLOY_LEVEL=unknown ;;
  *)       DEPLOY_LEVEL=$2 ;;
esac

case "$2" in
  master)  ECS_CLUSTER=aps-alpha ;;
  develop) ECS_CLUSTER=aps-stg ;;
esac


docker --version # document the version travis is using
sudo apt-get install jq
which jq && jq --version
pip install --user awscli # install aws cli w/o sudo
export PATH=$PATH:$HOME/.local/bin # put aws in path
(cd $HOME/.local/bin && curl -O https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy && chmod +x ecs-deploy) 
eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

