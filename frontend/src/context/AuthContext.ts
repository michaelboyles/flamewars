import { createContext } from "react";
import { Authorization } from "../../../common/types/add-comment-request";

export type User = {
    id: string
    name: string
}

export type IAuthContext = {
    authorization?: Authorization;
    setAuthorization?: (auth: Authorization) => void;
    user?: User;
    setUser?: (user: User) => void;
}

export const AuthContext = createContext<IAuthContext>({});
