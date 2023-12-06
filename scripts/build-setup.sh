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
#    ./scripts/build-api.sh $TRAVIS_COMMIT $TRAVIS_BRANCH $TRAVIS_EVENT_TYPE
#    ./scripts/build-nginx.sh $TRAVIS_COMMIT $TRAVIS_BRANCH $TRAVIS_EVENT_TYPE
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
  export BUILD_TYPE=local
else
  export CURRENT_VERSION=$1
  export CURRENT_BRANCH=${2/refs\/heads\//}
  export BUILD_TYPE=$3
fi

echo "Starting Build for Commit: $CURRENT_VERSION"
echo "on branch: $CURRENT_BRANCH"

export DEPLOY_LEVEL=staging
case "$CURRENT_BRANCH" in
  master)  export DEPLOY_LEVEL=production ;;
  develop) export DEPLOY_LEVEL=staging ;;
  "")      export DEPLOY_LEVEL=unknown ;;
  *)       export DEPLOY_LEVEL=$CURRENT_BRANCH ;;
esac

case "$CURRENT_BRANCH" in
  master)  export ECS_CLUSTER=scriptoria-prd ;;
  develop) export ECS_CLUSTER=scriptoria-stg ;;
esac

# Are we going to deploy this C.I. run? If so, we need to tell the build scripts
# to also push the images after building them.
if [[ "$BUILD_TYPE" != "local" ]] && [[ "$BUILD_TYPE" != "pull_request" ]]; then
  if [[ $CURRENT_BRANCH == *"develop"* ]] || [[ $CURRENT_BRANCH == *"master"* ]] || [[ $CURRENT_BRANCH == *"github-actions"* ]]; then
    export PUSH_TO_DOCKER_REGISTRY='true'
  fi
fi


docker --version # document the version travis is using

if [ `builtin type -p jq` ]; then
  echo "System already has jq";
else
  sudo apt-get install -y jq
fi
which jq && jq --version


mkdir -p $HOME/.local/bin
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
