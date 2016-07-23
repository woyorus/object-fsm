var Emitter = require('component-emitter');

module.exports = ObjectFsm;

Emitter(ObjectFsm.prototype);

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
        if (eventObject.validFrom.indexOf(this.state) !== -1) {
            var fromState = this.state;
            var toState = eventObject.validTo;
            var handlerReturnValue = undefined;
            this.emit('willTransition', fromState, toState, event);
            if (typeof eventObject.handler === 'function') {
                var handlerArgs = Array.prototype.slice.call(arguments).slice(1);
                handlerReturnValue = eventObject.handler.apply(this, handlerArgs);
            }
            this.state = toState;
            this.emit('didTransition', fromState, toState, event);
            return handlerReturnValue;
        }
    }
};
