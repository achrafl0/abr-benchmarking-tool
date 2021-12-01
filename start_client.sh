#!/bin/bash

trap_kill() {
  kill $bundler_pid
  kill $chrome_pid
}
trap trap_kill INT TERM

cd ./player-tester
npm run build &
bundler_pid=$!

google-chrome-stable --disk-cache-dir=/dev/null --media-cache-size=1 --autoplay-policy=no-user-gesture-required http://localhost:1234/ > /dev/null 2>&1 &
chrome_pid=$!

sleep infinity
