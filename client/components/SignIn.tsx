import React = require('react');
import { useContext } from 'react';
import GoogleLogin, { GoogleLoginResponse, useGoogleLogout } from 'react-google-login';
import type { Authorization } from '../../common/types/add-comment-request';
import { GOOGLE_CLIENT_ID } from '../../config'
import { AuthContext } from '../context/AuthContext';
import GoogleIcon from './GoogleIcon';

export interface LocalAuthorization extends Authorization
{
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
    const { authorization, setAuthorization } = useContext(AuthContext);

    const { signOut: googleSignOut } = useGoogleLogout({clientId: GOOGLE_CLIENT_ID});
    const signOut = () => { googleSignOut(); setAuthorization(null); }

    return authorization ? 
        <span>Signed in as {authorization.name} <a onClick={signOut}>(sign out)</a></span>
        :
        <>
            Sign in via: 
            <GoogleLogin 
                clientId={GOOGLE_CLIENT_ID}
                onSuccess={resp => setAuthorization({
                    token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                    tokenProvider: 'Google',
                    name: (resp as GoogleLoginResponse).getBasicProfile().getName(),
                    id: (resp as GoogleLoginResponse).getId()
                })} 
                isSignedIn={true}
                render={renderProps => (
                    <a className='sign-in-icon' onClick={renderProps.onClick} title='Google'><GoogleIcon color='#222' /></a>
                )}
            />
        </>
}
