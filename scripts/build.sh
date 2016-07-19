#!/bin/bash

KEYFILE="$TRAVIS_BUILD_DIR/keys/deploy_key"

#Generate a key in needed that will be store in cache (and to be haded to github)
if [ ! -f $KEYFILE ]; then
		echo "Generate key ..."
    ssh-keygen -t rsa -b 4096 -C "$COMMIT_AUTHOR_EMAIL"  -N "$TMPPASS" -f $KEYFILE
		chmod 600 $KEYFILE
fi
cat "$KEYFILE.pub"

git clone https://github.com/adentes-org/sofia-admin-app.git build && cd build && git checkout gh-pages

echo "Start building ..."

rm -Rf assets && cp -R ../assets assets #Cloning assets in it

echo "Cleaning build space ..."
shopt -s extglob
rm -Rf !(assets|README.md|index.html) .travis.yml .editorconfig

echo "Finished build !"

cd .. #Quitting buil folder
