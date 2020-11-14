import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config';

export type UserDetails = {
    userId: string;
    name: string;
}

export type AuthenticationResult = {
    isValid: boolean;
    userDetails?: UserDetails;
}

export const getGoogleDetails = async (token: string): Promise<AuthenticationResult> => {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    try {
        const loginTicket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = loginTicket.getPayload();
        return {
            isValid: true,
            userDetails: {
                userId: 'GOOGLE/' + payload.sub,
                name: payload.given_name ? payload.given_name : 'Anonymous'
            }
        }
    }
    catch (error) {
        return {
            isValid: false
        }
    }
}
