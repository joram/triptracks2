build_data:
	python3 ./scripts/build.py

build_search:
	python3 ./scripts/build_search.py

build_packing:
	python3.9 ./scripts/build_packing.py

start_web:
	cd web; yarn start

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

deploy_all:	_deploy_build _deploy_push_all _flush_cloudfront
deploy:	_deploy_build _deploy_push_code _flush_cloudfront
