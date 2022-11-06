export interface ServiceResponse {
    data: any | null;
    error: string | null;
}

export interface ServiceRequestCallbacks {
    onHTTPSuccess: (data: any) => void;
    onHTTPError: (status: number, data: any) => void;
    onHTTPNetworkError: (e: Error) => void;
}

export enum EmailService {
    ACCOUNT_CONFIRMATION = "ACCOUNT_CONFIRMATION",
}
