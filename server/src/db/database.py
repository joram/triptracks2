import os

from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def _database_url() -> str:
    url = os.environ.get(
        "DATABASE_URL", "postgresql://triptracks:triptracks@localhost:5432/triptracks"
    ).strip()
    # Use psycopg 3 for the common postgres:// / postgresql:// URL forms.
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


db_url = _database_url()
engine = create_engine(db_url, pool_size=10, max_overflow=20, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


MIGRATED = False

# Lightweight, idempotent column migrations. create_all() only creates missing
# tables, never alters existing ones, so new columns on existing tables are
# added here.
COLUMN_MIGRATIONS = [
    ("trip_plans", "pins", "JSON"),
]


def run_migrations():
    # Models must be registered on Base before create_all().
    import db.models  # noqa: F401

    with engine.begin() as conn:
        conn.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS postgis")
    Base.metadata.create_all(engine)

    inspector = inspect(engine)
    with engine.connect() as conn:
        for table, column, col_type in COLUMN_MIGRATIONS:
            existing = [c["name"] for c in inspector.get_columns(table)]
            if column not in existing:
                print(f"migrating: adding {table}.{column}")
                conn.exec_driver_sql(
                    f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"
                )
        conn.commit()


def get_session():
    global MIGRATED
    if not MIGRATED:
        run_migrations()
        MIGRATED = True

    return SessionLocal()
