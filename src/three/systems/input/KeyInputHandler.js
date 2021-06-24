

class KeyInputHandler {
    constructor(domElement, keyInfos) {
        // Element to register keyboard events to
        this.domElement = domElement;

        // State (pressed / not pressed) of each key
        // If a key is not present, then it's considered not pressed
        this.keyStates = {};

        // Actions to execute when a key is pressed
        this.pressedActions = {};

        // Actions to continuously execute when a key is held
        this.heldActions = {};

        // Initialize
        keyInfos.forEach((keyInfo) => {
            if(!keyInfo.onHeld) {
                this.setOnPress(keyInfo.keys, keyInfo.action);
            } else {
                this.setOnHeld(keyInfo.keys, keyInfo.action);
            }
        });

        this.enable();
    }

    _onKeyAction = (e) => {
        const key = e.code; // Current key 
        const state = e.type === "keydown"; // True if pressed, false otherwise

        // If the key is pressed but previously wasn't, execute pressed action
        if(state && !this.isHeld(key)) {
            if(this.pressedActions[key]) {
                e.preventDefault();
                this.pressedActions[key](e); // Execute action
            }
        }

        // Update the key states
        this.keyStates[key] = {
            isPressed: state,
            event: e
        };
    }

    reset = (e) => {
        this.keyStates = {};
    }

    // Returns true if a key is held
    isHeld(key) {
        if(!this.keyStates[key]) {
            return false;
        }
        return this.keyStates[key].isPressed;
    }

    // Helper function for linking an action to a specific key press/hold
    // Multiple keys can be linked at the same time, if an array with key names is passed
    _setActions(keys, action, object) {
        if(Array.isArray(keys)) {
            for(const key of keys) {
                this._setActions(key, action, object);
            }
            return;
        } 
        object[keys] = action;
    }

    // Links an action to a key press
    setOnPress(keys, action) {
        this._setActions(keys, action, this.pressedActions);
    };

    // Links an action to a key hold
    setOnHeld(keys, action) {
        this._setActions(keys, action, this.heldActions);
    };

    // Executes all actions associated with currently held keys
    executeHeldActions() {
        Object.entries(this.heldActions).forEach(([key, action]) => {
            const keyData = this.keyStates[key];
            if(this.isHeld(key)) action(keyData ? keyData.event : null);
        });
    };


    enable() {
        if(this.enabled) return;
        this.enabled = true;

        // Register listeners
        this.domElement.addEventListener("keydown", this._onKeyAction);
        this.domElement.addEventListener("keyup", this._onKeyAction);
        this.domElement.addEventListener("blur", this.reset);
    }

    disable() {
        if(!this.enabled) return;
        this.enabled = false;

        // Remove listeners
        this.domElement.removeEventListener("keydown", this._onKeyAction);
        this.domElement.removeEventListener("keyup", this._onKeyAction);
        this.domElement.removeEventListener("blur", this.reset);
    };
}

export { KeyInputHandler };