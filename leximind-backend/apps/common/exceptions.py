"""
Unified exception handler for LexiMind Secure.
All 4xx/5xx responses use the shape: {"detail": "...", "code": "..."}
so the frontend's toast helper can read err.detail uniformly.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def leximind_exception_handler(exc, context):
    """Custom exception handler that normalises error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        # Normalise the shape — DRF sometimes returns {"detail": ...} already,
        # sometimes {"field": ["error"]} for validation. We keep both but also
        # ensure "code" is present.
        detail = response.data.get("detail", str(exc))
        code = getattr(getattr(exc, "detail", exc), "code", "error")
        if not isinstance(code, str):
            code = "error"

        response.data = {
            "detail": str(detail) if not isinstance(detail, dict) else detail,
            "code": code,
        }
    else:
        # Unhandled exception — return a generic 500
        response = Response(
            {"detail": "An unexpected server error occurred.", "code": "server_error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
