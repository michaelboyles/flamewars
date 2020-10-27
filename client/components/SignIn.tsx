import React = require('react');
import GoogleLogin, { GoogleLoginResponse, useGoogleLogout } from 'react-google-login';
import type { Authorization } from '../../dist/post-comment-request';
import { GOOGLE_CLIENT_ID } from '../../config'

export interface LocalAuthorization extends Authorization
{
    name: string;
    id: string;
}

export const SignIn = (props: {authorization: LocalAuthorization, setAuthorization: (la: LocalAuthorization) => void }) => {
    const { signOut: googleSignOut } = useGoogleLogout({clientId: GOOGLE_CLIENT_ID});
    const signOut = () => { googleSignOut(); props.setAuthorization(null); }
    return props.authorization ? 
        <span>Signed in as {props.authorization.name} <a onClick={signOut}>(sign out)</a></span>
        :
        <GoogleLogin 
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={resp => props.setAuthorization({
                token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                tokenProvider: 'Google',
                name: (resp as GoogleLoginResponse).getBasicProfile().getName(),
                id: (resp as GoogleLoginResponse).getId()
            })} 
            isSignedIn={true}
        />
}
