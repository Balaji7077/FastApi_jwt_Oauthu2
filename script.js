'use strict';

(function () {
	const historyEl = document.getElementById('history');
	const currentEl = document.getElementById('current');
	const keysEl = document.querySelector('.keys');
	const appRoot = document.querySelector('.calculator');

	/** Calculator state */
	let currentInput = '0';
	let previousValue = null;
	let pendingOperator = null;
	let overwriteOnNextDigit = false;

	function updateDisplay() {
		currentEl.textContent = formatNumberForDisplay(currentInput);
		historyEl.textContent = buildHistoryString();
		// Update aria-label to reflect current state for screen readers
		appRoot.setAttribute('aria-label', `Calculator. ${historyEl.textContent || ''} ${currentEl.textContent}`.trim());
	}

	function formatNumberForDisplay(valueStr) {
		if (valueStr === 'Infinity' || valueStr === '-Infinity' || valueStr === 'NaN') return valueStr;
		if (!valueStr.includes('.')) {
			return Number(valueStr).toLocaleString(undefined, { maximumFractionDigits: 0 });
		}
		const [intPart, fracPart] = valueStr.split('.');
		const intFormatted = Number(intPart).toLocaleString(undefined, { maximumFractionDigits: 0 });
		return `${intFormatted}.${fracPart}`;
	}

	function buildHistoryString() {
		const left = previousValue !== null ? formatNumberForDisplay(String(previousValue)) : '';
		const op = pendingOperator ? ` ${symbolForOperator(pendingOperator)} ` : '';
		return `${left}${op}`.trim();
	}

	function symbolForOperator(op) {
		return op === '*' ? '×' : op === '/' ? '÷' : op;
	}

	function inputDigit(d) {
		if (overwriteOnNextDigit) {
			currentInput = d;
			overwriteOnNextDigit = false;
			updateDisplay();
			return;
		}
		if (currentInput === '0') {
			currentInput = d;
		} else {
			currentInput += d;
		}
		updateDisplay();
	}

	function inputDecimal() {
		if (overwriteOnNextDigit) {
			currentInput = '0.';
			overwriteOnNextDigit = false;
			updateDisplay();
			return;
		}
		if (!currentInput.includes('.')) {
			currentInput += '.';
			updateDisplay();
		}
	}

	function clearAll() {
		currentInput = '0';
		previousValue = null;
		pendingOperator = null;
		overwriteOnNextDigit = false;
		updateDisplay();
	}

	function clearEntry() {
		currentInput = '0';
		updateDisplay();
	}

	function deleteDigit() {
		if (overwriteOnNextDigit) {
			currentInput = '0';
			overwriteOnNextDigit = false;
			updateDisplay();
			return;
		}
		if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
			currentInput = '0';
		} else {
			currentInput = currentInput.slice(0, -1);
		}
		updateDisplay();
	}

	function toggleSign() {
		if (currentInput === '0') return;
		currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : `-${currentInput}`;
		updateDisplay();
	}

	function setOperation(op) {
		const currentValue = Number(currentInput);
		if (pendingOperator && previousValue !== null && !overwriteOnNextDigit) {
			const result = compute(previousValue, currentValue, pendingOperator);
			previousValue = result;
			currentInput = String(result);
		} else if (previousValue === null) {
			previousValue = currentValue;
		}
		pendingOperator = op;
		overwriteOnNextDigit = true;
		updateDisplay();
	}

	function equals() {
		if (pendingOperator === null || previousValue === null) return;
		const currentValue = Number(currentInput);
		const result = compute(previousValue, currentValue, pendingOperator);
		currentInput = String(result);
		previousValue = null;
		pendingOperator = null;
		overwriteOnNextDigit = true;
		updateDisplay();
	}

	function compute(a, b, op) {
		switch (op) {
			case '+': return a + b;
			case '-': return a - b;
			case '*': return a * b;
			case '/': return b === 0 ? NaN : a / b;
			default: return b;
		}
	}

	function handleClick(event) {
		const button = event.target.closest('button.key');
		if (!button) return;

		const action = button.getAttribute('data-action');
		const digit = button.getAttribute('data-digit');
		const op = button.getAttribute('data-op');

		button.classList.add('is-pressed');
		setTimeout(() => button.classList.remove('is-pressed'), 100);

		switch (action) {
			case 'digit': inputDigit(digit); break;
			case 'decimal': inputDecimal(); break;
			case 'clear': clearAll(); break;
			case 'clear-entry': clearEntry(); break;
			case 'delete': deleteDigit(); break;
			case 'sign': toggleSign(); break;
			case 'operation': setOperation(op); break;
			case 'equals': equals(); break;
		}
	}

	function handleKeydown(event) {
		const key = event.key;
		if (key >= '0' && key <= '9') {
			inputDigit(key);
			flashKey(`[data-action="digit"][data-digit="${key}"]`);
			return;
		}
		switch (key) {
			case '.': inputDecimal(); flashKey('[data-action="decimal"]'); break;
			case '+': setOperation('+'); flashKey('[data-op="+"]'); break;
			case '-': setOperation('-'); flashKey('[data-op="-"]'); break;
			case '*': setOperation('*'); flashKey('[data-op="*"]'); break;
			case '/': setOperation('/'); flashKey('[data-op="/"]'); break;
			case 'Enter':
			case '=': equals(); flashKey('[data-action="equals"]'); break;
			case 'Backspace': deleteDigit(); flashKey('[data-action="delete"]'); break;
			case 'Escape': clearAll(); flashKey('[data-action="clear"]'); break;
		}
	}

	function flashKey(selector) {
		const btn = document.querySelector(selector);
		if (!btn) return;
		btn.classList.add('is-pressed');
		setTimeout(() => btn.classList.remove('is-pressed'), 100);
	}

	keysEl.addEventListener('click', handleClick);
	window.addEventListener('keydown', handleKeydown);

	updateDisplay();
})();