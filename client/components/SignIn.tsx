import React = require('react');
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import type { Authorization } from '../../dist/post-comment-request';

export interface LocalAuthorization extends Authorization
{
    name: string;
}

export const SignIn = (props: {authorization: LocalAuthorization, setAuthorization: (LocalAuthorization) => void }) => {
    return props.authorization ? 
        <span>Signed in as {props.authorization.name}</span>
        :
        <GoogleLogin 
            clientId='164705233134-movagpgcoeepgc24qksgil15k2qpde8e.apps.googleusercontent.com'
            onSuccess={resp => props.setAuthorization({
                token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                tokenProvider: 'Google',
                name: (resp as GoogleLoginResponse).getBasicProfile().getName()
            })} 
            isSignedIn={true}
        />
}
