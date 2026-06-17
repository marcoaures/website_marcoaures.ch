document.addEventListener('DOMContentLoaded', function () {
	const cpcInput = document.getElementById('cpcr-cpc');
	const crInput  = document.getElementById('cpcr-cr');

	const lowCpaInput   = document.getElementById('cpcr-lowcpa');
	const medCpaInput   = document.getElementById('cpcr-medcpa');
	const highCpaInput  = document.getElementById('cpcr-highcpa');

	const minBudgetInput  = document.getElementById('cpcr-minbudget');
	const lowBudgetInput  = document.getElementById('cpcr-lowbudget');
	const normBudgetInput = document.getElementById('cpcr-normbudget');

	const crHint = document.getElementById('cpcr-cr-hint');

	function showCrHint(show) {
		if (!crHint) return;
		crHint.style.display = show ? 'block' : 'none';
	}

	function decimalKeyFilter(event) {
		const allowedControlKeys = [
			'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
			'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'Enter'
		];

		if (allowedControlKeys.includes(event.key)) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		if (/^[0-9.,]$/.test(event.key)) return;

		event.preventDefault();
	}

	function formatCHF(value) {
		if (!isFinite(value)) return '';
		return 'CHF ' + value.toFixed(2);
	}

	function clearResults() {
		if (lowCpaInput)    lowCpaInput.value   = '';
		if (medCpaInput)    medCpaInput.value   = '';
		if (highCpaInput)   highCpaInput.value  = '';
		if (minBudgetInput) minBudgetInput.value  = '';
		if (lowBudgetInput) lowBudgetInput.value  = '';
		if (normBudgetInput)normBudgetInput.value = '';
	}

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function updateResults() {
		if (!cpcInput || !crInput) return;

		const cpcRaw = cpcInput.value || '';
		const crRaw  = crInput.value  || '';

		const cpcVal       = parseFloat(cpcRaw.replace(',', '.'));
		const crPercentVal = parseFloat(crRaw.replace(',', '.'));

		if (!cpcVal || !crPercentVal || cpcVal <= 0 || crPercentVal <= 0) {
			clearResults();
			return;
		}

		const cr = crPercentVal / 100;
		if (cr <= 0) {
			clearResults();
			return;
		}

		const medCpa = cpcVal / cr;

		let rawVol = cpcVal / crPercentVal;
		if (!isFinite(rawVol) || rawVol <= 0) {
			rawVol = 0.1;
		}

		const minVol = 0.10;
		const maxVol = 0.50;
		const volatility = clamp(rawVol, minVol, maxVol);

		const lowCpa  = medCpa * (1 - volatility);
		const highCpa = medCpa * (1 + volatility);

		if (medCpaInput)  medCpaInput.value  = formatCHF(medCpa)  + ' (expected)';
		if (lowCpaInput)  lowCpaInput.value  = formatCHF(lowCpa)  + ' (optimistic)';
		if (highCpaInput) highCpaInput.value = formatCHF(highCpa) + ' (pessimistic)';

		const daysPerMonth = 30;
		function budgetPerDay(targetConversions) {
			return medCpa * targetConversions / daysPerMonth;
		}

		const minBudget  = budgetPerDay(15);
		const lowBudget  = budgetPerDay(25);
		const normBudget = budgetPerDay(50);

		if (minBudgetInput)  minBudgetInput.value  = formatCHF(minBudget)  + ' per day';
		if (lowBudgetInput)  lowBudgetInput.value  = formatCHF(lowBudget)  + ' per day';
		if (normBudgetInput) normBudgetInput.value = formatCHF(normBudget) + ' per day';
	}

	function sanitizeDecimalValue(raw, options = {}) {
		const { maxDecimals = 2, maxValue = null } = options;

		if (!raw) return '';

		let val = String(raw).trim();

		val = val.replace(',', '.');

		val = val.replace(/[^0-9.]/g, '');
		if (!val) return '';

		const parts = val.split('.');
		if (parts.length > 2) {
			val = parts[0] + '.' + parts.slice(1).join('');
		}

		let [intPart, decPart] = val.split('.');
		if (!intPart) intPart = '0';

		if (decPart && maxDecimals >= 0) {
			decPart = decPart.slice(0, maxDecimals);
		}

		val = (decPart !== undefined && decPart !== '')
			? intPart + '.' + decPart
			: intPart;

		let num = parseFloat(val);
		if (isNaN(num)) return '';

		if (maxValue !== null && num > maxValue) {
			num = maxValue;
		}

		let fixed = num.toFixed(maxDecimals);
		if (maxDecimals > 0) {
			fixed = fixed.replace(/(\.\d*?)0+$/, '$1');
			fixed = fixed.replace(/\.$/, '');
		}

		return fixed;
	}

	function sanitizeCpc() {
		if (!cpcInput) return;
		const cleaned = sanitizeDecimalValue(cpcInput.value, { maxDecimals: 2 });
		cpcInput.value = cleaned;
		updateResults();
	}

	function sanitizeCr() {
		if (!crInput) return;
		const cleaned = sanitizeDecimalValue(crInput.value, { maxDecimals: 2, maxValue: 100 });
		crInput.value = cleaned;
		updateResults();
	}

	function toggleTooltip(e) {
		const trigger = e.currentTarget;
		if (!trigger) return;

		const t = trigger.nextElementSibling;
		if (!t) return;

		const isHidden = t.hasAttribute("hidden") || t.style.display === 'none';

		document.querySelectorAll(".tooltip-text").forEach(el => {
			el.setAttribute("hidden", "");
		});

		if (isHidden) {
			t.removeAttribute("hidden");
		} else {
			t.setAttribute("hidden", "");
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleTooltip(e);
		}
	}

	window.toggleTooltip = toggleTooltip;
	window.handleKeyDown = handleKeyDown;

	if (cpcInput) {
		cpcInput.addEventListener('keydown', decimalKeyFilter);
		cpcInput.addEventListener('input', function () {
			updateResults();
		});
		cpcInput.addEventListener('blur', sanitizeCpc);
	}

	if (crInput) {
		crInput.addEventListener('keydown', decimalKeyFilter);

		crInput.addEventListener('input', function () {
			const raw = crInput.value;

			const hintNeeded = /^0[.,]/.test(raw) || raw === '0';
			if (document.activeElement === crInput && hintNeeded) {
				showCrHint(true);
			} else if (document.activeElement === crInput) {
				showCrHint(false);
			}

			updateResults();
		});

		crInput.addEventListener('blur', function () {
			showCrHint(false);
			sanitizeCr();
		});

		crInput.addEventListener('focus', function () {
			const raw = crInput.value;
			const hintNeeded = /^0[.,]/.test(raw) || raw === '0';
			showCrHint(hintNeeded);
		});
	}
});
