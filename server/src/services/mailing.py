import json
import requests
from typing import Dict, List, Literal, Optional
from ..settings import RAPID_API_HOST_SEND_GRID, RAPID_API_KEY_SEND_GRID
from src.templates.email_confirm import get_email_confirmation_template
from src.templates.email_sign_in_code import get_email_sign_in_code_template
from src.templates.reset_password import get_email_reset_password_template
from src.templates.on_email_code_changed import get_on_email_code_changed_template


HTML_TEMPLATES = [
    "EMAIL_CONFIRMATION",
    "AUTHENTICATION_TOKEN",
    "RESET_PASSWORD",
    "EMAIL_CODE_CHANGED",
]

JSON_HEADERS = {
    "Content-Type": "application/json",
}


class SendGridClient:
    url = "https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send"

    API_KEY = RAPID_API_KEY_SEND_GRID
    API_HOST = RAPID_API_HOST_SEND_GRID

    headers = {
        **JSON_HEADERS,
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
    }

    def send(
        self, to: List[str], html: str, subject: str, attatchments: Optional[List] = []
    ) -> requests.Response:
        to_emails = list(map(lambda email: {"email": email}, to))
        data = json.dumps(
            {
                "personalizations": [
                    {
                        "to": to_emails,
                        "subject": subject,
                    }
                ],
                "from": {"email": "from_address@example.com"},
                "content": [{"type": "text/html", "value": html}],
            }
        )

        r = requests.post(self.url, data=data, headers=self.headers)

        return r


def send_email(
    subject: str,
    template: Literal["EMAIL_CONFIRMATION", "AUTHENTICATION_TOKEN", "RESET_PASSWORD", "EMAIL_CODE_CHANGED"],
    to: List[str],
    attachments: Optional[List[str]] = [],
    args: Dict = {},
):
    """
    Send the selected template with attachments (if any)
    """
    if template not in HTML_TEMPLATES:
        raise ValueError("mail-sender.template-not-valid")

    html = ""

    email_code = args.get("email_code")

    if not email_code:
        raise ValueError("The email code must be provided in the args")

    if template == "EMAIL_CONFIRMATION":
        user_email = args.get("user_email")

        if not user_email:
            raise ValueError("The user email must be provided in the args")

        token = args.get("token")

        if not token:
            raise ValueError("The token must be provided in the args")

        confirm_url = f"http://localhost:8088/api/auth/confirm/?token={token}"

        html = get_email_confirmation_template(
            {
                "confirm_url": confirm_url,
                "email_code": email_code,
                "user_email": user_email,
            }
        )

    elif template == "AUTHENTICATION_TOKEN":
        token = args.get("token")

        if not token:
            raise ValueError("The token must be provided in the args")

        html = get_email_sign_in_code_template({
            "email_code": email_code,
            "sign_in_token": token,
        })

    elif template == "RESET_PASSWORD":
        restore_password_url = args.get("restore_password_url")

        if not restore_password_url:
            raise ValueError("The toke must be provided in the args")
        
        html = get_email_reset_password_template({
            "restore_password_url": restore_password_url, 
            "email_code": email_code
        })

    elif template == "EMAIL_CODE_CHANGED":
        old_email_code = args.get("old_email_code")

        html = get_on_email_code_changed_template({
            "old_email_code": old_email_code,
            "new_email_code": email_code,
        })

    send_grid_client = SendGridClient()

    result = send_grid_client.send(to, html, subject)

    if result.ok:
        print("The email was sent")
    else:
        print(result.status_code)
        print(result.content.decode("utf-8"))

    return result
