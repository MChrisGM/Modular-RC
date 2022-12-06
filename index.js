const express = require('express')
const videoStream = require('./videoStream');
const fs = require('fs');
const localtunnel = require('localtunnel');

const { Server } = require("socket.io");
const io = new Server(server);

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

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('th', (value)=>{
        console.log("Throttle: ",value);
    });

    socket.on('br', (value)=>{
        console.log("Brake: ",value);
    });

    socket.on('st', (value)=>{
        console.log("Steering: ",value);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});