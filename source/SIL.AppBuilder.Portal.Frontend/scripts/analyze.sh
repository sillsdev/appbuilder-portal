#!/bin/bash

set -e

CMD_OUTPUT_FILE=stats-tmp.json
TMP_FILE=stats-tmp.tmp.json
OUTPUT_FILE=dist/stats.json

NODE_ENV=production yarn webpack --env production --profile --json > $CMD_OUTPUT_FILE

# file format is
# yarn run vx.y.z
# ./node_modules/.bin/webpack-cli --env production --profile --json
#
# < actual file content >
#
# Done in a.b seconds

# remove last line
head -n -1 $CMD_OUTPUT_FILE > $TMP_FILE
tail -n +3 $TMP_FILE > $OUTPUT_FILE

rm $CMD_OUTPUT_FILE
rm $TMP_FILE
