import json
import requests
from typing import Dict, List, Literal, Optional, Union
from ..settings import RAPID_API_HOST_SEND_GRID, RAPID_API_KEY_SEND_GRID


HTML_TEMPLATES = [
    "EMAIL_CONFIRMATION",
    "AUTHENTICATION_TOKEN",
    "RESET_PASSWORD"
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
    confirm_url: str = args.get("confirm_url")
    email_code: str = args.get("email_code")
    user_email: str = args.get("user_email")

    if not confirm_url:
        raise Exception("Missing confirm url")
    if not email_code:
        raise Exception("Missing email code")
    if not user_email:
        raise Exception("Missing user email")

    html = f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;1,400&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Raleway:ital@0;1&display=swap');
    </style>

    <div class="view">
      <div style="
      padding: 1em;
      background-color: #2E3440;
      color: #E5E9F0;
      ">
        <div>
          <div>
            <p style="
              position: absolute;
              top: 0;
              right: 0;
              font-size: 14px;
              margin: 1em 1em 0 0;
              font-family: 'Raleway', sans-serif;
            ">
              Authentication code:        
              <span style="
               text-align: center;
               font-family: 'Space Mono', monospace;
               font-weight: 700;
               color: #EBCB8B;
               border-bottom: 2px solid #EBCB8B;
               font-size: 16px;   
             "> {email_code} </span>
            </p>
          </div>
          <p style="
          font-size: 16px;
          font-weight: 600;
          color: #D8DEE9;
          font-family: 'Raleway', sans-serif;
          ">
            Welcome {user_email}
          </p>
          <p style="
            font-family: 'Raleway', sans-serif;
            font-size: 14px;
          ">
            You sign up in the authentication app
          </p>
          <p style="
            font-family: 'Raleway', sans-serif;
            font-size: 14px;
          ">
            In order to use the application make sure to confirm you account by clicking on the following link
          </p>
          <a 
          href='{confirm_url}' 
          style="
            text-decoration: none;
            padding: 0.3em 0.8em;
            text-transform: uppercase;
            outline: none;
            border: none;
            background-color: #8FBCBB;
            transition: all 0.5s ease-out;
            font-weight: 600;
            font-size: 14px;
            border-radius: 5px;
            font-family: 'Raleway', sans-serif;
            color: #2E3440;
           ">
             Confirm Account
          </a>
        </div>
      </div>
    </div>
    """

    return html


def send_email(
    subject: str,
    template: Literal["EMAIL_CONFIRMATION", "AUTHENTICATION_TOKEN", "RESET_PASSWORD"],
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

    user_email = args.get("user_email")

    if not user_email:
        raise ValueError("The user email must be provided in the args")

    if template == "EMAIL_CONFIRMATION":

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

        html = F"""
        <body>
            <div>
                <p> This is the auth code </p>
                <p 
                style="
                    font-size: 22px; 
                "> {token} </p>
            </div>
        </body>
        """

    elif template == "RESET_PASSWORD":
        pass

    sgrid_client = SendGridClient()

    result = sgrid_client.send(to, html, subject)

    if result.ok:
        print("The email was sent")
    else:
        print(result.status_code)
        print(result.content.decode("utf-8"))

    return result
