import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import settings

root_db_dir = settings.CONFIG_DIR
if os.path.exists("/data"):
    root_db_dir = "/data"

db_filepath = f"{root_db_dir}/database.db"
db_url = f"sqlite:///{db_filepath}"

engine = create_engine(db_url, pool_size=50, max_overflow=50)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


MIGRATED = False

# Lightweight, idempotent column migrations for SQLite. create_all() only
# creates missing tables, never alters existing ones, so new columns on
# existing tables are added here.
COLUMN_MIGRATIONS = [
    ("trip_plans", "pins", "JSON"),
]


def run_migrations():
    with engine.connect() as conn:
        for table, column, col_type in COLUMN_MIGRATIONS:
            existing = [
                row[1]
                for row in conn.exec_driver_sql(
                    f"PRAGMA table_info({table})"
                ).fetchall()
            ]
            if column not in existing:
                print(f"migrating: adding {table}.{column}")
                conn.exec_driver_sql(
                    f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"
                )
        conn.commit()


def get_session():
    global MIGRATED
    if not os.path.exists(db_filepath):
        print(f"creating db at {db_filepath}")
        Base.metadata.create_all(engine)

    if not MIGRATED:
        run_migrations()
        MIGRATED = True

    return SessionLocal()
