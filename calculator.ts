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

class Calculator implements ICalculator {
  switcher: HTMLElement;
  keys: NodeListOf<HTMLElement>;
  display: HTMLElement;
  inputValues: Array<string> = [];

  constructor(root: Element | null) {
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

    this.switcher.addEventListener('click', e => {
      this.clear();
      this.switcher.classList.toggle('switcher--on');

      if (this.isOn()) {
        this.updateDisplay('0');
      } else {
        this.updateDisplay('');
      }
    });

    // input

    [].forEach.call(this.keys, (key: HTMLElement) => {
      const value = key.dataset.value;
      if (typeof value !== 'string') throw new Error('no key value');
      key.addEventListener('click', e => this.processKeyDown(value));
    });

    window.addEventListener('keydown', e => {
      const value: string = e.key;
      if (VALID_INPUT.indexOf(value) >= 0) {
        this.processKeyDown(value);
      }
    });

  }

  isOn(): boolean {
    return this.switcher && this.switcher.classList.contains('switcher--on');
  }

  processKeyDown(value: string) {
    if (!this.isOn()) {
      return;
    }

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

new Calculator(document.querySelector('.calculator'));