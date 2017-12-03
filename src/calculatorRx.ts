import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/switchMap';

const VALID_INPUT = '0123456789c/*-+.=';

interface ICalculator {
  switcher: HTMLElement;
  keys: NodeListOf<HTMLElement>;
  display: HTMLElement;
  inputValues: Array<string>;

  bindListeners(): void;
  isOn(): boolean;
  processKeyDown(value: string): void;
  calculateResult(inputs: Array<string>): string;
  updateDisplay(text: string): void;
  clear(): void;
}

export class CalculatorRx implements ICalculator {
  switcher: HTMLElement;
  keys: NodeListOf<HTMLElement>;
  display: HTMLElement;
  inputValues: Array<string> = [];

  constructor(root: Element | null) {
    console.log('calc init');
    if (root) {
      this.switcher = root.querySelector('.switcher') as HTMLElement;
      this.keys = root.querySelectorAll('.key') as NodeListOf<HTMLElement>;
      this.display = root.querySelector('.display') as HTMLElement;

      this.bindListeners();

      this.clear();
      this.updateDisplay('');
    }
  }

  bindListeners(): void {

    // on/off
    const onOffSwitcher$ = Observable.fromEvent(this.switcher, 'click')
      .map(e => !this.isOn());

    const keyClicks$ = Observable.fromEvent(this.keys, 'click')
      .map((event: MouseEvent) => (event.target as HTMLElement).dataset.value);

    const keyPresses$ = Observable.fromEvent(document, 'keydown')
      .map((event: KeyboardEvent) => event.key);

    const values$ = Observable.merge(keyClicks$, keyPresses$)
      .filter(inputValue => VALID_INPUT.indexOf(inputValue) >= 0);

    const activeValues$ = onOffSwitcher$
      .switchMap(isOn => isOn ? values$ : Observable.of(''));

    const expressions$ = activeValues$
      .do(val => console.log('before scan', val))
      .scan((acc, value) => (value !== '=' || '') && acc + value)
      .do(val => console.log('after scan', val))
      .filter(text => !!text);

    const bufferedExpressions$ = activeValues$
    // to avoid control symbols
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
      } else {
        this.updateDisplay('');
      }
    });
  }

  isOn(): boolean {
    return this.switcher && this.switcher.classList.contains('switcher--on');
  }

  processKeyDown(value: string) {
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

  calculateResult(inputs: Array<string>): string {
    try {
      return ((window as any).eval as Function)(inputs.join('')) as string;
    } catch (err) {}

    return 'Error';
  }

  updateDisplay(text: string): void {
    this.display.innerHTML = text;
  }

  clear(): void {
    this.inputValues.splice(0, this.inputValues.length);
  }
}