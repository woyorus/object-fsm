# object-fsm

Make any JavaScript object to be a finite state machine

[![Travis](https://img.shields.io/travis/woyorus/object-fsm.svg?maxAge=2592000)](<>) [![Codecov](https://img.shields.io/codecov/c/github/woyorus/object-fsm.svg?maxAge=2592000)](<>)

## Installation

    npm install object-fsm

## How to use

```js
var ObjectFsm = require('object-fsm');

// Any object can become an FSM
var light = {};

// Mix in ObjectFsm to the object
ObjectFsm(light);

light.addStates(['Green', 'Yellow', 'Red']);
light.setStartingState('Red'); // Current state -> Red

// Parameters are: eventName, stateFrom, stateTo, handlerFunc (see doc)
light.addEvent('go', 'Red', 'Green', function () {
    console.log('Let\'s go!');
});

light.addEvent('prepareToStop', 'Green', 'Yellow', function () {
    console.log('Prepare to stop...');
});

light.addEvent('stop', 'Yellow', 'Red', function () {
    console.log('Everybody stop!');
});

light.handleEvent('go'); // state: green
light.handleEvent('prepareToStop'); // state: yellow
light.handleEvent('stop');  // state: red
```

## API Docs

### ObjectFsm

Mixes FSM into the object.

**Parameters**

-   `obj`  The object that will become an FSM

#### addState

Adds a state to FSM
Note that FSM automatically enters the state added first

**Parameters**

-   `state` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** State name

#### addStates

Adds a list of states to FSM

**Parameters**

-   `states` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** 

#### setStartingState

Sets a starting state. FSM immediately moves to that state.

**Parameters**

-   `state` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### hasState

Returns true if FSM has state {state}

**Parameters**

-   `state`  

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### hasEvent

Checks if FSM has given event

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### addEvent

Adds a new event to FSM

**Parameters**

-   `eventName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Event name
-   `statesFrom` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> | [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** A one or more states in which FSM can handle this event
-   `stateTo` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** State to which the event transitions FSM
-   `handler` **\[function (Any): Any]** Function that is invoked upon event

#### handleEvent

Notifies FSM about an event

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Existing event
-   `arguments` **...Any** Will be passed to event handler

Returns **Any** Return value of the event handler

#### canHandleEvent

Returns true if FSM is able to handle event right now

**Parameters**

-   `event`  

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### cancelTransition

Cancels current transition.
NOTE: this function can be called only in event handler (during an event), or in `willTransition` event handler,
or if a transition was previously deferred using deferTransition

#### deferTransition

Defers an ongoing transition until future call to either finalizeTransition, or cancelTransition.
Use for any asynchronous event hanling.
NOTE: this function can be called only in event handler (during an event), or in `willTransition` event handler.

#### finalizeTransition

Finalizes a deferred transition.

## Testing

    npm test

Runs tests of the source code located in `src` directory.
Tests are located in `test` directory.

## License

MIT
