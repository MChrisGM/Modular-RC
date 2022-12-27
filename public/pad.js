const BUTTON = "btn";
const AXIS = "axs";

class Pad {
    constructor(gamepad, deadzone) {
        this.gamepad = gamepad;
        this.binds = { [BUTTON]: {}, [AXIS]: {} };
        this.deadzone = deadzone;
        this.binded = {[BUTTON]: [] , [AXIS]: []};
    }
    update(gamepad) {
        this.gamepad = gamepad;
    }
    exists() {
        if (this.gamepad != null) {
            return true;
        } else {
            return false;
        }
    }
    async getFirstInput() {
        let gotInput = false;
        let btn_id = null;
        let axis_id = null;

        let self = this;

        let promise = new Promise(function (resolve, reject) {
            setInterval(function () {
                for (var i = 0; i < self.gamepad.buttons.length; i++) {
                    if (!gotInput) {
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
                        if (pressed) {
                            if(!self.binded[BUTTON].includes(i)){
                                gotInput = true;
                                btn_id = i;
                                self.binded[BUTTON].push(i);
                                resolve({ type: BUTTON, id: btn_id });
                                break;
                            }
                        }
                    }
                }
                for (var i = 0; i < self.gamepad.axes.length; i++) {
                    if (!gotInput) {
                        if(!self.binded[AXIS].includes(i)){
                            if (Math.abs(self.gamepad.axes[i]) > 0.9) {
                                gotInput = true;
                                axis_id = i
                                self.binded[AXIS].push(i);
                                resolve({ type: AXIS, id: axis_id });
                                break;
                            }
                        }
                    }
                }
            }, 100)
        });
        return await promise;
    }

    async bind(b, callback) {
        console.log("Binding button: ", b);
        this.binds[b.type][b.id] = callback;
    }
    runInputs() {
        for (i in this.binds[BUTTON]) {
            var val = this.gamepad.buttons[i];
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
                this.binds[BUTTON][i](pct);
            }else{
                this.binds[BUTTON][i](0);
            }
        }
        for (i in this.binds[AXIS]) {
            if (Math.abs(this.gamepad.axes[i]) > this.deadzone) {
                this.binds[AXIS][i](this.gamepad.axes[i]);
            }else{
                this.binds[AXIS][i](0);
            }
        }
    }
}