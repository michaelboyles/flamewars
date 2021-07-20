import { LocalAuthorization } from './components/SignIn';
import { normalizeUrl } from '../common/util';

import type { Comment } from '../common/types/get-all-comments-response';

export function isOwner(authorization: LocalAuthorization, comment: Comment) {
    return (!!authorization) && comment.author.id.endsWith(authorization.id);
};

export function encodedWindowUrl() {
    return encodeURIComponent(normalizeUrl(window.location.toString()));
}

export function formatPastDate(timestamp: Date) {
    const now = new Date();
    const age = Math.abs(now.getTime() - timestamp.getTime());

    const millisPerSecond = 1000;
    const millisPerMinute = millisPerSecond * 60;
    const millisPerHour   = millisPerMinute * 60;
    const millisPerDay    = millisPerHour * 24;
    const millisPerMonth  = millisPerDay * 30;
    const millisPerYear   = millisPerDay * 365;

    let unit: string;
    let quantity: number;
    if (age < millisPerMinute) {
        unit = 'second';
        quantity = Math.floor(age / millisPerSecond);
        if (quantity < 10) {
            return 'Just now';
        }
    }
    else if (age < millisPerHour) {
        unit = 'minute';
        quantity = Math.floor(age / millisPerMinute);
    }
    else if (age < millisPerDay) {
        unit = 'hour';
        quantity = Math.floor(age / millisPerHour);
    }
    else if (age < millisPerMonth) {
        unit = 'day';
        quantity = Math.floor(age / millisPerDay);
    }
    else if (age < millisPerYear) {
        unit = 'month';
        quantity = Math.floor(age / millisPerMonth);
    }
    else {
        unit = 'year';
        quantity = Math.floor(age / millisPerYear);
    }
    return `${quantity} ${unit}${quantity == 1 ? '' : 's'} ago`; 
}

export function formatFullTime(timestamp: Date) {
    const isoDatetime = timestamp.toISOString();
    return isoDatetime
        .substr(0, isoDatetime.length - 5) // period, 3 digit millis, and Z
        .replace('T', ' ');
}
