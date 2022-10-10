import json
from pprint import pprint
import httpx
from httpx_auth import Basic
from mailjet_rest import Client
from typing import Dict, List, Optional
from ..settings import MAILJET_API_KEY, MAILJET_API_SECRET

HTML_TEMPLATES = [
    "EMAIL_CONFIRMATION",
]


HEADERS = {
    "Content-Type": "application/json",
}

mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_API_SECRET), version="v3.1")


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

    to_emails = list(map(lambda email: { "Email": email }, to))

    payload = {}

    if template == "EMAIL_CONFIRMATION":
        token = args.get("token")

        if not token:
            raise ValueError("The token must be provided in the args")

        confirm_url = F"http://localhost:8088/api/auth/confirmation/?token={token}"

        html = get_email_confirmation_template({
            "confirm_url": confirm_url,
        })

        payload = {
            "Messages": [
                {
                    "From": {
                        "Email": "zjukdoom@protonmail.com",
                    },
                    "To": to_emails,
                    "Subject": subject,
                    "HTMLPart": html
                }
            ],
        }

    result = mailjet.send.create(data=payload)

    if result.ok:
        print("The email was sent")
    else:
        print(result.status_code)
        print(result.content.decode("utf-8"))

    return result







# TODO: Create a new client on every request or share a single instance ?
class MailJetClient:
    def __init__(self):
        self.user = MAILJET_API_KEY
        self.password = MAILJET_API_SECRET

    async def send_email(
        self,
        subject: str,
        html: str,
        to: List[Dict],
        attachments: Optional[List[str]] = []
    ):
        payload = json.dumps({
            "Messages": [
                {
                    "From": {
                        "Email": "zjukdoom@proton.me",
                        "Name": "me",
                    },
                    "To": to,
                    "Subject": subject,
                    "TextPart": "E-Mail",
                    "HTMLPart": html,
                }
            ],
        })

        auth = Basic(MAILJET_API_KEY, MAILJET_API_SECRET)

        async with httpx.AsyncClient() as client:
            r: httpx.Response = await client.post(
                url=f"https://api.mailjet.com/v3.1/send",
                data=payload,
                headers=HEADERS,
                auth=auth,
            )

            if r.status_code == 200:
                print(r.status_code)
                print(r.json())
                return True

            return False


# async def send_email(
#         subject: str,
#         template: str,
#         to: List[str],
#         attachments: Optional[List[str]] = []
#     ):

#     mailjet_client = MailJetClient()

#     """
#     Send the selected template with attachments (if any)
#     """
#     if template not in HTML_TEMPLATES:
#         raise ValueError("mail-sender.template-not-valid")

#     to_emails = list(map(lambda email: { "Email": email }, to))

#     print("Will send the email to")
#     print(to_emails)

#     html = """
#     <h1> Welcome to the city watchers </h1>
#     <p> 
#         In order to use the app you must read the terms and conditions.
#     </p>
#     <a
#         href="https://www.google.com"
#     >
#         Accept
#     </a>
#     """

#     await mailjet_client.send_email(subject, html, to_emails, attachments)
