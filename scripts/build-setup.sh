#!/bin/bash
# $1 - current version (e.g. commit sha)
# $2 - branch
#
# shell flags
#  -e aborts the script if any subcommand fails
#
# Examples
#
#  On Travis CI
#    ./scripts/build-api.sh $TRAVIS_COMMIT $TRAVI_BRANCH
#    ./scripts/build-nginx.sh $TRAVIS_COMMIT $TRAVI_BRANCH
#
#  Locally
#    LOCAL_BUILD=true ./scripts/build-api.sh
#    LOCAL_BUILD=true ./scripts/build-nginx.sh

set -e

export REPO_PORTAL_NGINX=appbuilder-portal-nginx
export REPO_PORTAL_API=appbuilder-portal-api

if [[ $LOCAL_BUILD == "true" ]]; then
  git_version=$(git rev-parse HEAD)
  git_branch=$(git symbolic-ref HEAD | sed 's!refs\/heads\/!!')

  export CURRENT_VERSION=${1:-$git_version}
  export CURRENT_BRANCH=${2:-$git_branch}
else
  export CURRENT_VERSION=$1
  export CURRENT_BRANCH=$2
fi

echo "Starting Build for Commit: $CURRENT_VERSION"
echo "on branch: $CURRENT_BRANCH"

export DEPLOY_LEVEL=staging
case "$CURRENT_BRANCH" in
  master)  export DEPLOY_LEVEL=alpha ;;
  develop) export DEPLOY_LEVEL=staging ;;
  "")      export DEPLOY_LEVEL=unknown ;;
  *)       export DEPLOY_LEVEL=$CURRENT_BRANCH ;;
esac

case "$CURRENT_BRANCH" in
  master)  export ECS_CLUSTER=aps-alpha ;;
  develop) export ECS_CLUSTER=aps-stg ;;
esac

# Are we going to deploy this C.I. run? If so, we need to tell the build scripts
# to also push the images after building them.
if [[ $CURRENT_BRANCH == *"develop"* ]] || [[ $CURRENT_BRANCH == *"master"* ]]; then
  export PUSH_TO_DOCKER_REGISTRY='true'
fi


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

if [[ $PUSH_TO_DOCKER_REGISTRY == "true" ]]; then
  eval $(aws ecr get-login --no-include-email --region us-east-1) #needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars
fi
