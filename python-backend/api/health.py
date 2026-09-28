"""
ELIM SPRINGS — /health endpoint.
"""

from fastapi import APIRouter
from models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Returns the service liveness status.
    The React frontend polls this endpoint to determine if the Python
    Geo-AI service is available before sending raster processing requests.
    """
    return HealthResponse(
        status="ok",
        service="ELIM SPRINGS Python Geo-AI Service",
        version="1.0.0",
        python_backend=True,
    )
