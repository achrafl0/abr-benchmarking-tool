#!/bin/bash

cd ./cdn-video-server
./toxiproxy-server &
pid=$!
trap "kill $pid" INT TERM
npm run start:dev
