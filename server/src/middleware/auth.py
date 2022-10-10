from starlette.authentication import (
    AuthenticationBackend,
    AuthCredentials,
    AuthenticationError,
)
from src.utils.auth import verify_token
from src.auth.user import CustomUser


class JWTMiddleware(AuthenticationBackend):
    async def authenticate(self, conn):
        cookies = conn.cookies
        auth_key = cookies.get("auth_key")

        if auth_key:
            payload, err = verify_token(auth_key)

            if err:
                raise AuthenticationError(err)

            else:
                _id = payload.get("id")
                email = payload.get("email")

                user = CustomUser(id=_id, email=email)

                return AuthCredentials(["authenticated"]), user
