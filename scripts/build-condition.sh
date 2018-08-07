#!/bin/bash

function detectChanges {
  if [[ -z $1 ]]; then
      # echo "Commit range cannot be empty"
      # exit 1
      echo "1"
  fi

  if [[ -z $2 ]]; then
      # echo "Change path cannot be empty"
      # exit 1
      echo "2"
  fi

  git diff --name-only $1 | sort -u | uniq | grep $2 > /dev/null
}
