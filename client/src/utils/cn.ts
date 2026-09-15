// client/src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently.
 * - `clsx` handles conditional classes
 * - `twMerge` resolves Tailwind conflicts (e.g., 'p-2 p-4' → 'p-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}