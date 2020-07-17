run:
	./nsc/bin/run compile ./example/js.nes ./example/main
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
