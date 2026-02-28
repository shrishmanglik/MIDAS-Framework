import json

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, StreamingResponse

DISCLAIMER_TEXT = (
    "This information is provided for educational and informational purposes only. "
    "It does not constitute legal advice. For guidance on your specific situation, "
    "please consult a licensed legal professional in your jurisdiction."
)

EXCLUDED_PATHS = {"/api/v1/health", "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh"}


class DisclaimerMiddleware(BaseHTTPMiddleware):
    """Injects a 'disclaimer' field into JSON responses for legal endpoints."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        path = request.url.path

        # Skip non-API routes, health, and auth endpoints
        if not path.startswith("/api/v1/"):
            return response
        if path in EXCLUDED_PATHS:
            return response

        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type:
            return response

        # Read the response body
        body_chunks = []
        async for chunk in response.body_iterator:
            if isinstance(chunk, bytes):
                body_chunks.append(chunk)
            else:
                body_chunks.append(chunk.encode("utf-8"))
        body = b"".join(body_chunks)

        try:
            data = json.loads(body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )

        if isinstance(data, dict):
            data["disclaimer"] = DISCLAIMER_TEXT
        elif isinstance(data, list):
            data = {"data": data, "disclaimer": DISCLAIMER_TEXT}

        modified_body = json.dumps(data).encode("utf-8")

        headers = dict(response.headers)
        headers["content-length"] = str(len(modified_body))

        return Response(
            content=modified_body,
            status_code=response.status_code,
            headers=headers,
            media_type="application/json",
        )
