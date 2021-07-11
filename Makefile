build_trails:
	python3 ./scripts/build_trails.py

start:
	cd triptracks; yarn start

_deploy_build:
	cd triptracks; yarn build

_deploy_push_all:
	aws s3 sync ./triptracks/build s3://app2.triptracks.io

_deploy_push_code:
	aws s3 sync ./triptracks/build s3://app2.triptracks.io --exclude "*trails*"

deploy:	_deploy_build _deploy_push_all
deploy_code:	_deploy_build _deploy_push_code
