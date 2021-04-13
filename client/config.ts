export type Config = {
    awsUrl: string;
    allowImages?: boolean;
};

declare var __FLAMEWARS_CONFIG: Config;

if (!__FLAMEWARS_CONFIG?.awsUrl) {
    console.error('You must specify an AWS url in your Flamewars configuration');
}

export const AWS_GET_URL = __FLAMEWARS_CONFIG.awsUrl;
export const ALLOW_IMAGES = __FLAMEWARS_CONFIG.allowImages ?? true;
