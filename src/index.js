var Emitter = require('component-emitter');
var debug = require('debug')('ObjectFSM');

module.exports = ObjectFsm;

Emitter(ObjectFsm.prototype);

/**
 * Mixes FSM into the object.
 * @param obj The object that will become an FSM
 * @constructor
 */
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

/**
 * Adds a state to FSM
 * Note that FSM automatically enters the state added first
 * @param {string} state State name
 * @returns {boolean} result Whether adding a state succeeded or not
 * @public
 */
ObjectFsm.prototype.addState = function (state) {
    if (typeof state !== 'string') {
        debug('addState: state must be a string');
        return false;
    }
    this.fsm.states.push(state);
    if (!this.state)
        this.state = state;
    return true;
};

/**
 * Adds a list of states to FSM
 * @param {Array.<string>} states
 * @public
 */
ObjectFsm.prototype.addStates = function (states) {
    var that = this;
    states.forEach(function (state) {
        that.addState(state);
    });
};

/**
 * Sets a starting state. FSM immediately moves to that state.
 * @param {string} state
 * @public
 */
ObjectFsm.prototype.setStartingState = function (state) {
    if (this.hasState(state)) {
        this.state = state;
    }
};

/**
 * Returns true if FSM has state {state}
 * @param state
 * @returns {boolean}
 * @public
 */
ObjectFsm.prototype.hasState = function (state) {
    return this.fsm.states.indexOf(state) !== -1;
};

/**
 * Checks if FSM has given event
 * @param {string} event
 * @returns {boolean}
 * @public
 */
ObjectFsm.prototype.hasEvent = function (event) {
    return this.fsm.events.hasOwnProperty(event);
};

/**
 * Adds a new event to FSM
 * @param {string} eventName Event name
 * @param {(Array.<string>|string)} statesFrom A one or more states in which FSM can handle this event
 * @param {string} stateTo State to which the event transitions FSM
 * @param {function(*):*=} handler Function that is invoked upon event
 * @public
 */
ObjectFsm.prototype.addEvent = function(eventName, statesFrom, stateTo, handler) {
    if (typeof statesFrom === 'string') {
        statesFrom = [statesFrom];
    }

    var everyState = statesFrom.concat(stateTo);
    var everyStatePresent = true;

    for (var i = 0; i < everyState.length; i++) {
        everyStatePresent = everyStatePresent && this.hasState(everyState[i]);
    }

    if (everyStatePresent === false) {
        debug('Cannot add event \'' + eventName + '\' due to missing states from or to.');
        return false;
    }

    this.fsm.events[eventName] = {
        validFrom: statesFrom,
        validTo: stateTo,
        handler: handler
    };

    return true;
};

/**
 * Notifies FSM about an event
 * @param {string} event Existing event
 * @param {...*} arguments Will be passed to event handler
 * @returns {*} Return value of the event handler
 * @public
 */
ObjectFsm.prototype.handleEvent = function (event) {
    if (this.canHandleEvent(event)) {
        var eventObject = this.fsm.events[event];
        var fromState = this.state;
        var toState = eventObject.validTo;
        this.fsm.switchingStates = true;
        this.emit('willTransition', fromState, toState, event);
        var handlerReturnValue = undefined;
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
    } else {
        debug('cannot handle event ' + event + ' due to invalid conditions, such as concurrent transition');
    }
};

/**
 * Returns true if FSM is able to handle event right now
 * @param event
 * @returns {boolean}
 * @public
 */
ObjectFsm.prototype.canHandleEvent = function (event) {
    return this.hasEvent(event) &&
        (this.fsm.events[event].validFrom.indexOf(this.state) !== -1) &&
            this.fsm.switchingStates === false;
};

/**
 * Cancels current transition.
 * NOTE: this function can be called only in event handler (during an event), or in `willTransition` event handler,
 * or if a transition was previously deferred using deferTransition
 * @public
 */
ObjectFsm.prototype.cancelTransition = function () {
    this.fsm.transitionCancelled = true;
    this.fsm.finalizeTransitionClosure = null;
    this.fsm.switchingStates = false;
    this.fsm.transitionCancelled = true;
};

/**
 * Defers an ongoing transition until future call to either finalizeTransition, or cancelTransition.
 * Use for any asynchronous event hanling.
 * NOTE: this function can be called only in event handler (during an event), or in `willTransition` event handler.
 * @public
 */
ObjectFsm.prototype.deferTransition = function () {
    this.fsm.transitionDeferred = true;
};

/**
 * Finalizes a deferred transition.
 * @public
 */
ObjectFsm.prototype.finalizeTransition = function () {
    this.fsm.finalizeTransitionClosure();
    this.fsm.finalizeTransitionClosure = null;
    this.fsm.switchingStates = false;
    this.fsm.transitionDeferred = false;
    this.fsm.transitionCancelled = false;
};
