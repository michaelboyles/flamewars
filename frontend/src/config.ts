export type Config = {
    /**
     * The AWS API URL which was automatically generated as part of CloudFormation deployment. Mandatory.
     */
    awsUrl: string;
    /**
     * The Google client ID to use for authorization. Either this must be present, or specified via a meta tag:
     * https://developers.google.com/identity/sign-in/web/sign-in#specify_your_apps_client_id. 
     * This takes precedence over the meta tag.
     */
    googleClientId?: string;

    /**
     * The ID of the HTML element which comments should be inserted into. Default: "comments"
     */
    htmlContainerId?: string;
    /**
     * Whether to allow images inserted into comments (involves hotlinking to other domains). Default: false
     */
    allowImages?: boolean;
    /**
     * The message to display when a comment has been deleted. Default: "Comment was deleted" 
     */
    deletedMessage?: string;
    /**
     * Whether to use infinite scroll to load more comments when comments are paginated. If false, there's
     * a button to load more. Default: true
     */
    useInfiniteScroll?: boolean;
    /**
     * Whether to include a link to FlameWars' GitHub repo. Default: true
     */
    displayGitHubLink?: boolean;
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
export const DISPLAY_GITHUB_LINK = __FLAMEWARS_CONFIG.displayGitHubLink ?? true;
