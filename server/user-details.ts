import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = '164705233134-movagpgcoeepgc24qksgil15k2qpde8e.apps.googleusercontent.com';

export type UserDetails = {
    userId: string;
    name: string;
}

export const getGoogleDetails = async (token: string): Promise<UserDetails> => {
    const client = new OAuth2Client(CLIENT_ID);

    const loginTicket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = loginTicket.getPayload();
    return {
        userId: payload.sub,
        name: payload.given_name ? payload.given_name : 'Anonymous'
    }
}