build_data:
	python3 ./scripts/build.py

start:
	cd triptracks; yarn start

_deploy_build:
	cd triptracks; yarn build

_deploy_push_all:
	aws s3 sync ./triptracks/build s3://app2.triptracks.io

_deploy_push_code:
	aws s3 sync ./triptracks/build s3://app2.triptracks.io --exclude "*trails*" --exclude "*peaks*"

deploy_all:	_deploy_build _deploy_push_all
deploy:	_deploy_build _deploy_push_code
