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
        settings: {
            id: 0,
            email_code: "",
            signin_code: false,
            user_id: 0,
            redirect_url: "",
        }
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
            const { user } = payload;
            return {
                ...state,
                isAuthenticated: true,
                user,
            };
        }
        case "SET_USER_SETTINGS": {
            const { settings } = payload;
            return {
                ...state,
                user: { ...state.user, settings },
            }
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
        case "SET_IS_AUTHENTICATED": {
            return {
                ...state,
                isAuthenticated: true,
            }
        }
        default: {
            return state;
        }
    }
}
