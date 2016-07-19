#!/bin/bash

KEYFILE="$TRAVIS_BUILD_DIR/keys/deploy_key"

#Generate a key in needed that will be store in cache (and to be haded to github)
if [ ! -f $KEYFILE ]; then
		echo "Generate key ..."
    ssh-keygen -t rsa -b 4096 -C "$COMMIT_AUTHOR_EMAIL"  -N "$TMPPASS" -f $KEYFILE
fi
cat "$KEYFILE.pub"

echo "Start building ..."

#TODO ^^

echo "Finished build !"

