import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const str = {
    title: (v: string) => v.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),

    plural: (v: string, count: number) => v.concat(count !== 1 ? 's' : '')
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function match<T = unknown>(value: string, obj: { [key: string]: T }) {
    if (obj[value]) { return obj[value]; }
    return obj.default || null;
}

export function humanReadableDateTime(targetDate: number | string | Date | undefined) {
    if (!targetDate) {
        return '-';
    }

    const now = new Date();

    // Fix: Ensure string dates are treated as UTC if they lack timezone info
    // If your server sends local time, remove the .replace(...) + 'Z' part.
    let target: Date;
    if (typeof targetDate === 'string' && !targetDate.includes('Z') && !targetDate.includes('+')) {
        target = new Date(`${targetDate.replace(' ', 'T')}Z`);
    } else {
        target = new Date(targetDate);
    }

    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDay = now.getDate();

    const targetYear = target.getFullYear();
    const targetMonth = target.getMonth();
    const targetDay = target.getDate();

    // Fix: Extract time from TARGET, not NOW
    const timeString = target.toLocaleTimeString();

    if (nowYear === targetYear && nowMonth === targetMonth && nowDay === targetDay) {
        return `Today, ${timeString}`;
    }
    else if (nowYear === targetYear) {
        const monthName = now.toLocaleString('default', { month: 'long' });
        return `${monthName} ${targetDay}, ${timeString}`; // Use targetDay
    }
    else {
        const monthName = now.toLocaleString('default', { month: 'long' });
        return `${monthName} ${targetDay}, ${targetYear} ${timeString}`; // Use targetDay/Year
    }
}
