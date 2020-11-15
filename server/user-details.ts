import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config';
import { Authorization } from '../common/types/authorization';

export type UserDetails = {
    userId: string;
    name: string;
}

export type AuthenticationResult = {
    isValid: boolean;
    userDetails?: UserDetails;
}

const getGoogleDetails = async (token: string): Promise<AuthenticationResult> => {
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

export function checkAuthentication(authorization: Authorization): Promise<AuthenticationResult> {
    switch (authorization.tokenProvider) {
        case 'Google':
            return getGoogleDetails(authorization.token);
        default: 
            throw new Error('Unsupported token provider ' + authorization.tokenProvider);
    }
}
