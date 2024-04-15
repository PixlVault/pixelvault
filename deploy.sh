#!/bin/bash

set -e

ROOTDIR=/root/dev/pixelvault
FRONTEND_DIR=$ROOTDIR/frontend
BACKEND_DIR=$ROOTDIR/backend
BRANCH=main

echo Using branch: $BRANCH

cd $ROOTDIR
git pull origin $BRANCH
git checkout $BRANCH

service mysql restart

export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh

cd $FRONTEND_DIR
$(which npm) install
$(which npm) run build

cd $BACKEND_DIR
$(which npm) install

! $(which pm2) delete pixelvault
$(which pm2) start index.js --name pixelvault

