const express = require('express')
const app = express()
const videoStream = require('raspberrypi-node-camera-web-streamer');


const localtunnel = require('localtunnel');


PORT = 3000;

(async () => {
  const tunnel = await localtunnel({ PORT: 3000, subdomain:'f1rc' });

  console.log(tunnel.url);

  tunnel.on('close', () => {
    // tunnels are closed
  });
})();

videoStream.acceptConnections(app, {
    width: 1920,
    height: 1080,
    fps: 30,
    encoding: 'JPEG',
    quality: 4 //lower is faster
}, '/stream.mjpg', false);

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));