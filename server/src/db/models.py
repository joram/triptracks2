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
        return User(
            id=prefixed_id("user"),
            email=email,
            google_userinfo=google_userinfo,
        )

    @property
    def access_token(self) -> "AccessToken":
        qs = db.query(AccessToken).filter(AccessToken.user_id == self.id)
        if qs.count() >= 1:
            return qs.first()


class PackingList(Base):
    __tablename__ = "packing_lists"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    contents = Column(JSON)

    @staticmethod
    def new(name: str, contents: dict, user: User) -> "PackingList":
        return PackingList(id=prefixed_id("packinglist"), user_id=user.id, name=name, contents=contents)


class TripPlan(Base):
    __tablename__ = "trip_plans"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    packing_lists = Column(JSON)
    people = Column(JSON)
    trails = Column(JSON)
    dates = Column(JSON)


    @staticmethod
    def new(name: str, user: User) -> "TripPlan":
        return TripPlan(
            id=prefixed_id("tripplan"),
            user_id=user.id,
            name=name,
            packing_lists=[],
            people=[],
            trails=[],
            dates=[],
        )


class AccessToken(Base):
    __tablename__ = "access_tokens"

    id = Column(String, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))

    @staticmethod
    def new(user: User) -> "AccessToken":
        token = prefixed_id("token")
        return AccessToken(id=prefixed_id("accesstoken"), token=token, user_id=user.id)
