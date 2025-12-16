from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# JWT'nin içinden çıkacak ham veriler (Payload)
class TokenPayload(BaseModel):
    sub: Optional[str] = None  # Subject (Genelde User ID)
    exp: Optional[int] = None  # Expiration (Sona erme zamanı)
    roles: List[str] = ["user"]


class UserContext(BaseModel):
    user_id: str
    roles: List[str]
    permissions: List[str] = Field(default_factory=list)

    @property
    def is_admin(self) -> bool:
        return "admin" in self.roles


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
