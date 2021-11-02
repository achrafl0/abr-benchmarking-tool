#!/bin/bash


ask_for_manual_toxiproxy_install() {
  printf "You will need to install toxiproxy manually.\n\
Go to https://github.com/Shopify/toxiproxy#usage, choose \
the right installation option for your system and install it, or a \
symbolic link to \"./cdn-video-server/toxiproxy-server\".\n"
  read -p "When done, press enter to continue.";
}

if ! command -v npm &> /dev/null
then
  echo "You need to install npm first and add it to your path."
  exit 1
fi

echo "Downloading Toxiproxy server..."
if ! command -v wget &> /dev/null
then
  ask_for_manual_toxiproxy_install
else
  PS3='Select your operating system / choice: '
  options=(
    "MacOS x86-64"
    "MacOS ARM64"
    "Linux x86-64"
    "Linux ARM"
    "Windows x86-64"
    "Other"
    "Skip Toxiproxy installation"
    "Quit"
  )
  select opt in "${options[@]}"
  do
    echo ""
    case $opt in
      "MacOS x86-64")
        wget https://github.com/Shopify/toxiproxy/releases/download/v2.2.0/toxiproxy-server-darwin-amd64 -O ./cdn-video-server/toxiproxy-server
        chmod +x ./cdn-video-server/toxiproxy-server
        break
        ;;
      "MacOS ARM64")
        wget https://github.com/Shopify/toxiproxy/releases/download/v2.2.0/toxiproxy-server-darwin-arm64 -O ./cdn-video-server/toxiproxy-server
        chmod +x ./cdn-video-server/toxiproxy-server
        break
        ;;
      "Linux x86-64")
        wget https://github.com/Shopify/toxiproxy/releases/download/v2.2.0/toxiproxy-server-linux-amd64 -O ./cdn-video-server/toxiproxy-server
        chmod +x ./cdn-video-server/toxiproxy-server
        break
        ;;
      "Linux ARM64")
        wget https://github.com/Shopify/toxiproxy/releases/download/v2.2.0/toxiproxy-server-linux-arm64 -O ./cdn-video-server/toxiproxy-server
        chmod +x ./cdn-video-server/toxiproxy-server
        break
        ;;
      "Windows x86-64")
        wget https://github.com/Shopify/toxiproxy/releases/download/v2.2.0/toxiproxy-server-windows-amd64.exe -O ./cdn-video-server/toxiproxy-server
        chmod +x ./cdn-video-server/toxiproxy-server
        break
        ;;
      "Other")
        ask_for_manual_toxiproxy_install
        break
        ;;
      "Skip Toxiproxy installation")
        break
        ;;
      "Quit")
        exit 0
        break
        ;;
      *) echo "invalid option $REPLY";;
    esac
  done
fi

echo "Installing server dependencies..."
cd ./cdn-video-server
npm install
cd ..

echo "Installing client dependencies..."
cd ./player-tester
npm install
cd ..

echo "Creating directory for local contents..."
mkdir -p ./cdn-video-server/static/videos
echo "done"
