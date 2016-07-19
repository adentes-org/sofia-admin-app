#!/bin/bash
#Based on : https://gist.github.com/domenic/ec8b0fc8ab45f39403dd

set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="enhance-27" #TODO switch to master
TARGET_BRANCH="gh-pages"
COMMIT_AUTHOR_EMAIL="travis@nobody.fr"
KEYFILE="$TRAVIS_BUILD_DIR/keys/deploy_key"

#Generate a key in needed that will be store in cache (and to be haded to github)
if [ ! -f $KEYFILE ]; then
    ssh-keygen -t rsa -b 4096 -C "$COMMIT_AUTHOR_EMAIL"  -N "$TMPPASS" -f $KEYFILE
fi
cat "$KEYFILE.pub"

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy of gh-pages."
    exit 0
fi

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"


echo "Cleaning build space ..."
shopt -s extglob
rm -Rf !(dist) !(README.md)
ls -lah dist

#TODO push dist folder if any changed detected
#checkout do gh-pages, commit and push
