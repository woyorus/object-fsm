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
    initialize(obj);
    return obj;
}

function initialize(obj) {
    obj.fsm = {};
    obj.fsm.states = [];
    obj.fsm.events = {};
    obj.fsm.transitionCancelled = false;
    obj.fsm.transitionDeferred = false;
    obj.fsm.switchingStates = false;
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
    if (this.hasState(state)) {
        this.state = state;
    }
};

ObjectFsm.prototype.hasState = function (state) {
    return this.fsm.states.indexOf(state) !== -1;
};

ObjectFsm.prototype.hasEvent = function (event) {
    return this.fsm.events.hasOwnProperty(event);
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
    if (this.canHandleEvent(event)) {
        var eventObject = this.fsm.events[event];
        var fromState = this.state;
        var toState = eventObject.validTo;
        var handlerReturnValue = undefined;
        this.fsm.switchingStates = true;
        this.emit('willTransition', fromState, toState, event);
        if (typeof eventObject.handler === 'function') {
            var handlerArgs = Array.prototype.slice.call(arguments).slice(1);
            handlerReturnValue = eventObject.handler.apply(this, handlerArgs);
        }
        var that = this;
        this.fsm.finalizeTransitionClosure = function () {
            if (!that.fsm.transitionCancelled) {
                that.state = toState;
                that.emit('didTransition', fromState, toState, event);
            }
        };
        if (!this.fsm.transitionDeferred) {
            this.finalizeTransition();
        }
        return handlerReturnValue;
    }
};

ObjectFsm.prototype.canHandleEvent = function (event) {
    return this.hasEvent(event) &&
        (this.fsm.events[event].validFrom.indexOf(this.state) !== -1) &&
            this.fsm.switchingStates === false;
};

ObjectFsm.prototype.cancelTransition = function () {
    this.fsm.transitionCancelled = true;
    this.fsm.finalizeTransitionClosure = null;
    this.fsm.switchingStates = false;
};

ObjectFsm.prototype.deferTransition = function () {
    this.fsm.transitionDeferred = true;
};

ObjectFsm.prototype.finalizeTransition = function () {
    this.fsm.finalizeTransitionClosure();
    this.fsm.finalizeTransitionClosure = null;
    this.fsm.switchingStates = false;
};
