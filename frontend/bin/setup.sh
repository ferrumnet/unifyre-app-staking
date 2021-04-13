#!/bin/bash

if [ "$1" == "unifyre" ]; then
echo Setting up for unifyre
cp ./src/index-unifyre.tsx ./src/index.tsx
exit 0
fi

if [ "$1" == "web3" ]; then
echo Setting up for unifyre
cp ./src/index-web3.tsx ./src/index.tsx
exit 0
fi

if [ "$1" == "bridge" ]; then
echo Setting up for bridge
cp ./src/index-bridge.tsx ./src/index.tsx
exit 0
fi


echo "SYNTAX IS: ./bin/setup.sh unifyre|web3"
exit -1
