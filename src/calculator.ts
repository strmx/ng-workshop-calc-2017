const VALID_INPUT = '0123456789c/*-+.=';

export class Calculator {

  constructor(root) {
    this.inputValues = null;

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

    [].forEach.call(this.keys, (key) => {
      const value = key.dataset.value;
      if (typeof value !== 'string') throw new Error('no key value');
      key.addEventListener('click', e => this.processKeyDown(value));
    });

    window.addEventListener('keydown', e => {
      const value = e.key;
      if (VALID_INPUT.indexOf(value) >= 0) {
        this.processKeyDown(value);
      }
    });
  }

  isOn() {
    return this.switcher && this.switcher.classList.contains('switcher--on');
  }

  processKeyDown(value) {
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

  calculateResult(inputs) {
    try {
      return window.eval(inputs.join(''));
    } catch (err) {}

    return 'Error';
  }

  updateDisplay(text) {
    this.display.innerHTML = text;
  }

  clear() {
    this.inputValues.splice(0, this.inputValues.length);
  }
}
