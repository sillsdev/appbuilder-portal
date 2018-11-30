#!/bin/bash
#
# Usage:
#
#   yarn webpack:build
#   ./scripts/analyze.sh
#   yarn webpack:analyze
set -ex

mkdir -p ./dist

OUTPUT_FILE=dist/stats.json

NODE_ENV=production ./node_modules/.bin/webpack-cli \
  --env production \
  --profile \
  --json > dist/stats-temp.json

iconv --to-code UTF-8 --output $OUTPUT_FILE dist/stats-temp.json


