import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmailString(
  userEmail: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  },
  opts: { includeFullEmail: boolean } = { includeFullEmail: false },
) {
  if (userEmail.firstName && userEmail.lastName) {
    return `${userEmail.firstName} ${userEmail.lastName} ${
      opts.includeFullEmail ? `<${userEmail.email}>` : ''
    }`;
  }
  return userEmail.email;
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt: string) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}
