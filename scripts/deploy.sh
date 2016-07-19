#!/bin/bash
#Based on : https://gist.github.com/domenic/ec8b0fc8ab45f39403dd

set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="enhance-27" #TODO switch to master
TARGET_BRANCH="gh-pages"
COMMIT_AUTHOR_EMAIL="travis@nobody.fr"
KEYFILE="$TRAVIS_BUILD_DIR/keys/deploy_key"

cat "$KEYFILE.pub"

#Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy of gh-pages."
    exit 0
fi

echo "Getting in build space ..."

cd build
# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add --all .
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git commit -m "Deploy to GitHub Pages: ${TRAVIS_COMMIT}" || echo "nothing to commit"

eval `ssh-agent -s`
#echo "$TMPPASS" | ssh-add -p $KEYFILE
expect << EOF
  spawn ssh-add $KEYFILE
  expect "Enter passphrase"
  send "$TMPPASS\r"
  expect eof
EOF
# Now that we're all set up, we can push.
git push git@github.com:adentes-org/sofia-admin-app.git $TARGET_BRANCH  || echo "git push to gh-pages error"

echo "Finished deploy !"

cd .. #Quitting buil folder
