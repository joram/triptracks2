build_trails:
	python3 ./scripts/build_trails.py

start:
	cd triptracks; yarn start

deploy_build:
	cd triptracks; yarn build

deploy_push:
	aws s3 sync ./triptracks/build s3://app2.triptracks.io

deploy:	deploy_build deploy_push
