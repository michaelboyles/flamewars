import React from 'react';
import { useContext } from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../config'
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

import './SignIn.scss';

// This looks a bit silly. In order to show the user as logged in on page-load, we need to set GoogleLogin's
// isSignedInto prop to true. But doing so causes a bug which requires the user to click logout twice to show
// as logged out. We can hack it with a function which returns true once, then false thereafter.
let called = false;
function trueOnce() {
    return (!called) ? (called = true) : false;
}

export const SignIn = () => {
    const { setAuthorization, setUser } = useContext(AuthContext);

    const onSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        if (!response.code) { // i.e. is GoogleLoginResponse
            const loginResponse = response as GoogleLoginResponse;
            setAuthorization({
                token: loginResponse.tokenId,
                tokenProvider: 'Google'
            });
            setUser({
                id: 'GOOGLE/' + loginResponse.getId(),
                name: loginResponse.getBasicProfile().getName()
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
                            <button className='sign-in-button' onClick={renderProps.onClick}><FcGoogle className='icon' />Google</button>
                        </li>
                    )}
                />
            </ul>
        </div>
    );
}
