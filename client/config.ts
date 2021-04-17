export type Config = {
    awsUrl: string;
    allowImages?: boolean;
    deletedMessage?: string;
};

declare var __FLAMEWARS_CONFIG: Config;

if (!__FLAMEWARS_CONFIG?.awsUrl) {
    console.error('You must specify an AWS url in your Flamewars configuration');
}

export const AWS_GET_URL = __FLAMEWARS_CONFIG.awsUrl;
export const ALLOW_IMAGES = __FLAMEWARS_CONFIG.allowImages ?? true;
export const DELETED_MESSAGE = __FLAMEWARS_CONFIG.deletedMessage ?? 'Comment was deleted';
