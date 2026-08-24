# Test262 ES5 compatibility runner

This runner measures NestScript against the official Test262 `es5-tests`
branch. The suite stays outside this repository so that NestScript does not
vendor thousands of upstream files.

Clone the pinned upstream branch next to this repository:

```sh
git clone --depth 1 --branch es5-tests --single-branch \
  https://github.com/tc39/test262.git ../test262-es5
```

The expected upstream revision is
`7da91bceb9ce7613f87db47ddd1292a2dda58b42`.

Run the ES5 language chapters (6 through 14):

```sh
npm run test262
```

Useful options:

```sh
npm run test262 -- --match ch11/11.6 --limit 100
npm run test262 -- --scope all-es5
npm run test262 -- --jobs 8
npm run test262 -- --json /tmp/nestscript-test262.json
TEST262_ROOT=/path/to/test262 npm run test262
```

Tests which invoke `eval` or the `Function` constructor are reported as
`skipped-dynamic-code`. They are outside NestScript's target environment and
are not counted in the pass rate. Each executed test has a VM instruction limit
so a broken loop cannot hang the whole conformance run. Every case executes in
a fresh process because Test262 cases may make non-configurable changes to
shared intrinsic prototypes.

The latest measured baseline and interpretation are in [RESULTS.md](RESULTS.md).
