export const MASK_CEP = '00000-000';
export const MASK_PHONE_BR = 'phone-br';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function applyMask(digits: string, mask: string): string {
  let result = '';
  let digitIndex = 0;

  for (const char of mask) {
    if (digitIndex >= digits.length) {
      break;
    }

    if (char === '0') {
      result += digits[digitIndex++];
      continue;
    }

    result += char;
  }

  return result;
}

export function applyPhoneBrMask(digits: string): string {
  const limited = digits.slice(0, 11);

  if (limited.length === 0) {
    return '';
  }

  if (limited.length <= 2) {
    return `(${limited}`;
  }

  if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }

  if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  }

  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

export function formatWithMask(value: string, mask: string): string {
  const digits = onlyDigits(value);

  if (mask === MASK_PHONE_BR) {
    return applyPhoneBrMask(digits);
  }

  return applyMask(digits, mask);
}

export function countDigitsBeforeIndex(value: string, index: number): number {
  return onlyDigits(value.slice(0, index)).length;
}

export function indexAfterDigits(maskedValue: string, mask: string, digitCount: number): number {
  if (digitCount <= 0) {
    return 0;
  }

  let digitsSeen = 0;

  for (let index = 0; index < maskedValue.length; index++) {
    if (/\d/.test(maskedValue[index])) {
      digitsSeen++;
      if (digitsSeen === digitCount) {
        return index + 1;
      }
    }
  }

  return maskedValue.length;
}
