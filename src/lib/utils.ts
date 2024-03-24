import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomNumber(maxDigit = 10): number {
  return Math.floor(Math.random() * maxDigit);
}

export function generateRandomNumberLessThan(
  maxDigit = 10,
  lessThan?: number
): number {
  const upperLimit = lessThan ? Math.min(lessThan, maxDigit) : maxDigit;
  const randomNumber = Math.floor(Math.random() * upperLimit);

  return randomNumber;
}
