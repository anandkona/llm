/**
 * Sanitizes and validates email format
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength (min 8 chars, at least 1 letter and 1 number)
 */
export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Sanitizes string inputs by trimming and removing null bytes
 */
export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/\0/g, '').trim();
}

/**
 * Validates integer ID parameters (positive numbers)
 */
export function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}
