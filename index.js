const express = require('express')
const videoStream = require('./videoStream');
const fs = require('fs');
const localtunnel = require('localtunnel');
const Gpio = require('pigpio').Gpio;

const app = express();

PORT = 3000;

const Motor1A = new Gpio(24, {mode: Gpio.OUTPUT}); //Pin 18
const Motor1B = new Gpio(23, {mode: Gpio.OUTPUT}); //Pin 16
const Motor1E = new Gpio(18, {mode: Gpio.OUTPUT}); //Pin 12

const Motor_ST = new Gpio(10, {mode: Gpio.OUTPUT}); //Pin 19

const Brake_Motor = new Gpio(9, {mode: Gpio.OUTPUT}); //Pin 21

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
    tunnel.on('close', () => {});
})();

videoStream.acceptConnections(app, {
    width: 640,
    height: 480,
    fps: 24,
    encoding: 'JPEG',
    quality: 6 //lower is faster
}, '/stream.mjpg', false);

function throttle(val){
  VEHICLE.throttle_pct = val.v;
}

function brake(val){
  VEHICLE.brake_pct = val.v;
}

function steering(val){
  VEHICLE.steering_ang = val.v;
}

io.on('connection', (socket) => {
    console.log(socket.id,' connected');

    socket.on('th', (value)=>{throttle(value);});

    socket.on('br', (value)=>{brake(value);});

    socket.on('st', (value)=>{steering(value);});

    socket.on('disconnect', () => {
        console.log(socket.id,' disconnected');
    });
});

function scale (number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}


function main(){

  Motor_ST.servoWrite(Math.round(scale(VEHICLE.steering_ang, -1, 1, 900, 2100)) >> 0);

  Brake_Motor.servoWrite(Math.round(scale(VEHICLE.brake_pct, 0, 100, 500, 2500)) >> 0);

  if(VEHICLE.throttle_pct>45){
    Motor1A.digitalWrite(1);
    Motor1B.digitalWrite(0);
  }
  else{
    Motor1A.digitalWrite(0);
    Motor1B.digitalWrite(0);
  }
  let speed = Math.round((VEHICLE.throttle_pct/100)*255 >> 0);
  Motor1E.pwmWrite(speed);
}