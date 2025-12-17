from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.categories import router as categories_router
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.utils import router as utils_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(utils_router, prefix="/utils", tags=["Utils"])
api_router.include_router(health_router, tags=["Health & Monitoring"])

__all__ = ["api_router"]


