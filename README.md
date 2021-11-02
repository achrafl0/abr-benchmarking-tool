# ABR Benchmarking Tool

## Overview

This tool allows to compare and benchmark the adaptive capabilities of media
players for the web, by serving media contents while faking poorer network
conditions and monitoring the media player's adaptive performance while doing
so.

It was started as a tool to improve on Canal+'s media player, the
[RxPlayer](https://github.com/canalplus/rx-player), yet has generic-enough
interfaces to be able to instrument and benchmark any media player built for the
web.

This project is still under heavy development.


## Setup

For a fast and easy setup, you can just run the `setup.sh` shell script at the
root of this project.

It will:
  1. Install the right [Toxiproxy](https://github.com/Shopify/toxiproxy) binary
     for your system and move it to `./cdn-video-server/toxiproxy-server`
  2. Install dependencies for every projects in this repository

You can also perform those tasks manually if you prefer.


## Usage

This tool is divided in two:

  1. The server, which will serve contents and rely on Toxiproxy to simulate
     poor network conditions.

     This server is both able to serve content stored locally (with the
     advantage of better network bandwidth and latency control) or act as a
     proxy to another URL.

  2. The client, running "scenarios" on a given media player which play those
    contents and monitor several variables, like the current video quality and
    the buffer health.


### The server

The server is written in nodejs in the `./cdn-video-server` directory.
It can be run through the `./start_server.sh` script.

It has the following features:

  - It is able to serve local contents stored, in
    `./cdn-video-server/static/videos`, through an HTTP port.

  - It can also act as a proxy through the same port

  - It uses Toxiproxy to expose another HTTP port with poor network conditions 
    (like a poor bandwidth or a high latency), to the same routes.

  - It exposes a route allowing to configure the network conditions simulated.

So there's basically two ports exposed:

  - `5001`: Port to this server on which poor network conditions are simulated
    by Toxiproxy. This is the port usually used by a client to request contents,
    so real-world bad network conditions can be simulated locally.

  - `5000`: Port to this server unaffected by the bad network conditions.
    This port is usually used to configure network conditions.

The following URLs are accessible through this server:

  - `/videos` exposes the `./cdn-video-server/static/videos` directory though an
    express static file server.

  - `/proxy` exposes a proxy.
    To access for example `https://www.example.com` through the erver you can
    request `/proxy/https://www.example.com`.

  - `/toxics` allows to configure Toxiproxy.
    You can update network conditions by posting JSON through the HTTP `POST`
    on this route.

    Here is a full example of how you can configure Toxiproxy:
    ```js
    {
      // Optional bandwidth configuration.
      // No bandwidth restriction will be applied if this key is not present.
      "bandwidth": {
        // The bandwidth wanted, in kilobits per seconds.
        rate: 1000,

        // The "toxicity", which is a number between 0 and 1 indicating the
        // chance that this bandwidth configuration is applied.
        //
        // This is totally optional and set to `1` by default (meaning the
        // configuration is always applied).
        // You usually don't want to modify this value.
        toxicity: 1
      },

      // Optional latency configuration.
      // No bandwidth restriction will be applied if this key is not present.
      "latency": {
        // The network latency, in milliseconds
        latency: 300,

        // Delta applied randomly to the latency to produce the actual latency.
        // In this way, the actual latency is equal to `latency +/- jitter`.
        jitter: 100,

        // The "toxicity", which is a number between 0 and 1 indicating the
        // chance that this latency configuration is applied.
        //
        // This is totally optional and set to `1` by default (meaning the
        // configuration is always applied).
        // You usually don't want to modify this value.
        toxicity: 1
      }
    }
    ```

  - `/bandwidth` allows to fetch the current network conditions applied.
    The format is the same one than what is posted to `/toxics`.

### The client

The client is written in the usual HTTP/CSS/JavaScript combo an is in the
`./player-tester` directory.
It can be run by going into the directory and calling `npm run build`.

It's role is to run "scenarios" (written in `./player-tester/src/scenarios`)
while monitoring multiple playback metrics to then display a chart of a player's
