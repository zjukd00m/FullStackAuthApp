import orjson
from typing import Any
from fastapi.responses import JSONResponse


class ORJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        return orjson.dumps(content)
