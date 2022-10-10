from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlmodel import Session, select
from src.models import APIKey
from src.utils.db import engine
from time import time


class ShieldMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time()

        # Verify if the incoming request has the X-API-KEY header
        api_key = request.headers.get("x-api-key")

        if api_key:
            with Session(engine) as sess:
                sess.inherit_cache = True
                query = select(APIKey).where(APIKey.key == api_key)
                _api_key = sess.execute(query).first()

                if not _api_key:
                    # raise HTTPException(403, "api-key.invalid")
                    return JSONResponse({"detail": "api-key.invalid"}, status_code=403)

                _api_key = _api_key[0]

                expiration_time = _api_key.expirationTime

                if expiration_time >= 36000:
                    return JSONResponse({"detail": "api-key.expired"}, status_code=403)

        response = await call_next(request)

        end_time = time()

        time_diff = end_time - start_time

        print(f"Request time: {time_diff} (seconds)")

        return response
