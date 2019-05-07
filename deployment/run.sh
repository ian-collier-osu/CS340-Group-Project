#!/bin/bash

build() {
	rootDir="$(git rev-parse --show-toplevel)"
	pushd "$rootDir" > /dev/null

	docker image build . --tag "cs340-proj" \
						 --file "$rootDir"/deployment/Dockerfile

	popd

}

run() {
	docker run -p 80:8000 -it cs340-proj:latest
}

run-headless() {
	docker run -p 80:8000 -d cs340-proj:latest
}

deploy() {
	set -e
	build
	run
}

case $1 in
  build|run|deploy|run-headless) "$1" ;;
  *) echo "Usage: ./run.sh [build/run/run-headless/deploy]" ;;
esac
