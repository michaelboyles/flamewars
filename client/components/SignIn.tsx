import React = require('react');
import { useContext } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import type { Authorization } from '../../common/types/add-comment-request';
import { GOOGLE_CLIENT_ID } from '../../config'
import { AuthContext } from '../context/AuthContext';
import GoogleIcon from './GoogleIcon';

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

export const SignIn = () => {
    const { setAuthorization } = useContext(AuthContext);

    return (
        <div className='sign-in'>
            <span className='label'>Sign in to comment:</span>
            <ul className='choices'>
                <GoogleLogin 
                    clientId={GOOGLE_CLIENT_ID}
                    onSuccess={resp => setAuthorization({
                        token: (resp as GoogleLoginResponse).tokenId, //TODO how to remove 'as'?
                        tokenProvider: 'Google',
                        name: (resp as GoogleLoginResponse).getBasicProfile().getName(),
                        id: (resp as GoogleLoginResponse).getId()
                    })} 
                    isSignedIn={true}
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
