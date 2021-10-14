# ABR Benchmarking Tool

## Prerequisite and launching

- Install [toxiproxy](https://github.com/Shopify/toxiproxy#usage)
- Copy the repo
- Install the dependency of the cdn server `cd cdn-video-server && npm install`
- Download the assets using the commands below :
- `cd cdn-video-server`
- `mkdir static && mkdir ./static/videos && cd ./static/videos`
- `wget -r -np -nH --cut-dirs=2 -R index.html http://ftp.itec.aau.at/datasets/DASHDataset2014/`
- Run toxiproxy's server `toxiproxy-server`
- Launch the server `cd cdn-video-server && npm run start:dev` and make sure that toxiproxy-client is correctly running in the logs 
-  Serve the demo player located in `/player-tester/index.html` using a simple HTTP server ( for example, python's `simplehttpserver` by using `python3 -m http.server` for example inside the `player-tester` folder ) 
## Usage
### Choosing a scenario
- Choose a scenario by making a POST query `http://localhost:5000/scenario/:scenario-id` via `curl`/`wget`/`POSTMAN`/...
- All the scenarios are described in `cdn-video-server/src/scenarios.ts`

## More info
- *5000* : Port of the backend and the video server
- *5001* : Port of the proxy used on the backend server that add network disturbances




