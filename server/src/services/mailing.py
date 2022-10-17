import json
import requests
from typing import Dict, List, Optional, Union
from ..settings import RAPID_API_HOST_SEND_GRID, RAPID_API_KEY_SEND_GRID


HTML_TEMPLATES = [
    "EMAIL_CONFIRMATION",
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


def get_email_confirmation_template(args: Dict):
    confirm_url = args.get("confirm_url")

    if not confirm_url:
        raise Exception("Missing confirm url")

    html = f"""
    <h1> Welcome to the city watchers </h1>
    <p>
        In order to use the app you must read the terms and conditions.
    </p>
    <a
        href="{confirm_url}"
    >
        Accept
    </a>
    """

    return html


def send_email(
    subject: str,
    template: str,
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

    if template == "EMAIL_CONFIRMATION":

        token = args.get("token")

        if not token:
            raise ValueError("The token must be provided in the args")

        confirm_url = f"http://localhost:8088/api/auth/confirm/?token={token}"

        html = get_email_confirmation_template(
            {
                "confirm_url": confirm_url,
            }
        )

    sgrid_client = SendGridClient()

    result = sgrid_client.send(to, html, subject)

    if result.ok:
        print("The email was sent")
    else:
        print(result.status_code)
        print(result.content.decode("utf-8"))

    return result
