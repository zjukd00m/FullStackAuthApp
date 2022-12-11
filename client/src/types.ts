export interface UserSettings {
    id: number;
    email_code: string;
    signin_code: boolean;
    user_id: number;
    redirect_url: string;
}

export interface EditUserSettings {
    email_code: string;
    signin_code: boolean;
}

export enum TokenType {
    ACCOUNT_CONFIRM = "ACCOUNT_CONFIRM",
    SIGNIN_CODE = "SIGNIN_CODE",
    RESET_PASSWORD ="RESET_PASSWORD",
    OTHER = "OTHER"
}

export type AuthGroup = "ADMIN" | "OTHER";