#!/bin/bash


cd ./cdn-video-server
./toxiproxy-server &
npm run start:dev
