import uuid

from sqlalchemy.types import JSON
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.testing import db

from src.db.database import Base


def prefixed_id(prefix: str) -> str:
    uid = str(uuid.uuid4()).replace("-", "")
    return f"{prefix}_{uid}"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    google_userinfo = Column(JSON, default=True)

    @staticmethod
    def new(email: str, google_userinfo: dict) -> "User":
        return User(id=prefixed_id("user_id"), email=email, google_userinfo=google_userinfo)

    @property
    def access_token(self) -> "AccessToken":
        qs = db.query(AccessToken).filter(AccessToken.user_id == self.id)
        if qs.count() >= 1:
            return qs.first()


class AccessToken(Base):
    __tablename__ = "access_tokens"

    id = Column(String, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))

    @staticmethod
    def new(user: User) -> "AccessToken":
        token = prefixed_id("token")
        return AccessToken(id=prefixed_id("accesstoken"), token=token, user_id=user.id)
