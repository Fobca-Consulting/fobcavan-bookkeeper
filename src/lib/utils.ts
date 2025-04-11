
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with thousand separators
 * @param amount The amount to format
 * @param currencyCode The currency code (e.g., "USD", "EUR")
 * @param currencies Optional array of currency objects with code, symbol and other properties
 * @returns Formatted currency string with symbol and thousand separators
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string, 
  currencies?: Array<{ code: string; symbol: string; }>
): string {
  // Find currency symbol if currencies array is provided
  let symbol = "$";
  if (currencies) {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency) {
      symbol = currency.symbol;
    }
  }
  
  // Format with thousand separators using Intl.NumberFormat
  return `${symbol}${new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currencyCode}`;
}

