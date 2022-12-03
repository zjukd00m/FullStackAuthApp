import React from "react";
import { ServiceRequestCallbacks } from "../../services/types";
import { UserSettings } from "../../types";

type AuthGroup = "ADMIN" | "OTHER";

type UserGroups = AuthGroup;

export interface AuthUser {
    id: number;
    email: string;
    created_at: string;
    confirmed: boolean;
    active: boolean;
    last_sign_in: string;
    phone_number?: string;
    display_name?: string;
    avatar?: string;
    groups?: UserGroups[];
    settings?: UserSettings;
}

export interface AuthUserEdit {
    active: boolean;
    phone_number?: string;
    display_name?: string;
    avatar?: string;
    groups?: UserGroups;
}


export interface IAuthState {
    isAuthenticated: boolean;
    user: AuthUser;
    error: string | null;
}

export interface IActionType {
    type: ActionType;
    payload?: any;
}

export type ActionType =
    | "SET_USER"
    | "SET_PROFILE"
    | "SET_USER_SETTINGS"
    | "RESET_USER"
    | "SET_ERROR"
    | "SET_IS_AUTHENTICATED";

export interface IAuthContext {
    state: IAuthState;
    dispatch: React.Dispatch<any>;
}

// Auth Service
export interface IAuthService {
    base_url: string;
    signUp: (args: AuthServiceUser) => Promise<void>;
    signIn: (args: AuthServiceUser) => Promise<void>;
    signOut: (args: ServiceRequestCallbacks) => Promise<void>;
}

export interface AuthServiceUser extends ServiceRequestCallbacks {
    email: string;
    password: string;
}
