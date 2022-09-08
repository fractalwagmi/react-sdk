#!/bin/sh

export SDK_VERSION=$(node --eval="process.stdout.write(require('./package.json').version)")

npx replace-env dist/esm/config/build-variables.js
npx replace-env dist/cjs/config/build-variables.js