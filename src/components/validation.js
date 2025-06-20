/**
 * Removes all non-numeric or non-decimal characters depending on `type`,
 * limits decimal precision or length, and returns the cleaned string.
 * 
 * @param {string | number} value - Current input value.
 * @param {string} type - 'int' or 'float'.
 * @param {number} slice - Maximum length or decimal precision.
 * @returns {string} Cleaned string representing the value.
 */
export function validateData(value, type, slice = 0) {
  let stringVal = String(value);

  let allowedChars;
  let dotAllowed = false;

  if (type === 'int') {
    allowedChars = '0-9';
  } else if (type === 'float') {
    allowedChars = '0-9.';
    dotAllowed = true;
  } else {
    throw new Error('Invalid type specified');
  }

  // Remove any disallowed characters
  const reg = new RegExp(`[^${allowedChars}]`, 'g');
  stringVal = stringVal.replace(reg, '');

  // Only one dot is allowed in a float
  if (dotAllowed) {
    const dotIndex = stringVal.indexOf('.');
    if (dotIndex !== -1) {
      const integerPart = stringVal.slice(0, dotIndex);
      const decimalPart = stringVal.slice(dotIndex + 1);
      stringVal = `${integerPart}.${decimalPart.replace(/\./g, '')}`;
    }
  }

  // Limit decimal places or integer length
  if (type === 'float' && stringVal.includes('.') && slice > 0) {
    const [intPart, decPart] = stringVal.split('.');
    stringVal = `${intPart}.${decPart.slice(0, slice)}`;
  } else if (type === 'int' && slice > 0) {
    stringVal = stringVal.slice(0, slice);
  }

  return stringVal;
}

/**
 * Returns the number of decimal places for a given step size (e.g. 0.01 => 2).
 */
export function getDecimalPlaces(step) {
  const stepStr = step.toString();
  if (!stepStr.includes('.')) return 0;
  return stepStr.length;
}

/**
 * Clamps input.value to [min, max], snaps to nearest step,
 * and updates input.value accordingly.
 * 
 * @param {HTMLInputElement} input - The text input element.
 * @param {string} type - 'int' or 'float'.
 * @param {Array} numberRange - [min, max, step].
 */
export function validateInput(input, type, numberRange) {
  let val = input.value;

  if (type === 'int') {
    const maxDigits = numberRange[1].toString().length;
    val = validateData(val, 'int', maxDigits);
    val = parseInt(val, 10);
  } else if (type === 'float') {
    const step = numberRange[2];
    const decimalPlaces = getDecimalPlaces(step);
    val = validateData(val, 'float', decimalPlaces);
    val = parseFloat(val);
  }

  if (!isNaN(val)) {
    const [minVal, maxVal, stepVal] = numberRange;
    val = Math.min(Math.max(val, minVal), maxVal);
    const stepped = Math.round((val - minVal) / stepVal) * stepVal + minVal;
    val = Math.min(stepped, maxVal);
    input.value = val;
  } else {
    input.value = '';
  }
}
