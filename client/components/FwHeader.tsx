import * as React from 'react';
import { useContext } from 'react';
import { useGoogleLogout } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../config';
import { AuthContext } from '../context/AuthContext';

import './FwHeader.scss';

const FwHeader = () => {
    const { authorization, setAuthorization } = useContext(AuthContext);
    const { signOut: googleSignOut } = useGoogleLogout({clientId: GOOGLE_CLIENT_ID});
    const signOut = () => { googleSignOut(); setAuthorization(null); }

    return (
        <div className='flamewars-header'>
        {
            authorization ? <span className='user'>Signed in as {authorization.name} &ndash; <a className='sign-out' onClick={signOut}>Sign out</a></span> : null
        }
        </div>
    )
}

export default FwHeader;
