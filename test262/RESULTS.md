# Test262 ES5 results

Run date: 2026-08-24

- NestScript base revision: `5ffca4eb2eb8aeda526efbee1452f70a57079be8`
  plus the working-tree semantic fixes described by this result.
- Test262 branch: `es5-tests`
- Test262 revision: `7da91bceb9ce7613f87db47ddd1292a2dda58b42`
- Isolation: one fresh process per test, with eight workers.
- VM instruction limit: 250,000 per test.

## ES5 language implementation (chapters 6-14)

This is the primary NestScript semantic baseline.

| Result | Count |
| --- | ---: |
| Discovered | 3,498 |
| Skipped because they use dynamic code | 753 |
| Executed | 2,745 |
| Passed | 2,745 |
| Failed | 0 |
| Pass rate among executed tests | 100.00% |

The initial isolated baseline was 2,364 passed and 381 failed (86.12%). The
implementation changes therefore resolved every executable chapters 6-14
failure without enabling dynamic code.

The main corrected semantic areas were:

- execution contexts, strict/non-strict `this`, and global bindings;
- mapped and strict arguments objects;
- references, deletion, update operators, coercion order, and discarded values;
- `with` object environments, including closure capture;
- `try`/`catch`/`finally` abrupt completions;
- array/object literal property creation, `for-in`, and function binding setup;
- ES5 global and `Number` compatibility at the host-context boundary.

## Full ES5 run

This adds chapter 15 built-ins, Annex B, and the best-practice tests. It omits
the separate 153-test `intl402` directory.

| Result | Count |
| --- | ---: |
| Discovered | 11,572 |
| Skipped because they use dynamic code | 959 |
| Executed | 10,613 |
| Passed | 10,271 |
| Failed | 342 |
| Pass rate among executed tests | 96.78% |

Detailed result classification:

| Result | Count |
| --- | ---: |
| Positive tests passed | 9,868 |
| Negative tests passed | 403 |
| Runtime failures | 268 |
| Negative tests which did not throw | 9 |
| Parse/code-generation failures | 0 |
| VM instruction-limit timeouts | 60 |
| Process wall-clock timeouts | 5 |

## Interpretation

The language score is the useful implementation result for compiler and VM
work: every in-scope, executable core-language case passes. Chapter 15 mostly
exercises Node.js built-ins passed through the VM context, so its score also
reflects modern host-engine behaviour rather than only NestScript. The remaining
full-suite failures are concentrated in `Object`, `Array`, URI helpers,
`Function`, `String`, `RegExp`, and `Date` compatibility; 65 are runner limits
rather than completed assertion failures.

The skipped cases invoke `eval` (including indirect eval) or the `Function`
constructor. They are outside NestScript's explicitly dynamic-code-free target
environment and are not included in either pass-rate denominator.

The `es5-tests` branch is a frozen historical suite from 2015. It is a stable
match for NestScript's ES5 claim, not a substitute for the current Test262 suite
when newer syntax is implemented.

Reproduce the full run with:

```sh
npm run test262 -- --scope all-es5 --jobs 8 \
  --json /tmp/nestscript-test262-es5.json
```
