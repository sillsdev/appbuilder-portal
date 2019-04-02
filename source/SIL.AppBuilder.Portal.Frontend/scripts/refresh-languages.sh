#!/bin/bash
#
# shell flags
#  -e aborts the script if any subcommand fails
#
#
# Usage:
#
#   ./scripts/refresh-languages.sh
#   yarn webpack:build or yarn start:dev
#
# NOTE: the CWD/PWD should be the frontend folder. not scripts.
set -e

url="https://raw.githubusercontent.com/silnrsi/sldr/master/extras/langtags.json"
folder="./src/public/assets/language/"
tempPath="${folder}langtags.tmp.json"
target1Path="${folder}langtags.json"
target2Path="${folder}specialtags.json"

mkdir -p $folder

if [ ! -f $target1Path ]; then
  echo "downloading all supported languages..."
  wget --output-document $tempPath $url
  node scripts/split-langtags-json.js $tempPath $target1Path $target2Path
  echo "downloaded all supported languages"
else 
  echo "langtags.json has already been downloaded and processed"
fi

function downloadAndConvert {
  local lang=$1
  local fileName=${2:-$1}
  local tmpName="${folder}ldml.tmp.$fileName.json"
  local finalName="${folder}${fileName}/ldml.json"


  if [ ! -f $finalName ]; then
    echo "downloading ldml data for $lang..."

    mkdir -p "${folder}${fileName}"

    wget -qO- "https://ldml.api.sil.org/$lang?inc[0]=localeDisplayNames" | npx fast-xml-parser -o $tmpName

    # TODO: use a custom node script to convert the language
    # list to something more easily consumeable by a javascript app.
    node scripts/clean-up-ldml-json.js $tmpName $finalName

    rm $tmpName
  else
    echo "$fileName has already been downloaded and processed"
  fi
}


downloadAndConvert "es-419"
# TODO: should we rename our en-us translations to en?
#       this would _only_ be because the ldml endpoint does not have an en-us entry
downloadAndConvert "en" "en-US"
downloadAndConvert "fr-FR"
