(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "rxjs/Observable", "rxjs/add/observable/fromEvent", "rxjs/add/observable/of", "rxjs/add/observable/empty", "rxjs/add/observable/merge", "rxjs/add/operator/map", "rxjs/add/operator/filter", "rxjs/add/operator/concat", "rxjs/add/operator/buffer", "rxjs/add/operator/do", "rxjs/add/operator/scan", "rxjs/add/operator/switchMap"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Observable_1 = require("rxjs/Observable");
    require("rxjs/add/observable/fromEvent");
    require("rxjs/add/observable/of");
    require("rxjs/add/observable/empty");
    require("rxjs/add/observable/merge");
    require("rxjs/add/operator/map");
    require("rxjs/add/operator/filter");
    require("rxjs/add/operator/concat");
    require("rxjs/add/operator/buffer");
    require("rxjs/add/operator/do");
    require("rxjs/add/operator/scan");
    require("rxjs/add/operator/switchMap");
    const VALID_INPUT = '0123456789c/*-+.=';
    class Calculator {
        constructor(root) {
            this.inputValues = [];
            console.log('calc init');
            if (root) {
                this.switcher = root.querySelector('.switcher');
                this.keys = root.querySelectorAll('.key');
                this.display = root.querySelector('.display');
                this.bindListeners();
                this.clear();
                this.updateDisplay('');
            }
        }
        bindListeners() {
            // on/off
            const onOffSwitcher$ = Observable_1.Observable.fromEvent(this.switcher, 'click')
                .map(e => !this.isOn());
            const keyClicks$ = Observable_1.Observable.fromEvent(this.keys, 'click')
                .map((event) => event.target.dataset.value);
            const keyPresses$ = Observable_1.Observable.fromEvent(document, 'keydown')
                .map((event) => event.key);
            const values$ = Observable_1.Observable.merge(keyClicks$, keyPresses$)
                .filter(inputValue => VALID_INPUT.indexOf(inputValue) >= 0);
            const activeValues$ = onOffSwitcher$
                .switchMap(isOn => isOn ? values$ : Observable_1.Observable.of(''));
            const expressions$ = activeValues$
                .do(val => console.log('before scan', val))
                .scan((acc, value) => (value !== '=' || '') && acc + value)
                .do(val => console.log('after scan', val))
                .filter(text => !!text);
            const bufferedExpressions$ = activeValues$
                .filter(value => value !== '=')
                .buffer(activeValues$.filter(n => n === '=' || n === 'c'));
            const results$ = bufferedExpressions$
                .map(this.calculateResult.bind(this));
            // 3. show result
            results$.subscribe(this.updateDisplay.bind(this));
            // 2. show entered data
            expressions$.subscribe(this.updateDisplay.bind(this));
            // 1. update switcher view
            onOffSwitcher$.subscribe(isOn => {
                this.clear();
                this.switcher.classList.toggle('switcher--on');
                if (isOn) {
                    this.updateDisplay('0');
                }
                else {
                    this.updateDisplay('');
                }
            });
        }
        isOn() {
            return this.switcher && this.switcher.classList.contains('switcher--on');
        }
        processKeyDown(value) {
            switch (value) {
                case 'c':
                    this.clear();
                    this.updateDisplay('0');
                    break;
                case '=':
                    this.updateDisplay(this.calculateResult(this.inputValues));
                    this.clear();
                    break;
                default:
                    this.inputValues.push(value);
                    this.updateDisplay(this.inputValues.join(''));
            }
        }
        calculateResult(inputs) {
            try {
                return window.eval(inputs.join(''));
            }
            catch (err) { }
            return 'Error';
        }
        updateDisplay(text) {
            this.display.innerHTML = text;
        }
        clear() {
            this.inputValues.splice(0, this.inputValues.length);
        }
    }
    exports.Calculator = Calculator;
    new Calculator(document.querySelector('.calculator'));
});
