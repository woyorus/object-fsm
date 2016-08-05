var expect = require('chai').expect;
var ObjectFsm = require('./../src/index');

describe('ObjectFsm(obj)', function () {
    it('should mixin', function () {
        var proto = {};
        ObjectFsm(proto);
        expect(proto.fsm).to.be.an('object');
    });
});

describe('state machine', function () {
    var testObject;

    beforeEach(function () {
        testObject = {};
        ObjectFsm(testObject);
    });

    it('should add new state', function () {
        expect(testObject.addState('A')).to.be.true;
        expect(testObject.fsm.states).to.have.length(1);
        expect(testObject.fsm.states).to.include('A');
    });

    it('should only accept a String state', function () {
        expect(testObject.addState({ 'A': true })).to.be.false;
        expect(testObject.addState(3)).to.be.false;
    });

    it('should add multiple states in one call', function () {
        testObject.addStates(['A', 'B', 'C']);
        expect(testObject.fsm.states).to.have.length(3);
        expect(testObject.fsm.states).to.include.all('A', 'B', 'C');
    });

    it('should choose starting state to be the first one', function () {
        testObject.addState('A');
        expect(testObject.state).to.equal('A');
    });

    it('should allow setting a starting state', function () {
        testObject.addStates(['A', 'B']);
        testObject.setStartingState('B');
        expect(testObject.state).to.equal('B');
    });

    it('should not allow setting starting state which does not exist', function () {
        testObject.addStates(['A', 'B', 'C']);
        testObject.setStartingState('Z');
        expect(testObject.state).to.equal('A');
    });

    it('should not add events with missing states', function () {
        testObject.addStates(['A', 'B']);
        var result = testObject.addEvent('go', 'A', 'C');
        expect(result).to.be.false;
        expect(testObject.hasEvent('go')).to.be.false;
    });

    it('should switch state upon event', function () {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B');
        expect(testObject.state).to.equal('A');
        testObject.handleEvent('go');
        expect(testObject.state).to.equal('B');
    });

    it('should not allow transition from invalid state', function () {
        testObject.addStates(['A', 'B']) ;
        testObject.addEvent('go', 'B', 'A');
        testObject.setStartingState('A');
        testObject.handleEvent('go');
        expect(testObject.state).to.equal('A');
    });

    it('should invoke event handler upon event', function (done) {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B', function () {
            done();
        });
        testObject.handleEvent('go');
    });

    it('should emit `willTransition` and `didTransition` events on successful event', function (done) {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B');
        var willTransitionCalled = false;
        testObject.on('willTransition', function (stateFrom, stateTo, event) {
            expect(stateFrom).to.equal('A');
            expect(stateTo).to.equal('B');
            expect(event).to.equal('go');
            expect(testObject.state).to.equal('A');
            willTransitionCalled = true;
        });
        testObject.on('didTransition', function (stateFrom, stateTo, event) {
            expect(willTransitionCalled).to.be.true;
            expect(stateFrom).to.equal('A');
            expect(stateTo).to.equal('B');
            expect(event).to.equal('go');
            expect(testObject.state).to.equal('B');
            done();
        });
        testObject.handleEvent('go');
    });

    it('should pass parameters from handleEvent to the handler', function (done) {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B', function (param1, param2) {
            expect(param1).to.equal('hello');
            expect(param2).to.equal(123);
            done();
        });
        testObject.handleEvent('go', 'hello', 123);
    });

    it('should return value that is returned by the handler', function () {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B', function () {
            return "ok";
        });
        var returnValue = testObject.handleEvent('go');
        expect(returnValue).to.equal("ok");
    });

    it('should pause transition if deferred', function () {
        testObject.addStates(['A', 'B']);
        testObject.addEvent('go', 'A', 'B', function () {
            this.deferTransition();
        });
        testObject.handleEvent('go');
        expect(testObject.state).to.equal('A');
        testObject.finalizeTransition();
        expect(testObject.state).to.equal('B');
    });

    it('should not handle another event while transition is deferred', function () {
        testObject.addStates(['A', 'B', 'C']);
        testObject.addEvent('goToB', 'A', 'B', function () {
            this.deferTransition();
        });
        testObject.addEvent('goToC', 'A', 'C');
        testObject.handleEvent('goToB');
        expect(testObject.state).to.equal('A');
        testObject.handleEvent('goToC');
        expect(testObject.state).to.equal('A');
        testObject.finalizeTransition();
        expect(testObject.state).to.equal('B');
    });
});
