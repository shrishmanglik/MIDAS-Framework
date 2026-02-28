from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register(self, data: UserCreate) -> UserResponse:
        result = await self.session.execute(select(User).where(User.email == data.email))
        existing = result.scalar_one_or_none()
        if existing is not None:
            raise DuplicateResourceError("User", "email", data.email)

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            name=data.name,
            role=UserRole.user,
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)

        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        result = await self.session.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if user is None or not verify_password(data.password, user.password_hash):
            raise ResourceNotFoundError("User", "Invalid email or password")

        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}

        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        from jose import JWTError

        try:
            payload = verify_token(refresh_token)
        except JWTError:
            raise ResourceNotFoundError("Token", "Invalid or expired refresh token")

        if payload.get("type") != "refresh":
            raise ResourceNotFoundError("Token", "Invalid token type")

        user_id = payload.get("sub")
        from uuid import UUID

        result = await self.session.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()

        if user is None:
            raise ResourceNotFoundError("User", user_id)

        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}

        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )
