# object-fsm
Make any JavaScript object to be a finite state machine

[![Travis](https://img.shields.io/travis/woyorus/object-fsm.svg?maxAge=2592000)]() [![Codecov](https://img.shields.io/codecov/c/github/woyorus/object-fsm.svg?maxAge=2592000)]()

## Installation

```
npm install object-fsm
```

## How to use

```
var ObjectFsm = require('object-fsm');

var light = {};
ObjectFsm(light);

light.addState('Green', 'Yellow', 'Red');
light.setStartingState('Red');

light.addEvent('go', 'Red', 'Green', function () {
    console.log('Let\'s go!');
});

light.addEvent('prepareToStop', 'Green', 'Yellow', function () {
    console.log('Prepare to stop...');
});

light.addEvent('stop', 'Yellow', 'Red', function () {
    console.log('Everybody stop!');
});

light.handleEvent('go');
light.handleEvent('prepareToStop');
light.handleEvent('stop');
```

## Testing

```
npm test
```
Runs tests of the source code located in `src` directory.
Tests are located in `test` directory.

## License

MIT
