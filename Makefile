test:
	pytest ./server -vv
build_data:
	python3 ./scripts/build.py

build_search:
	python3 ./scripts/build_search.py

build_packing_catalog:
	python3 ./scripts/build_packing_catalog.py

build_packing:
	python3.9 ./scripts/build_packing.py

build_server:
	cd server; docker build . -t joram87/triptracks2:latest
	docker push joram87/triptracks2:latest

start_web:
	cd web; REACT_APP_ENVIRONMENT=local yarn start

start_server:
	cd ./server/; uvicorn src:app --reload

start_db:
	docker run -d --rm --name triptracks-db -e POSTGRES_USER=triptracks -e POSTGRES_PASSWORD=triptracks -e POSTGRES_DB=triptracks -p 5432:5432 -v triptracks_pg_local:/var/lib/postgresql postgis/postgis:18-3.6

# Load trail files from scripts/build.py into PostGIS (uses DATABASE_URL, defaults to local db).
TRAIL_DATA ?= $(CURDIR)/trail_data
load_trails:
	cd server/src; python3 -m db.load_trails $(TRAIL_DATA)

# One-off copy of user data from the legacy SQLite db into Postgres.
migrate_sqlite:
	cd server/src; python3 -m db.migrate_sqlite_to_postgres ../database.db

_deploy_build:
	cd web; npm run build

_deploy_push_all:
	aws --profile=personal s3 sync ./web/build s3://app2.triptracks.io

_deploy_push_code:
	aws --profile=personal s3 sync ./web/build s3://app2.triptracks.io --exclude "*trails*" --exclude "*peaks*"  --exclude "*trail_details*"

_flush_cloudfront:
	aws --profile=personal cloudfront create-invalidation --distribution-id E2N3JQ7MM2HSJI --paths="/*"

_update_browser_list:
	cd web; npx browserslist@latest --update-db

deploy_all:	_deploy_build _deploy_push_all _flush_cloudfront
deploy:	_update_browser_list _deploy_build _deploy_push_code _flush_cloudfront


# Start the prod PostGIS container on the NAS and wait until it's healthy.
deploy_db:
	ssh 192.168.1.123 "cd /home/john/projects/nas; docker compose up -d --wait triptracks2-db"

# One-off: back up the prod SQLite db, then copy its user data into prod Postgres.
# Refuses to run if Postgres already has rows.
migrate_prod_db: deploy_db
	ssh 192.168.1.123 "cd /home/john/projects/nas; cp services/triptracks2/database.db services/triptracks2/database.db.bak-$$(date +%Y%m%d%H%M%S)"
	ssh 192.168.1.123 "cd /home/john/projects/nas; docker exec triptracks2 python -m db.migrate_sqlite_to_postgres /data/database.db"

deploy_server: build_server deploy_db
	ssh 192.168.1.123 "cd /home/john/projects/nas; docker compose pull triptracks2 && docker compose up -d triptracks2"
	ssh 192.168.1.123 "cd /home/john/projects/nas; docker compose logs --tail 50 triptracks2"
server_logs:
	ssh 192.168.1.123 "cd /home/john/projects/nas; docker compose logs -f triptracks2"

build_api_type_definitions:
	cd web; npx openapi-typescript https://triptracks2.oram.ca/openapi.json --output ./src/types/triptracks.d.ts

pull_db:
	cd server; scp saintNectaire:/home/john/projects/nas/services/triptracks2/database.db ./database.db

push_db:
	cd server; scp ./database.db saintNectaire:/home/john/projects/nas/services/triptracks2/database.db
