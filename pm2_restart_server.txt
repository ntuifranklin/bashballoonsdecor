#!/bin/bash
# accepts on command line name of pm2 status to run
# that identifies the appclustering.js, app.js, or main.js file in the root
# directory of the app.
processName="$1"
pm2 stop $processName
pm2 delete $processName

# clear npm cache for clean slate
npm cache clear --force
npm install .

source ./.env
pm2 start ./appclustering.js --name $processName --watch
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u alke --hp /home/alke
pm2 save
