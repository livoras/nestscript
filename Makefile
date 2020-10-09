run:
	# ./nsc/bin/run compile ./example/js.nes ./example/main
	./nsc/bin/run run ./example/main
build-dist:
	npx tsc
	npx webpack
watch:
	npx nodemon -e nes --exec "make run" example
js:
	 ./nsc/bin/run codegen ./example/main.js ./example/js.nes
	 ./nsc/bin/run compile ./example/js.nes ./example/main
	 make run
lodash:
	 cp example/lodash.min.js ~/git/mqtt-demo/static/lodash.min.js
	 ./nsc/bin/run codegen ./example/lodash.min.js ./example/lodash.nes
	 ./nsc/bin/run compile ./example/lodash.nes ./example/main
	 make run
	 cp example/main ~/git/mqtt-demo/static
loader:
	rm -fr ~/git/mqtt-demo/static/src/loader/vm
	cp -a src/vm ~/git/mqtt-demo/static/src/loader/vm
	cp -a src/utils.ts ~/git/mqtt-demo/static/src/loader
	cp -a src/scope.ts ~/git/mqtt-demo/static/src/loader
cov:
	npm run cov
	CODECOV_TOKEN="fd02f663-150e-479f-925d-6f6c2aa634ff" bash <(curl -s https://codecov.io/bash)
