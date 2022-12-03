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