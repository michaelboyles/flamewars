import { createContext } from "react";
import { LocalAuthorization } from "../components/SignIn";

interface IAuthContext {
    authorization?: LocalAuthorization;
    setAuthorization?: (la: LocalAuthorization) => void;
}

export const AuthContext = createContext<IAuthContext>({});
