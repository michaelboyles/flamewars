import { createContext, ReactNode, useCallback, useContext, useState } from "react";

export type User = {
    id: string
    name: string
}
export type Auth = {
    token: string
    tokenProvider: "Google"
}
export type AuthContext = {
    user?: User
    authorization?: Auth
    setAuthorization: (encodedToken: string) => void
    signOut: () => void
}

const COOKIE_NAME = "flamewars_auth_token";

const context = createContext<AuthContext | null>(null);

export function useAuthContext(): AuthContext {
    const value = useContext(context);
    if (!value) throw new Error("AuthContextProvider was not used");
    return value;
}

export function AuthContextProvider(props: { children: ReactNode }) {
    const token = getJsonWebTokenFromCookies();

    const [state, setState] = useState<User & Auth>(token ? tokenToState(token) : undefined);

    const signOut = useCallback(() => {
        deleteCookie();
        setState(undefined);
    }, []);

    const setAuth = useCallback((encodedToken: string) => {
        const decoded = decodeJsonWebToken(encodedToken);
        setCookie(encodedToken, decoded);
        setState(tokenToState(decoded));
    }, [])

    const user: User | undefined = state ? {
        id: state.id,
        name: state.name,
    } : undefined;
    const authorization: Auth | undefined = state ? {
        token: state.token,
        tokenProvider: state.tokenProvider,
    } : undefined;

    return (
        <context.Provider value={{ user, authorization, setAuthorization: setAuth, signOut }}>
            { props.children }
        </context.Provider>
    )
}

export function tokenToState(token: JsonWebToken): User & Auth {
    return {
        id: "GOOGLE/" + token.sub,
        name: token.given_name,
        token: token.jti,
        tokenProvider: "Google"
    }
}

function getJsonWebTokenFromCookies(): JsonWebToken | undefined {
    const cookie = getCookie(COOKIE_NAME);
    if (!cookie) return undefined;
    const token = decodeJsonWebToken(cookie);

    const now = Date.now();
    if (now >= (token.exp * 1000)) {
        return undefined;
    }
    return token;
}

function getCookie(name: string): string | undefined {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return undefined;
}

function setCookie(encodedToken: string, decoded: JsonWebToken) {
    const expiry = new Date(decoded.exp * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodedToken}; expires=${expiry}`;
}

function deleteCookie() {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
}

function decodeJsonWebToken(token: string): JsonWebToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

type JsonWebToken = {
    // JWT ID. Case-sensitive unique identifier of the token even among different issuers
    jti: string
    // An identifier for the user, unique among all Google accounts and never reused. A Google account can have multiple
    // email addresses at different points in time, but the sub value is never changed. Use sub within your application
    // as the unique-identifier key for the user. Maximum length of 255 case-sensitive ASCII characters.
    sub: string
    // Expiration time on or after which the ID token must not be accepted. Represented in Unix time (integer seconds).
    exp: number

    // The user's full name, in a displayable form. Might be provided when:
    // The request scope included the string "profile"
    // The ID token is returned from a token refresh
    // When name claims are present, you can use them to update your app's user records. Note that this claim is never
    // guaranteed to be present
    name?: string
    // The user's given name(s) or first name(s). Might be provided when a name claim is present
    given_name?: string
}