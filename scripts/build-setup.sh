#!/bin/bash
# $1 - current version (e.g. commit sha)
# $2 - branch

# time ( sudo ./run clean:api )

export REPO_PORTAL_NGINX=appbuilder-portal-nginx
export REPO_PORTAL_API=appbuilder-portal-api
export CURRENT_VERSION=$1

export DEPLOY_LEVEL=staging
case "$2" in
  master)  export DEPLOY_LEVEL=alpha ;;
  develop) export DEPLOY_LEVEL=staging ;;
  "")      export DEPLOY_LEVEL=unknown ;;
  *)       export DEPLOY_LEVEL=$2 ;;
esac

case "$2" in
  master)  export ECS_CLUSTER=aps-alpha ;;
  develop) export ECS_CLUSTER=aps-stg ;;
esac


docker --version # document the version travis is using

if [ `builtin type -p jq` ]; then
  echo "System already has jq";
else
  sudo apt-get install -y jq
fi
which jq && jq --version


if [ `builtin type -p aws` ]; then
  echo "System already has the aws cli";
else
  pip install --user awscli # install aws cli w/o sudo
fi

export PATH=$PATH:$HOME/.local/bin # put aws in path

if [ `builtin type -p ecs-deploy` ]; then
  echo "System already has ecs-deploy";
else
  (cd $HOME/.local/bin && curl -O https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy && chmod +x ecs-deploy)
fi

eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

