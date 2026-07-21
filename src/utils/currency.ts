/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number or string using the Indian numbering system (Lakh/Crore)
 * and prepends the Indian Rupee symbol (₹).
 * 
 * Examples:
 * 50000 -> ₹50,000
 * 125000 -> ₹1,25,000
 * 850000 -> ₹8,50,000
 * 1250000 -> ₹12,50,000
 */
export function formatINR(value: number | string | undefined | null): string {
  if (value === undefined || value === null) {
    return '₹0';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '₹0';
  }
  const rounded = Math.round(num);
  return `₹${rounded.toLocaleString('en-IN')}`;
}
