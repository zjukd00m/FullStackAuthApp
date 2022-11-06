from fastapi import APIRouter, Request, HTTPException
from starlette.authentication import requires
from sqlmodel import Session, select
from sqlalchemy.sql.functions import func
from datetime import datetime
from ...services.mailing import send_email
from ...utils.tokens import generate_random_code, add_expiration_time
from ...utils.db import engine
from ...models import User, Token
from .schema import MailingDetails, MailingService


route = APIRouter()


@route.post("/")
@requires(["authenticated"])
def mailing_service(mailing_details: MailingDetails, service: MailingService, request: Request):
    emails = mailing_details.emails
    email = emails[0]

    if service == MailingService.ACCOUNT_CONFIRMATION:
        with Session(engine) as sess:
            query = select(User).where(User.email == email)  
            user: User = sess.exec(query).first()

            if not user:
                raise HTTPException(404, "user.not-found")    

            # Get the token with the lastest expiration time of the user
            subquery = select(func.max(Token.expires_at)).where(Token.user_id == user.id)
            date_last_token = sess.exec(subquery).first()

            if date_last_token:
                query = select(Token).where(
                    Token.expires_at >= date_last_token, Token.user_id == user.id
                )
                last_token: Token = sess.exec(query).first()
                
                # The token was already generated and hasn't expired, raise and exception
                print(datetime.now().isoformat())
                print(last_token.expires_at.isoformat())
                if last_token and (last_token.expires_at > datetime.now() and not last_token.scanned):
                    raise HTTPException(400, "The email was already sent")
                

            # Create a new token that expires 1 hour after the request is made
            _token = generate_random_code(32)
            expires_at = add_expiration_time(60 * 5)

            token = Token(token=_token, expires_at=expires_at, user_id=user.id)

            sess.add(token)
            sess.commit()
            sess.refresh(token)

            try:
                send_email(
                    "Confirm your account", 
                    "EMAIL_CONFIRMATION",
                    to=[email],
                    attachments=None,
                    args={
                        "token": token.token,
                    }
                )

            except Exception as e:
                raise HTTPException(500, e.__str__())

    return { "message": "Emails were sent" }