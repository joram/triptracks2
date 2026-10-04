"""One-off copy of the legacy SQLite database into Postgres.

Usage (from server/src, or /src inside the api container):
    DATABASE_URL=postgresql://... python -m db.migrate_sqlite_to_postgres /path/to/database.db

Refuses to run if the target tables already contain rows.
"""
import sys

from sqlalchemy import create_engine, func, inspect, select

from db.database import Base, engine as target_engine, run_migrations
from db.models import prefixed_id


def main(sqlite_path: str):
    if target_engine.dialect.name != "postgresql":
        sys.exit("DATABASE_URL must point at Postgres")

    run_migrations()
    source_engine = create_engine(f"sqlite:///{sqlite_path}")

    source_tables = set(inspect(source_engine).get_table_names())
    tables = [t for t in Base.metadata.sorted_tables if t.name in source_tables]

    with source_engine.connect() as src, target_engine.begin() as dst:
        for table in tables:
            count = dst.execute(select(func.count()).select_from(table)).scalar()
            if count:
                sys.exit(f"{table.name} already has {count} rows; aborting")

        known_ids = {}
        for table in tables:
            rows = [dict(r._mapping) for r in src.execute(select(table))]
            kept, skipped = [], 0
            for row in rows:
                if row["id"] is None:
                    if table.name != "users":
                        skipped += 1
                        continue
                    # Legacy SQLite allowed NULL primary keys on users.
                    row["id"] = prefixed_id("user")
                user_id = row.get("user_id")
                if "user_id" in row and user_id not in known_ids.get("users", set()):
                    print(f"  skipping orphan {table.name} {row['id']} (user_id={user_id})")
                    skipped += 1
                    continue
                kept.append(row)

            if kept:
                dst.execute(table.insert(), kept)
            known_ids[table.name] = {r["id"] for r in kept}
            print(f"{table.name}: copied {len(kept)}, skipped {skipped}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
