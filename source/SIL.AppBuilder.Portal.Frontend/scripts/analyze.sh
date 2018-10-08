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
  --json > $OUTPUT_FILE

