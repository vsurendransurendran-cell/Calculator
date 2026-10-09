'use strict';

const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const keypad = document.querySelector('.keypad');

let currentInput = '0';
let storedValue = null;
let pendingOperator = null;
let shouldStartNewInput = false;
let expressionText = '';

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function render() {
  resultDisplay.textContent = currentInput;
  expressionDisplay.textContent = expressionText;
}

function clearAll() {
  currentInput = '0';
  storedValue = null;
  pendingOperator = null;
  shouldStartNewInput = false;
  expressionText = '';
  render();
}

function inputNumber(number) {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = number;
    shouldStartNewInput = false;
  } else if (currentInput === '0') {
    currentInput = number;
  } else if (currentInput.length < 16) {
    currentInput += number;
  }
  render();
}

function inputDecimal() {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = '0.';
    shouldStartNewInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  render();
}

function calculate(a, operator, b) {
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    case '%': return a % b;
    default: return b;
  }
}

function chooseOperator(operator) {
  const value = Number(currentInput);
  if (!Number.isFinite(value)) {
    clearAll();
    return;
  }

  if (pendingOperator && !shouldStartNewInput) {
    const result = calculate(storedValue, pendingOperator, value);
    currentInput = formatNumber(result);
    if (currentInput === 'Error') {
      expressionText = 'Cannot divide by zero';
      storedValue = null;
      pendingOperator = null;
      shouldStartNewInput = true;
      render();
      return;
    }
    storedValue = Number(currentInput);
  } else {
    storedValue = value;
  }

  pendingOperator = operator;
  expressionText = `${currentInput} ${displayOperator(operator)}`;
  shouldStartNewInput = true;
  render();
}

function displayOperator(operator) {
  return ({ '*': '×', '/': '÷', '-': '−', '+': '+', '%': '%' })[operator] || operator;
}

function showResult() {
  if (!pendingOperator || storedValue === null || currentInput === 'Error') return;
  const first = storedValue;
  const second = Number(currentInput);
  const operator = pendingOperator;
  const answer = calculate(first, operator, second);

  expressionText = `${formatNumber(first)} ${displayOperator(operator)} ${formatNumber(second)} =`;
  currentInput = formatNumber(answer);
  storedValue = null;
  pendingOperator = null;
  shouldStartNewInput = true;

  if (currentInput === 'Error') expressionText = 'Cannot divide by zero';
  render();
}

function deleteLast() {
  if (currentInput === 'Error' || shouldStartNewInput) {
    currentInput = '0';
    shouldStartNewInput = false;
  } else {
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
    if (currentInput === '-') currentInput = '0';
  }
  render();
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : `-${currentInput}`;
  render();
}

function handleAction(action) {
  switch (action) {
    case 'clear': clearAll(); break;
    case 'delete': deleteLast(); break;
    case 'decimal': inputDecimal(); break;
    case 'equals': showResult(); break;
    case 'sign': toggleSign(); break;
  }
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    handleAction(button.dataset.action);
  }
});

document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (['+', '-', '*', '/', '%'].includes(key)) {
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    showResult();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape' || key === 'Delete') {
    clearAll();
  }
});

render();
