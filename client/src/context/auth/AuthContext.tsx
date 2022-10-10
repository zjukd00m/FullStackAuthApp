import { createContext, useEffect, useReducer } from "react";
import { authReducer, INITIAL_STATE } from "./reducer";
import { IAuthContext } from "./types";

export const AuthContext = createContext<IAuthContext>({
    state: INITIAL_STATE,
    dispatch: () => undefined,
});

type AuthProviderProps = {
    children: JSX.Element | JSX.Element[];
};

export default function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

    useEffect(() => {
        async function verifySession() {
            console.log("Will search for existing user cookies");
        }
        verifySession();
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}
