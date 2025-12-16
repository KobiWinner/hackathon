from typing import Annotated, List, Optional

from pydantic import AfterValidator, BaseModel, EmailStr, computed_field

from app.core.security.validators import validate_password_requirements

StrongPassword = Annotated[str, AfterValidator(validate_password_requirements)]


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool = True
    phone_number: Optional[str] = None
    is_superuser: bool = False
    is_email_verified: bool = False
    is_phone_verified: bool = False

    @computed_field
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserCreate(UserBase):
    password: StrongPassword
    role_ids: Optional[List[int]] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[StrongPassword] = None


class User(UserBase):
    id: int
    hashed_password: Optional[str] = None

    class Config:
        from_attributes = True
