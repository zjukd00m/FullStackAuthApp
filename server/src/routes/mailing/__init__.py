from fastapi import APIRouter, Request, HTTPException
from starlette.authentication import requires
from sqlmodel import Session, select
from sqlalchemy.sql.functions import func
from datetime import datetime
from ...services.mailing import send_email
from ...utils.tokens import generate_random_code, add_expiration_time
from ...utils.db import engine
from ...models import User, Token, Settings
from .schema import MailingDetails, MailingService
from src.enums import TokenType


route = APIRouter()


@route.post("/")
@requires(["authenticated"])
def mailing_service(mailing_details: MailingDetails, service: MailingService, request: Request):
    """
    Call this endpoint to request a token to be sent to the user's email.
    The token must be of a specific service, sent in the query parameters.
    The services are:
    - ACCOUNT_CONFIRMATION: When the first email's token expires, this service sends the same account activation
        email again.
    Constraints:
    - Can't generate another token if there's an existing one that haven't expired already.
    """
    emails = mailing_details.emails
    email = emails[0]

    token_type = TokenType.OTHER

    if service == MailingService.ACCOUNT_CONFIRMATION:
        token_type = TokenType.ACCOUNT_CONFIRM

        with Session(engine) as sess:
            query = select(User).where(User.email == email)  
            user: User = sess.exec(query).first()

            if not user:
                raise HTTPException(404, "user.not-found")

            if user.confirmed:
                raise HTTPException(400, "user.account-already-confirmed")

            # Get the token with the latest expiration time of the user
            subquery = select(func.max(Token.expires_at)).where(Token.user_id == user.id)
            date_last_token = sess.exec(subquery).first()

            if date_last_token:
                query = select(Token).where(
                    Token.expires_at >= date_last_token, Token.user_id == user.id
                )
                last_token: Token = sess.exec(query).first()
                
                # The token was already generated and hasn't expired, raise and exception
                if last_token and last_token.is_valid():
                    raise HTTPException(400, "The email was already sent")

            # Create a new token that expires 1 hour after the request is made
            _token = generate_random_code(32)
            expires_at = add_expiration_time(60 * 5)

            token = Token(token=_token, expires_at=expires_at, user_id=user.id, type=token_type)

            sess.add(token)
            sess.commit()
            sess.refresh(token)

            email_code = sess.exec(select(Settings.email_code).where(Settings.user_id == user.id)).first()
            if not email_code:
                raise HTTPException(404, "user.settings.missing-email-code")

            try:
                send_email(
                    "Confirm your account", 
                    "EMAIL_CONFIRMATION",
                    to=[email],
                    attachments=None,
                    args={
                        "token": token.token,
                        "email_code": email_code,
                        "user_email": user.email,
                    }
                )

            except Exception as e:
                raise HTTPException(500, e.__str__())

    return { "message": "Emails were sent" }