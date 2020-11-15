import React = require('react');
import GoogleLogin, { GoogleLoginResponse, useGoogleLogout } from 'react-google-login';
import type { Authorization } from '../../dist/post-comment-request';
import { GOOGLE_CLIENT_ID } from '../../config'
import { GoogleIcon } from './GoogleIcon';

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

export const SignIn = (props: {authorization: LocalAuthorization, setAuthorization: (la: LocalAuthorization) => void }) => {
    const { signOut: googleSignOut } = useGoogleLogout({clientId: GOOGLE_CLIENT_ID});
    const signOut = () => { googleSignOut(); props.setAuthorization(null); }

    return props.authorization ? 
        <span>Signed in as {props.authorization.name} <a onClick={signOut}>(sign out)</a></span>
        :
        <>
            Sign in via: 
            <GoogleLogin 
                clientId={GOOGLE_CLIENT_ID}
                onSuccess={resp => props.setAuthorization({
                    token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                    tokenProvider: 'Google',
                    name: (resp as GoogleLoginResponse).getBasicProfile().getName(),
                    id: (resp as GoogleLoginResponse).getId()
                })} 
                isSignedIn={props.authorization !== null}
                render={renderProps => (
                    <a className='sign-in-icon' onClick={renderProps.onClick} title='Google'><GoogleIcon color='#222' /></a>
                )}
            />
        </>
}
