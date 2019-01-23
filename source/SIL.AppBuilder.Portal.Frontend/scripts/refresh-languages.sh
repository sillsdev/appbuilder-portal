#!/bin/bash
#
# Usage:
#
#   ./scripts/refresh-languages.sh
#   yarn webpack:build or yarn start:dev
url="https://raw.githubusercontent.com/silnrsi/sldr/master/extras/alltags.json"
folder="./src/public/assets/language/"
targetPath="${folder}alltags.json"

mkdir -p $filder

wget --output-document $targetPath $url