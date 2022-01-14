import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src import settings

db_filepath = f"{settings.CONFIG_DIR}/database.db"
db_url = f"sqlite:///{settings.CONFIG_DIR}/database.db"

engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    if not os.path.exists(db_filepath):
        print("creating db")
        Base.metadata.create_all(engine)
    return SessionLocal()


def get_object_session(o):
    if not os.path.exists(db_filepath):
        print("creating db")
        Base.metadata.create_all(engine)
    return SessionLocal().object_session(o)
