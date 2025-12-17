from fastapi import APIRouter

from .collector import router as collector_router

api_router = APIRouter()

# Collector endpoints
api_router.include_router(collector_router)

__all__ = ["api_router"]
