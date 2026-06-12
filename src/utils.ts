import { CustomerType } from './types';

/**
 * Formats a numeric ID to left-pad with zeros, starting at "000".
 * E.g., 0 => "000", 1 => "001", 10 => "010", 100 => "100"
 */
export function formatId(num: number): string {
  if (num < 0) return '000';
  return String(num).padStart(3, '0');
}

/**
 * Calculates the water billing amount details based on readings, customer type, and other selections.
 */
export interface CalculationResult {
  consumed: number;
  basePayable: number;
  totalPayable: number;
  isValid: boolean;
  error?: string;
}

export function calculateBill(
  previous: number,
  present: number,
  others: number[]
): CalculationResult {
  const previousNum = Number(previous) || 0;
  const presentNum = Number(present) || 0;

  if (presentNum < previousNum) {
    return {
      consumed: 0,
      basePayable: 0,
      totalPayable: 0,
      isValid: false,
      error: 'Present reading cannot be less than previous reading.',
    };
  }

  const consumed = presentNum - previousNum;
  let basePayable = 0;

  if (consumed < 3) {
    basePayable = 100 + 10; // 110
  } else {
    basePayable = (consumed * 30) + 10;
  }

  const othersSum = others.reduce((acc, curr) => acc + curr, 0);
  const totalPayable = Math.max(0, basePayable + othersSum); // Ensure total payable doesn't go negative

  return {
    consumed,
    basePayable,
    totalPayable,
    isValid: true,
  };
}
