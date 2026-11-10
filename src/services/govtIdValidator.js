/**
 * Official Indian Government ID Formatters & Regex + Checksum Validators
 */

// UIDAI Verhoeff Multiplication & Permutation Matrices for Aadhaar Validation
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates a 12-digit Aadhaar number against UIDAI's Verhoeff checksum algorithm
 */
export function validateVerhoeffChecksum(aadhaarDigits) {
  let c = 0;
  const invertedArray = aadhaarDigits.split('').map(Number).reverse();
  for (let i = 0; i < invertedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][invertedArray[i]]];
  }
  return c === 0;
}

// Official Strict Regex Rules for Indian Govt IDs
export const GOVT_ID_REGEX = {
  // Aadhaar: 12 digits, cannot start with 0 or 1, no all-repeating digits
  'Aadhaar Card': {
    rawPattern: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
    formattedPattern: /^[2-9]{1}[0-9]{3}-[0-9]{4}-[0-9]{4}$/,
    example: '5621-8902-3344',
    description: '12 Digits (cannot start with 0 or 1, valid UIDAI checksum)',
    formatHint: 'XXXX-XXXX-XXXX'
  },

  // PAN Card: 5 uppercase letters, 4 digits, 1 uppercase letter
  // 4th char is entity status (P, C, H, F, A, T, B, L, J, G)
  'PAN Card': {
    rawPattern: /^[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]$/,
    formattedPattern: /^[A-Z]{3}[PCHFATBLJG][A-Z]-[0-9]{4}-[A-Z]$/,
    example: 'ABCDE-1234-F',
    description: '10 Characters (5 Letters, 4 Digits, 1 Letter)',
    formatHint: 'XXXXX-XXXX-X'
  },

  // Passport: 1 uppercase letter followed by 7 digits
  'Passport': {
    rawPattern: /^[A-PR-WYa-pr-wyZz][1-9][0-9]{6}$/,
    formattedPattern: /^[A-Z]-[0-9]{4}-[0-9]{3}$/,
    example: 'A-1234-567',
    description: '1 Letter followed by 7 Digits',
    formatHint: 'X-XXXX-XXX'
  },

  // Voter ID (EPIC): 3 uppercase letters followed by 7 digits
  'Voter ID': {
    rawPattern: /^[A-Z]{3}[0-9]{7}$/,
    formattedPattern: /^[A-Z]{3}-[0-9]{4}-[0-9]{3}$/,
    example: 'ABC-1234-567',
    description: '3 Letters followed by 7 Digits',
    formatHint: 'XXX-XXXX-XXX'
  },

  // Driving License: 2 state letters, 2 RTO digits, 4 year digits, 7 license digits
  'Driving License': {
    rawPattern: /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/,
    formattedPattern: /^[A-Z]{2}-[0-9]{2}-[0-9]{4}-[0-9]{7}$/,
    example: 'DL-04-2011-0012345',
    description: 'State Code + RTO + Year + 7-digit Serial',
    formatHint: 'XX-XX-YYYY-NNNNNNN'
  }
};

/**
 * Live formatting helper as user types
 */
export function formatIdNumber(idType, rawValue) {
  if (!rawValue) return '';
  const clean = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '');

  switch (idType) {
    case 'Aadhaar Card': {
      const digitsOnly = clean.replace(/\D/g, '').slice(0, 12);
      const parts = [];
      for (let i = 0; i < digitsOnly.length; i += 4) {
        parts.push(digitsOnly.slice(i, i + 4));
      }
      return parts.join('-');
    }

    case 'PAN Card': {
      const letters1 = clean.slice(0, 5).replace(/[^A-Z]/g, '');
      const digits = clean.slice(5, 9).replace(/\D/g, '');
      const letterLast = clean.slice(9, 10).replace(/[^A-Z]/g, '');

      let res = letters1;
      if (digits.length > 0) res += '-' + digits;
      if (letterLast.length > 0) res += '-' + letterLast;
      return res;
    }

    case 'Passport': {
      const firstLetter = clean.slice(0, 1).replace(/[^A-Z]/g, '');
      const digits = clean.slice(1, 8).replace(/\D/g, '');
      if (firstLetter && digits.length > 0) {
        if (digits.length > 4) {
          return `${firstLetter}-${digits.slice(0, 4)}-${digits.slice(4)}`;
        }
        return `${firstLetter}-${digits}`;
      }
      return firstLetter;
    }

    case 'Voter ID': {
      const prefix = clean.slice(0, 3).replace(/[^A-Z]/g, '');
      const digits = clean.slice(3, 10).replace(/\D/g, '');
      if (prefix && digits.length > 0) {
        if (digits.length > 4) {
          return `${prefix}-${digits.slice(0, 4)}-${digits.slice(4)}`;
        }
        return `${prefix}-${digits}`;
      }
      return prefix;
    }

    case 'Driving License': {
      const state = clean.slice(0, 2).replace(/[^A-Z]/g, '');
      const rto = clean.slice(2, 4).replace(/\D/g, '');
      const year = clean.slice(4, 8).replace(/\D/g, '');
      const num = clean.slice(8, 15).replace(/\D/g, '');

      const parts = [];
      if (state) parts.push(state);
      if (rto) parts.push(rto);
      if (year) parts.push(year);
      if (num) parts.push(num);
      return parts.join('-');
    }

    default:
      return clean;
  }
}

export function getIdPlaceholder(idType) {
  const rule = GOVT_ID_REGEX[idType];
  if (rule) {
    return `${rule.formatHint} (e.g. ${rule.example})`;
  }
  return 'XXXX-XXXX-XXXX';
}

/**
 * Strict Regex & Checksum Validator for Government ID numbers
 */
export function validateGovtId(idType, idValue) {
  const val = (idValue || '').trim().toUpperCase();
  if (!val) {
    return { valid: false, message: 'ID Number is required' };
  }

  const clean = val.replace(/[\s-]/g, '');
  const rule = GOVT_ID_REGEX[idType];

  if (!rule) {
    return {
      valid: clean.length >= 4,
      formatted: val,
      message: clean.length >= 4 ? '' : 'ID must be at least 4 characters'
    };
  }

  // 1. Basic format / length checks
  const isFormattedValid = rule.formattedPattern.test(val);
  const isRawValid = rule.rawPattern.test(clean);

  if (!isFormattedValid && !isRawValid) {
    switch (idType) {
      case 'Aadhaar Card':
        if (clean.startsWith('0') || clean.startsWith('1')) {
          return { valid: false, message: 'Invalid Aadhaar: UIDAI numbers cannot start with 0 or 1' };
        }
        if (clean.length !== 12) {
          return { valid: false, message: `Aadhaar must be exactly 12 digits (entered ${clean.length})` };
        }
        return { valid: false, message: `Invalid Aadhaar format. Required: ${rule.formatHint} (e.g. ${rule.example})` };

      case 'PAN Card':
        if (clean.length !== 10) {
          return { valid: false, message: `PAN must be exactly 10 characters (entered ${clean.length})` };
        }
        return { valid: false, message: `Invalid PAN format. Required: 5 Letters + 4 Digits + 1 Letter (e.g. ${rule.example})` };

      case 'Passport':
        if (clean.length !== 8) {
          return { valid: false, message: `Passport must be 1 letter + 7 digits (entered ${clean.length})` };
        }
        return { valid: false, message: `Invalid Passport format. Required: ${rule.formatHint} (e.g. ${rule.example})` };

      case 'Voter ID':
        if (clean.length !== 10) {
          return { valid: false, message: `Voter ID must be 3 letters + 7 digits (entered ${clean.length})` };
        }
        return { valid: false, message: `Invalid Voter ID format. Required: ${rule.formatHint} (e.g. ${rule.example})` };

      case 'Driving License':
        if (clean.length !== 15) {
          return { valid: false, message: `Driving License must be 15 characters (entered ${clean.length})` };
        }
        return { valid: false, message: `Invalid Driving License format. Required: ${rule.formatHint} (e.g. ${rule.example})` };

      default:
        return { valid: false, message: `Invalid ID Number format for ${idType}` };
    }
  }

  // 2. Extra Aadhaar Strict Check: Block fake all-repeating digits (e.g. 2222-2222-2222)
  if (idType === 'Aadhaar Card') {
    // Check for repetitive digits (e.g. 2222 2222 2222 or 3333 3333 3333)
    if (/^(\d)\1{11}$/.test(clean)) {
      return {
        valid: false,
        message: 'Invalid Aadhaar Number'
      };
    }

    // Check for obvious sequential digits (e.g. 1234 5678 9012)
    if (clean === '234567890123' || clean === '123456789012') {
      return {
        valid: false,
        message: 'Invalid Aadhaar Number'
      };
    }

    // UIDAI Official Verhoeff Mathematical Checksum algorithm validation
    const hasValidChecksum = validateVerhoeffChecksum(clean);
    if (!hasValidChecksum) {
      return {
        valid: false,
        message: 'Invalid Aadhaar Number'
      };
    }
  }

  // 3. Extra PAN Card Strict Check: Block all-repeating letters or dummy sequences
  if (idType === 'PAN Card') {
    if (/^([A-Z])\1{4}/.test(clean)) {
      return {
        valid: false,
        message: 'Invalid PAN: First 5 letters cannot be all identical repeating characters'
      };
    }
  }

  return {
    valid: true,
    formatted: formatIdNumber(idType, clean),
    raw: clean,
    idType
  };
}
