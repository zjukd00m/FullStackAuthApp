from starlette.authentication import (
    AuthenticationBackend,
    AuthCredentials,
    AuthenticationError,
)
from src.utils.auth import verify_token
from src.auth.user import CustomUser
from pprint import pprint
from os import path
import re

unprotected = [re.compile(".*/api/auth/confirm.*")]

# TODO: Not in every request the cookies should be included
class JWTMiddleware(AuthenticationBackend):
    async def authenticate(self, conn):
        bypass = False
        cookies = conn.cookies
        auth_key = cookies.get("auth_key")

        server_url = str(conn.url).replace(str(conn.base_url), "/")

        for allow_url_regex in unprotected:
            if allow_url_regex.match(server_url):
                bypass = True

        if auth_key and not bypass:
            payload, err = verify_token(auth_key)

            if err:
                raise AuthenticationError(err)

            else:
                _id = payload.get("id")
                email = payload.get("email")

                user = CustomUser(id=_id, email=email)

                return AuthCredentials(["authenticated"]), user
