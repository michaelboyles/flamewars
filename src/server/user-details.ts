import { OAuth2Client } from 'google-auth-library';
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    try {
        const loginTicket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
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
    if (!authorization?.token || !authorization?.tokenProvider) {
        return Promise.resolve({isValid: false});
    }
    switch (authorization.tokenProvider) {
        case 'Google':
            return getGoogleDetails(authorization.token);
        default: 
            throw new Error('Unsupported token provider ' + authorization.tokenProvider);
    }
}
