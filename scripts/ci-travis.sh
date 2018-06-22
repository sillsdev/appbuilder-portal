#!/bin/bash
# https://github.com/sagikazarmark/travis-monorepo-demo

# for testing CI, comment out all the conditions and messaging
./run test:ui:ci


# echo "============================================"
# if .travis/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then
#     echo "$PROJECT is being built";
#     echo ""
#
#     if [[ $PROJECT = *"Frontend" ]]; then
#         ./run test:ui:ci
#     else
#         echo "Only the frontend project is configured for contiuous testing"
#     fi
# else
#     echo "$PROJECT is NOT being built because no changes were detected.";
#     echo ""
# fi
