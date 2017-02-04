#!/bin/bash

# clean release
[[ -d release ]] && rm -rf release
[[ -d node_modules ]] && rm -rf node_modules

# resolve dependencies
yarn

# copy files
mkdir -p release

cp *.js release
cp package.json release

cp -r util release
cp -r check release
cp -r handler release
