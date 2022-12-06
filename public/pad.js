const BUTTON = "btn";
const AXIS = "axs";

class Pad {
    constructor(gamepad, deadzone) {
        self.gamepad = gamepad;
        self.binds = { [BUTTON]: {}, [AXIS]: {} };
        self.deadzone = deadzone;
    }
    update(gamepad) {
        self.gamepad = gamepad;
    }
    exists() {
        if (self.gamepad != null) {
            return true;
        } else {
            return false;
        }
    }
    async getFirstInput() {
        let gotInput = false;
        let btn_id = null;
        let axis_id = null;

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
                            gotInput = true;
                            btn_id = i;
                            resolve({ type: BUTTON, id: btn_id });
                            break;
                        }
                    }
                }
                for (var i = 0; i < self.gamepad.axes.length; i++) {
                    if (!gotInput) {
                        if (Math.abs(self.gamepad.axes[i]) > 0.9) {
                            gotInput = true;
                            axis_id = i
                            resolve({ type: AXIS, id: axis_id });
                            break;
                        }
                    }
                }
            }, 100)
        });
        return await promise;
    }

    async bind(b, callback) {
        console.log("Binding button: ", b);
        self.binds[b.type][b.id] = callback;
    }
    runInputs() {
        for (i in self.binds[BUTTON]) {
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
                self.binds[BUTTON][i](pct);
            }
        }
        for (i in self.binds[AXIS]) {
            if (Math.abs(self.gamepad.axes[i]) > self.deadzone) {
                self.binds[AXIS][i](self.gamepad.axes[i]);
            }
        }
    }
}