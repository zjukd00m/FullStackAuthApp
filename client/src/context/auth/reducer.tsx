import { IActionType, IAuthState } from "./types";

export const INITIAL_STATE: IAuthState = {
    isAuthenticated: false,
    user: {
        id: 0,
        email: "",
        created_at: "",
        confirmed: false,
        active: false,
        last_sign_in: "",
        phone_number: undefined,
    },
    error: null,
};

export function authReducer(
    state: IAuthState,
    action: IActionType
): IAuthState {
    const { type, payload } = action;

    switch (type) {
        case "SET_USER": {
            return {
                ...state,
                isAuthenticated: true,
                user: payload.user,
            };
        }
        case "RESET_USER": {
            return INITIAL_STATE;
        }
        case "SET_ERROR": {
            return {
                ...state,
                error: payload.error,
            };
        }
        default: {
            return state;
        }
    }
}
