const express = require('express')
const videoStream = require('./videoStream');
const fs = require('fs');
const localtunnel = require('localtunnel');
var piblaster = require('pi-servo-blaster.js');
const Gpio = require('pigpio').Gpio;

const app = express();

PORT = 3000;

const Motor1A = new Gpio(24, {mode: Gpio.OUTPUT}); //Pin 18
const Motor1B = new Gpio(23, {mode: Gpio.OUTPUT}); //Pin 16
const Motor1E = new Gpio(25, {mode: Gpio.OUTPUT}); //Pin 22

const ServoPin = "P1-11";

let VEHICLE = {
  throttle_pct: 0,
  brake_pct: 0,
  steering_ang:0
};

app.use(express.static(__dirname + '/public'));

var server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
  setInterval(function(){main()}, 10);
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
  if(val.v != VEHICLE.throttle_pct){
    console.log("Throttle: ",val.v);
  }
  VEHICLE.throttle_pct = val.v;
}

function brake(val){
  if(val.v != VEHICLE.brake_pct){
    console.log("Brake: ",val.v);
  }
  VEHICLE.brake_pct = val.v;
}

function steering(val){
  if(val.v != VEHICLE.steering_ang){
    console.log("Steering angle: ",val.v);
  }
  VEHICLE.steering_ang = val.v;
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

function scale (number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}


function main(){
  
  piblaster.setServoPwm(ServoPin, scale(VEHICLE.steering_ang,-1,1,0,100) + "%");

  Motor1A.digitalWrite(1);
  Motor1B.digitalWrite(0);
  Motor1E.digitalWrite(1);

  Motor1E.pwmWrite(255*VEHICLE.throttle_pct);

}