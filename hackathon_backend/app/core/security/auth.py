from datetime import datetime, timedelta
from typing import Any, List, Optional, Union

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config.settings import settings
from app.domain.schemas.auth import TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Girilen şifreyi (plain) hashlenmiş şifreyle kıyaslar."""
    result: bool = pwd_context.verify(plain_password, hashed_password)
    return result


def get_password_hash(password: str) -> str:
    """Şifreyi veritabanına kaydetmeden önce hashler."""
    result: str = pwd_context.hash(password)
    return result


def create_access_token(
    subject: Union[str, Any],
    roles: Optional[List[str]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """JWT Token üretir."""
    if roles is None:
        roles = ["user"]
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Token içine koyacağımız bilgiler
    to_encode = {"exp": expire, "sub": str(subject), "roles": roles}

    encoded_jwt: str = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Union[TokenPayload, None]:
    """
    Ham JWT token'ı alır, imzasını doğrular ve payload döner.
    Hata varsa (Süresi dolmuş, imza yanlış vb.) None döner veya hata fırlatır.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        # Token içindeki verileri alıyoruz
        user_id: str = payload.get("sub")
        roles: List[str] = payload.get("roles", ["user"])

        if user_id is None:
            return None

        # Pydantic modeline çevir
        return TokenPayload(sub=user_id, roles=roles, exp=payload.get("exp"))

    except JWTError:
        return None
