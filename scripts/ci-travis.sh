#!/bin/bash
# https://github.com/sagikazarmark/travis-monorepo-demo

if .travis/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then 
    echo "$PROJECT is being built";

    if [[ $PROJECT = *"Frontend" ]]; then
        ./run yarn test:ci
    else
        echo "Only the frontend project is configured for contiuous testing"
    fi
else
    echo "$PROJECT is NOT being built";
fi

