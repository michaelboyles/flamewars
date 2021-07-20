export type Config = {
    awsUrl: string;
    allowImages?: boolean;
    deletedMessage?: string;
    googleClientId?: string;
    htmlContainerId?: string;
    useInfiniteScroll?: boolean;
};

declare var __FLAMEWARS_CONFIG: Config;

if (!__FLAMEWARS_CONFIG?.awsUrl) {
    console.error('You must specify an AWS url in your Flamewars configuration');
}

const metaGoogleId = window.document.head.querySelector('meta[name~=google-signin-client_id]')?.getAttribute('content');

if (!__FLAMEWARS_CONFIG.googleClientId && !metaGoogleId) {
    console.error('You must specify a Google client ID, either in a <meta /> element, or as part of Flamewars configuration');
}

export const AWS_GET_URL = __FLAMEWARS_CONFIG.awsUrl;
export const ALLOW_IMAGES = __FLAMEWARS_CONFIG.allowImages ?? true;
export const DELETED_MESSAGE = __FLAMEWARS_CONFIG.deletedMessage ?? 'Comment was deleted';
export const GOOGLE_CLIENT_ID = __FLAMEWARS_CONFIG.googleClientId ?? metaGoogleId;
export const HTML_CONTAINER_ID = __FLAMEWARS_CONFIG.htmlContainerId ?? 'comments';
export const USE_INFINITE_SCROLL = !!window.IntersectionObserver && (__FLAMEWARS_CONFIG.useInfiniteScroll ?? true);
