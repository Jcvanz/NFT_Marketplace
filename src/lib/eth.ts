import BigNumber from 'bignumber.js';

// Configure BigNumber for Ethereum decimal precision (18 decimal places)
BigNumber.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-18, 20],
});

/**
 * Parses an ETH string or number safely into a BigNumber
 */
export function toBigNumber(val: string | number): BigNumber {
  try {
    return new BigNumber(val || '0');
  } catch {
    return new BigNumber('0');
  }
}

/**
 * Adds two ETH values with exact precision, returning a decimal string
 */
export function addEth(a: string | number, b: string | number): string {
  return toBigNumber(a).plus(toBigNumber(b)).toFixed();
}

/**
 * Subtracts b from a with exact precision (not going below 0), returning a decimal string
 */
export function subEth(a: string | number, b: string | number): string {
  const res = toBigNumber(a).minus(toBigNumber(b));
  return res.isNegative() ? '0' : res.toFixed();
}

/**
 * Multiplies unit price in ETH by integer quantity
 */
export function multiplyEth(unitPriceEth: string | number, quantity: number): string {
  return toBigNumber(unitPriceEth).times(quantity).toFixed();
}

/**
 * Formats an ETH string for presentation (e.g. "0.45 ETH" or "0.00 ETH")
 */
export function formatEth(val: string | number, maxDecimals: number = 4): string {
  const bn = toBigNumber(val);
  if (bn.isNaN() || bn.isZero()) return '0.00 ETH';
  
  // Format with up to maxDecimals for clean display without trailing zeroes
  const str = bn.decimalPlaces(maxDecimals, BigNumber.ROUND_DOWN).toString();
  return `${str} ETH`;
}

/**
 * Checks if balance is sufficient to cover total
 */
export function hasSufficientBalance(balanceEth: string | number, totalEth: string | number): boolean {
  return toBigNumber(balanceEth).isGreaterThanOrEqualTo(toBigNumber(totalEth));
}

