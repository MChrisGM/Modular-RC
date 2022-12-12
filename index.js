const express = require('express')
const videoStream = require('./videoStream');
const fs = require('fs');
const localtunnel = require('localtunnel');

const app = express();

PORT = 3000;

let VEHICLE = {
  throttle_pct: 0,
  brake_pct: 0,
  steering_ang:0
};

app.use(express.static(__dirname + '/public'));

var server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
  
});

var io = require('socket.io')(server);

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

function throttle(val){
  if(val != VEHICLE.throttle_pct){
    console.log("Throttle: ",val);
  }
  VEHICLE.throttle_pct = val;
}

function brake(val){
  if(val != VEHICLE.brake_pct){
    console.log("Brake: ",val);
  }
  VEHICLE.brake_pct = val;
}

function steering(val){
  if(val != VEHICLE.steering_ang){
    console.log("Steering angle: ",val);
  }
  VEHICLE.steering_ang = val;
}

io.on('connection', (socket) => {
    console.log(socket.id,' connected');

    socket.on('th', (value)=>{
        throttle(value);
    });

    socket.on('br', (value)=>{
        brake(value);
    });

    socket.on('st', (value)=>{
        steering(value);
    });

    socket.on('disconnect', () => {
        console.log(socket.id,' disconnected');
    });
});