#!/usr/bin/env bash

npm run pub

yarn publish --non-interactive

for i in {1..3}
do
cnpm sync fano-react
done
