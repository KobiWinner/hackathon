import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.domain.schemas.user import UserCreate
from app.infrastructure.unit_of_work import UnitOfWork
from app.persistence.models.user import User
from tests.factories import UserCreateFactory


@pytest.mark.asyncio
async def test_uow_commit_success(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    """
    Senaryo 1 (Mutlu Yol): Hata yoksa veriler kaydedilmeli (Commit).
    Repository.create() kullanarak test eder.
    """
    uow = UnitOfWork(session_factory=session_factory)
    user_in: UserCreate = UserCreateFactory()  # type: ignore

    async with uow:
        # Repository üzerinden kullanıcı oluştur
        created_user = await uow.users.create(obj_in=user_in, commit=False)
        await uow.commit()

    # Verify user was saved
    async with session_factory() as session:
        result = await session.execute(select(User).where(User.email == user_in.email))
        stored_user = result.scalars().first()

        assert stored_user is not None
        assert stored_user.email == user_in.email
        assert created_user.id == stored_user.id


@pytest.mark.asyncio
async def test_uow_rollback_on_error(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    """
    Senaryo 2 (Sabotaj): İşlem sırasında hata çıkarsa veriler SİLİNMELİ (Rollback).
    Repository.create() kullanarak test eder.
    """
    uow = UnitOfWork(session_factory=session_factory)
    user_in: UserCreate = UserCreateFactory()  # type: ignore

    with pytest.raises(RuntimeError):
        async with uow:
            # Repository üzerinden kullanıcı oluştur (commit=False)
            await uow.users.create(obj_in=user_in, commit=False)
            raise RuntimeError("Sistemde beklenmedik hata!")

    # Verify user was NOT saved (rollback worked)
    async with session_factory() as session:
        result = await session.execute(select(User).where(User.email == user_in.email))
        stored_user = result.scalars().first()

        assert (
            stored_user is None
        ), "Hata olmasına rağmen veri kaydedilmiş! Rollback çalışmadı."
