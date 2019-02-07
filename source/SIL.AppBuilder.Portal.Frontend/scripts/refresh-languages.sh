#!/bin/bash
#
# Usage:
#
#   ./scripts/refresh-languages.sh
#   yarn webpack:build or yarn start:dev
url="https://raw.githubusercontent.com/silnrsi/sldr/master/extras/alltags.json"
folder="./src/public/assets/language/"
targetPath="${folder}alltags.json"

mkdir -p $folder

echo "downloading all supported languages..."
wget --output-document $targetPath $url
echo "downloaded all supported languages"

echo "downloading transaltion support for the language data..."
npm install -g fast-xml-parser

function downloadAndConvert {
  local lang=$1
  local fileName=${2:-$1}


  wget -qO- "https://ldml.api.sil.org/$lang?inc[0]=localeDisplayNames" | xml2js -o "$folder/ldml.tmp.$fileName.json"

  # TODO: use a custom node script to convert the language 
  # list to something more easily consumeable by a javascript app.
}

downloadAndConvert "es-419"
downloadAndConvert "en" "en-us"
downloadAndConvert "fr-FR"

ls -la $folder