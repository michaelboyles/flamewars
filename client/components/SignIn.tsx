import React = require('react');
import { useContext } from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import type { Authorization } from '../../common/types/add-comment-request';
import { GOOGLE_CLIENT_ID } from '../config'
import { AuthContext } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';

import './SignIn.scss';

export interface LocalAuthorization extends Authorization {
    name: string;
    id: string;
}

export function onlyAuthorization(localAuth: LocalAuthorization): Authorization {
    return {
        token: localAuth.token,
        tokenProvider: localAuth.tokenProvider
    }
}

// This looks a bit silly. In order to show the user as logged in on page-load, we need to set GoogleLogin's
// isSignedInto prop to true. But doing so causes a bug which requires the user to click logout twice to show
// as logged out. We can hack it with a function which returns true once, then false thereafter.
let called = false;
function trueOnce() {
    return (!called) ? (called = true) : false;
}

export const SignIn = () => {
    const { setAuthorization } = useContext(AuthContext);

    const onSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        if (!response.code) { // i.e. is GoogleLoginResponse
            const loginResponse = response as GoogleLoginResponse;
            setAuthorization({
                token: loginResponse.tokenId,
                tokenProvider: 'Google',
                name: loginResponse.getBasicProfile().getName(),
                id: loginResponse.getId()
            });
        }
    };

    return (
        <div className='sign-in'>
            <span className='label'>Sign in to comment:</span>
            <ul className='choices'>
                <GoogleLogin 
                    clientId={GOOGLE_CLIENT_ID}
                    onSuccess={onSuccess}
                    isSignedIn={trueOnce()}
                    render={renderProps => (
                        <li>
                            <button className='sign-in-button' onClick={renderProps.onClick}><GoogleIcon className='icon' />Google</button>
                        </li>
                    )}
                />
            </ul>
        </div>
    );
}
