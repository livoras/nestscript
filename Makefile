run:
	./nsc/bin/run compile ./example/page.nes ./example/main
	./nsc/bin/run run ./example/main
build-dist:
	npx tsc
	npx webpack
watch:
	npx nodemon -e nes --exec "make run" example
