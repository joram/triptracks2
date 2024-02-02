test:
	pytest ./server -vv
build_data:
	python3 ./scripts/build.py

build_search:
	python3 ./scripts/build_search.py

build_packing:
	python3.9 ./scripts/build_packing.py

build_server:
	cd server; docker build . -t joram87/triptracks2:latest
	docker push joram87/triptracks2:latest

start_web:
	cd web; REACT_APP_ENVIRONMENT=local yarn start

start_server:
	cd ./server/; uvicorn src:app --reload

_deploy_build:
	cd web; yarn build

_deploy_push_all:
	aws s3 sync ./web/build s3://app2.triptracks.io

_deploy_push_code:
	aws s3 sync ./web/build s3://app2.triptracks.io --exclude "*trails*" --exclude "*peaks*"  --exclude "*trail_details*"

_flush_cloudfront:
	aws cloudfront create-invalidation --distribution-id E2N3JQ7MM2HSJI --paths="/*"

_update_browser_list:
	cd web; npx browserslist@latest --update-db

deploy_all:	_deploy_build _deploy_push_all _flush_cloudfront
deploy:	_update_browser_list _deploy_build _deploy_push_code _flush_cloudfront


deploy_server: build_server
	ssh 192.168.1.220 "cd /home/john/projects/nas; docker compose pull triptracks2 && docker compose up -d triptracks2"
	ssh 192.168.1.220 "cd /home/john/projects/nas; docker compose logs -f triptracks2"
server_logs:
	ssh 192.168.1.220 "cd /home/john/projects/nas; docker compose logs -f triptracks2"

build_openapi_client:
	docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli bash -c "rm -r /local/client/* || true"
	docker run --rm -v "${PWD}:/local" -e uid=1000 -e gid=1000 openapitools/openapi-generator-cli generate \
		-i https://triptracks2.oram.ca/openapi.json \
		-g javascript \
		--additional-properties=apiPackage=triptracks,projectName=triptracks,prependFormOrBodyParameters=true,usePromises=true, \
		-o /local/client
    sudo chown john:john -R ./client
	cd client; npm remove triptracks; npm install ../client