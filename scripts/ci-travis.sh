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
echo "pwd: $(pwd)"
source ./scripts/build-condition.sh

detected="$(detectChanges $TRAVIS_COMMIT_RANGE $PROJECT)"

if [ "$detected" = "1" ] || [ "$detected" = "2" ]; then
  changesExist="failed"
else
  changesExist="success"
fi

echo "changes result: $changesExist"

if [ "$changesExist" = "success" ] || [ "$FORCE" = 'true' ]; then

    echo "Project: '$PROJECT' is being built";
    echo ""

    echo "building docker containers..."
    time ( ./run ci:build > /dev/null 2>&1 )
    echo "docker containers built!"

    if [[ $PROJECT = *"Frontend" ]] || [ "$BOTH" = 'true' ]; then
        echo "Running the frontend commands..."

        ( time ./run ci:ui )

        frontendResult=$?
    fi

    if [[ $PROJECT != *"Frontend" ]] || [ "$BOTH" = 'true' ]; then
        echo "Running the backend commands..."

        ( time ./run ci:api )

        backendResult=$?
    fi

    echo ""
    echo "-------------------------------------------"
    echo "Frontend CI finished with status: $frontendResult"
    echo "Backend CI finished with status: $backendResult"
    echo "-------------------------------------------"
    echo ""

    if [ $frontendResult -ne 0 ] || [ $backendResult -ne 0 ]; then
      exit 1
    fi
else
    echo "$PROJECT is NOT being built because no changes were detected.";

    echo ""
fi
