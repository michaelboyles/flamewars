import { createContext } from "react";
import { Authorization } from "../../../common/types/add-comment-request";

export interface User {
    id: string;
    name: string;
}

export interface IAuthContext {
    authorization?: Authorization;
    setAuthorization?: (auth: Authorization) => void;
    user?: User;
    setUser?: (user: User) => void;
}

export const AuthContext = createContext<IAuthContext>({});
