test:
	./nsc/bin/run compile ./example/fib.nes ./example/main
	./nsc/bin/run run ./example/main
build:
	npx tsc
	npx webpack


