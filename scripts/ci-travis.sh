#!/bin/bash
# https://github.com/sagikazarmark/travis-monorepo-demo

# for testing CI, comment out all the conditions and messaging
# ./run ci:lint:ui
# ./run ci:test:ui
#
# running locally....
#
# FORCE=true PROJECT=source/SIL.AppBuilder.Portal.Frontend ./scripts/ci-travis.sh


echo "============================================"
if [.travis/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT] || [ "$FORCE" = 'true' ]; then
    echo "$PROJECT is being built";
    echo ""

    if [[ $PROJECT = *"Frontend" ]]; then
        # TODO: eventually, linting should be required to pass
        time ./run dc build
        ( time ./run ci:lint:ui ) && ( time ./run yarn ) && ( ./run yarn test:ci )
    else
        echo "Only the frontend project is configured for contiuous testing"
    fi
else
    echo "$PROJECT is NOT being built because no changes were detected.";
    echo ""
fi
