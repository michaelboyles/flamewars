import React = require('react');
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import type { Authorization } from '../../dist/post-comment-request';
import { GOOGLE_CLIENT_ID } from '../../config'

export interface LocalAuthorization extends Authorization
{
    name: string;
}

export const SignIn = (props: {authorization: LocalAuthorization, setAuthorization: (LocalAuthorization) => void }) => {
    return props.authorization ? 
        <span>Signed in as {props.authorization.name}</span>
        :
        <GoogleLogin 
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={resp => props.setAuthorization({
                token: (resp as GoogleLoginResponse).tokenId,   //TODO how to remove 'as'?
                tokenProvider: 'Google',
                name: (resp as GoogleLoginResponse).getBasicProfile().getName()
            })} 
            isSignedIn={true}
        />
}
