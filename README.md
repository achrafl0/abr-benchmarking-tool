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
  1. Install the right [Toxiproxy](https://github.com/Shopify/toxiproxy)
     binaries (server and CLI) for your system and move it to
     `./cdn-video-server/toxiproxy-server`.
  2. Install dependencies for every projects in this repository.

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

    Here is a full example of a JSON that can be posted to `/toxics`.
    ```js
    // Array containing each "toxic"
    [
      // Object defining a single toxic
      {
        // The "type" of toxic. For now can be either "bandwidth" or "latency"
        type: "bandwidth",

        // Whether it affects the upload direction (`"upstream"`) or the
        // download direction (`"downstream"`).
        // Set to `"downstream"` if not defined.
        stream: "downstream",

        // The "toxicity", which is a number between 0 and 1 indicating the
        // chance that this toxic configuration is applied.
        //
        // This is totally optional and set to `1` (meaning the configuration is
        // always applied) by default.
        toxicity: 1,

        // Attributes linked to this toxic's type (in this case, "bandwidth")
        attributes: {
          // The bandwidth wanted, in kilobits per seconds.
          rate: 1000,
        },
      },

      // Let's also define a "latency" toxic
      {
        type: "latency",
        stream: "downstream",
        toxicity: 1,
        attributes: {
          // The network latency, in milliseconds
          latency: 300,

          // Delta applied randomly to the latency to produce the actual latency.
          // In this way, the actual latency is equal to `latency +/- jitter`.
          jitter: 100,
        }
      }
    ]
    ```

  - `/report`: allows to export a report of metrics and save it.
    The point is to be able to later retrieve a test's output for analysis in
    the client.

    You should perform a POST request on that route with a JSON taking the
    following format:

    ```js
    {
      // The directory the tests will be in.
      // The path can be of any depth, as long as it doesn't go through parent
      // directories.
      directory: "my-reports/current-tests",

      // The filename of the corresponding test.
      name: "test-A.json

      // The report data in the format preferred by the client
      data: {
        //...
      }
    }
    ```

### The client

The client is written in the usual HTTP/CSS/JavaScript combo an is in the
`./player-tester` directory.
It can be run through the `./start_client.sh` script.

It's role is to run tests "scenarios" and collect various metrics while doing
so, that should be displayed in a chart.
It can also be used to export those metrics for later analysis (by using the
server's features).
