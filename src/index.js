module.exports = ObjectFsm;

function ObjectFsm(obj) {
    if (obj) return mixin(obj);
}

function mixin(obj) {
    for (var key in ObjectFsm.prototype) {
        obj[key] = ObjectFsm.prototype[key];
    }
    obj.fsm = {};
    obj.fsm.states = [];
    obj.fsm.events = {};
    return obj;
}

ObjectFsm.prototype.addState = function (states) {
    for (var i = 0; i < arguments.length; i++) {
        this.fsm.states.push(arguments[i]);
    }
    if (!this.state) {
        this.state = this.fsm.states[0];
    }
};

ObjectFsm.prototype.setStartingState = function (state) {
    if (this.stateExists(state)) {
        this.state = state;
    }
};

ObjectFsm.prototype.stateExists = function (state) {
    return this.fsm.states.indexOf(state) !== -1;
};

ObjectFsm.prototype.addEvent = function(eventName, statesFrom, stateTo, handler) {
    if (typeof statesFrom === 'string') {
        statesFrom = [statesFrom];
    }

    var eventObject = {
        validFrom: statesFrom,
        validTo: stateTo,
        handler: handler
    };

    this.fsm.events[eventName] = eventObject;
};

ObjectFsm.prototype.handleEvent = function (event) {
    if (this.fsm.events.hasOwnProperty(event)) {
        var eventObject = this.fsm.events[event];
        if (eventObject.validFrom.includes(this.state)) {
            if (typeof eventObject.handler === 'function') {
                eventObject.handler();
            }
            this.state = eventObject.validTo;
        }
    }
};
