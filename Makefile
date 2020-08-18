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
	 ./nsc/bin/run codegen ./example/lodash.min.js ./example/lodash.nes
	 ./nsc/bin/run compile ./example/lodash.nes ./example/main
	 make run
