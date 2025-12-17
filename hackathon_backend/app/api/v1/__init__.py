from fastapi import APIRouter

from app.api.v1.endpoints.providers import router as providers_router

api_router = APIRouter()

api_router.include_router(providers_router, prefix="/providers", tags=["Mock Providers"])

__all__ = ["api_router"]
