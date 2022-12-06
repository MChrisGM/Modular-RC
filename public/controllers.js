var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame;

var controller_options = {};
var cont_select_el;
var GamePad;

function throttle(value){
    console.log('Throttle: ',value);
    socket.emit("th", { v: value });
}
function brake(value){
    console.log('Brake: ',value);
    socket.emit("br", { v: value });
}
function steering(value){
    console.log('Steering: ',value);
    socket.emit("st", { v: value });
}

const bind_map = {
    "steer":steering,
    "throttle":throttle,
    "brake":brake
};

function selectController(){
    GamePad = new Pad(controllers[cont_select_el.value], 0.1);
}

async function bindAction(){
    console.log('Ready to bind');
    const bind_selection = document.getElementById("binds").value;
    let b = await GamePad.getFirstInput();
    await GamePad.bind(b, function(value){
        bind_map[bind_selection](value);
    });
}

function connecthandler(e) {
    addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    rAF(updateStatus);
}

function disconnecthandler(e) {
    removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
    delete controllers[gamepad.index];
}

function updateStatus() {
    scangamepads();
    for (j in controllers) {
        var controller = controllers[j];
        controller_options[controller.index] = document.createElement('option');
        controller_options[controller.index].value = controller.index;
        controller_options[controller.index].innerHTML = controller.id;        
    }
    for (i in controller_options) {
        var values = Array.from(cont_select_el.options).map(e => e.value);
        if(!values.includes(i)){
            cont_select_el.appendChild(controller_options[i]);
        }
    }
    rAF(updateStatus);
}

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && (gamepads[i].index in controllers)) {
            controllers[gamepads[i].index] = gamepads[i];
        }
    }
}

window.onload = function () {
    controller_options = {};
    cont_select_el = document.getElementById("controllers");
    if (haveEvents) {
        window.addEventListener("gamepadconnected", connecthandler);
        window.addEventListener("gamepaddisconnected", disconnecthandler);
    } else if (haveWebkitEvents) {
        window.addEventListener("webkitgamepadconnected", connecthandler);
        window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
    } else {
        setInterval(scangamepads, 500);
    }
    setInterval(function(){
        if(GamePad && GamePad.exists()){
            GamePad.update(controllers[cont_select_el.value]);
            GamePad.runInputs();
        }
    },100);
}
