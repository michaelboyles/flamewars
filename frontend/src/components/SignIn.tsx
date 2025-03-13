import { GoogleLogin } from "@react-oauth/google";
import { useAuthContext } from "../context/AuthContext";
import './SignIn.scss';

export function SignIn() {
    const { setAuthorization } = useAuthContext();

    return (
        <div className='sign-in'>
            <span className='label'>Sign in to comment:</span>
            <ul className='choices'>
                <GoogleLogin
                    auto_select={true}
                    size="medium"
                    onSuccess={credentialResponse => {
                        setAuthorization(credentialResponse.credential);
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />
            </ul>
        </div>
    )
}
