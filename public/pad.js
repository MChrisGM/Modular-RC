class Pad{
    constructor(gamepad){
        self.gamepad = gamepad;
        self.binds = {};
        self.deadzone = 0.01;
    }
    update(gamepad){
        self.gamepad = gamepad;
    }
    exists(){
        if(self.gamepad != null){
            return true;
        }else{
            return false;
        }
    }
    bind(input_element, callback){
        self.binds[input_element] = callback;
    }
    updateInputs(){
        for (var i = 0; i < self.gamepad.buttons.length; i++) {
            var val = self.gamepad.buttons[i];
            var pressed = val == 1.0;
            var touched = false;
            if (typeof (val) == "object") {
                pressed = val.pressed;
                if ('touched' in val) {
                    touched = val.touched;
                }
                val = val.value;
            }
            var pct = Math.round(val * 100);
            if (pressed) {
                console.log(i,pct+ "%");
            }
        }
        for (var i = 0; i < self.gamepad.axes.length; i++) {
            //   var a = axes[i];
            //   a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
            //   a.setAttribute("value", controller.axes[i]);
        }
    }
}