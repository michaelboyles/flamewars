export function normalizeUrl(url: string) {
    const withoutFragment = url.split('#')[0];
    if (withoutFragment.startsWith('https')) {
        return 'http' + withoutFragment.substr(5);
    }
    return withoutFragment;
}