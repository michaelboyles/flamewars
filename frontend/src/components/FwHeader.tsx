import React from 'react';
import { useContext } from 'react';
import { useGoogleLogout } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../config';
import { AuthContext } from '../context/AuthContext';
import { If } from 'jsx-conditionals';

import './FwHeader.scss';

export const FwHeader = () => {
    const { user, setAuthorization } = useContext(AuthContext);
    const { signOut: googleSignOut } = useGoogleLogout({clientId: GOOGLE_CLIENT_ID});
    const signOut = () => { googleSignOut(); setAuthorization(null); }

    return (
        <header className='flamewars-header'>
            <div>
                <h2>Comments</h2><a className='powered-by' href='https://github.com/michaelboyles/flamewars'>Powered by Flamewars</a>
            </div>
            <If condition={Boolean(user?.name)}>
                <span className='user'>Signed in as {user.name} &ndash; <a className='sign-out' onClick={signOut}>Sign out</a></span> 
            </If>
        </header>
    );
}
