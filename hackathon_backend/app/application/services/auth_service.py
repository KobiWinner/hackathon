from app.core import security
from app.core.exceptions import AuthenticationError
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.schemas.auth import LoginRequest, Token


class AuthService:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def login(self, login_data: LoginRequest) -> Token:
        # 1. Kullanıcıyı email'e göre repository'den çek
        # Artık sızıntı yok. Repository session'ı kendi içinde yönetiyor.
        user = await self.uow.users.get_by_email(login_data.email)

        # 2. Kullanıcı yoksa veya şifre yanlışsa Hata fırlat (Custom Exception)
        if not user or not user.hashed_password:
            raise AuthenticationError("Incorrect email or password")

        if not security.verify_password(login_data.password, user.hashed_password):
            raise AuthenticationError("Incorrect email or password")

        # 3. Her şey yolundaysa Token üret
        access_token = security.create_access_token(subject=user.id)

        return Token(access_token=access_token, token_type="bearer")  # nosec B106
