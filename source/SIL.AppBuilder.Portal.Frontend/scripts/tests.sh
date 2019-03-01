#!/bin/bash
#
# shell flags
#  -e aborts the script if any subcommand fails
#  -a exposes exported variables to subshells

set -ea
echo "skip: $SKIP_LANGUAGES";
if [[ -z "${SKIP_LANGUAGES}" ]]; then
  ./scripts/refresh-languages.sh
else
  echo "Skipping language refresh"
fi


export CI=true
export REVISION=$(git rev-parse HEAD)
export BUILD_DATE=$(date)
# export COVERAGE=true

yarn karma:start --single-run | tee test.results

# the output file will contain a block of test that looks like this
# SUMMARY: 
# ✔ 285 tests completed 
# ℹ 24 tests skipped 
# ✖ 3 tests failed
completed_tests=$(cat test.results | grep " tests completed" | cut -d " " -f2)

# This is kind of a hack, but for now it'll work as C.I. is passing with only 77 tests ran.
# and ... that's only a third of the suite at the time of writing this...
if [ "$completed_tests" -lt "288" ]; then
  echo "the entire test suite didn't run. Something is very wrong"
  exit 1
fi