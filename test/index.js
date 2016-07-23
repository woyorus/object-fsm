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
        testObject.addState('A');
        expect(testObject.fsm.states).to.have.length(1);
        expect(testObject.fsm.states).to.include('A');
    });

    it('should add multiple states in one call', function () {
        testObject.addState('A', 'B', 'C');
        expect(testObject.fsm.states).to.have.length(3);
        expect(testObject.fsm.states).to.include.all('A', 'B', 'C');
    });

    it('should choose starting state to be the first one', function () {
        testObject.addState('A');
        expect(testObject.state).to.equal('A');
    });

    it('should allow setting a starting state', function () {
        testObject.addState('A', 'B');
        testObject.setStartingState('B');
        expect(testObject.state).to.equal('B');
    });

    it('should not allow setting starting state which does not exist', function () {
        testObject.addState('A', 'B', 'C');
        testObject.setStartingState('Z');
        expect(testObject.state).to.equal('A');
    });

    it('should switch state upon event', function () {
        testObject.addState('A', 'B');
        testObject.addEvent('go', 'A', 'B');
        expect(testObject.state).to.equal('A');
        testObject.handleEvent('go');
        expect(testObject.state).to.equal('B');
    });

    it('should invoke event handler upon event', function (done) {
        testObject.addState('A', 'B');
        testObject.addEvent('go', 'A', 'B', function () {
            done();
        });
        testObject.handleEvent('go');
    });

    it('should emit `willTransition` and `didTransition` events on successful event', function (done) {
        testObject.addState('A', 'B');
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

});
