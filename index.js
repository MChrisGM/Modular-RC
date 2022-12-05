const express = require('express')
const videoStream = require('./videoStream');
const fs = require('fs');
const localtunnel = require('localtunnel');

const app = express();

PORT = 3000;

(async () => {
  const tunnel = await localtunnel(PORT, { subdomain: 'cuf1rc' });
  console.log(tunnel.url);
  tunnel.on('close', () => {
    // tunnels are closed
  });
})();

videoStream.acceptConnections(app, {
  width: 640,
  height: 480,
  fps: 24,
  encoding: 'JPEG',
  quality: 6 //lower is faster
}, '/stream.mjpg', false);


app.use(express.static(__dirname + '/public'));
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));