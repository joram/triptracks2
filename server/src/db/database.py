import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src import settings

root_db_dir = settings.CONFIG_DIR
if os.path.exists("/data"):
    root_db_dir = "/data"

db_filepath = f"{root_db_dir}/database.db"
db_url = f"sqlite:///{db_filepath}"

engine = create_engine(db_url, pool_size=50, max_overflow=50)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    if not os.path.exists(db_filepath):
        print(f"creating db at {db_filepath}")
        Base.metadata.create_all(engine)

    # drop and recreate tables
    # from .models import TripPlan
    # TripPlan.__table__.drop(bind=engine, checkfirst=False)
    # TripPlan.__table__.create(bind=engine, checkfirst=False)

    return SessionLocal()
