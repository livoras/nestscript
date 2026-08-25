# Test262 results

The previous 1.x results described a different compatibility runtime and are
not a valid 2.0.0 baseline. They are intentionally not carried forward as a
claim about the canonical engine.

## Canonical 2.0.0 language run

Run date: 2026-08-25. Test262 `es5-tests` revision:
`7da91bceb9ce7613f87db47ddd1292a2dda58b42`.

| Result | Count |
| --- | ---: |
| Discovered | 3,498 |
| Skipped dynamic-code cases | 753 |
| Executed | 2,745 |
| Passed | 282 |
| Failed | 2,463 |
| Pass rate among executed tests | 10.27% |

Failure classification: 1,621 compile failures, 839 runtime failures, and 3
negative tests that did not produce the expected failure. This is the honest
baseline after removing the compatibility runtime; it identifies the lowering
work required before claiming broad ES5 conformance.

Run a scoped measurement with:

```sh
npm run test262 -- --limit 100
```

For a reproducible release report, pin the upstream revision shown in
`test262/README.md`, run the language and full ES5 scopes, and commit the JSON
output together with the release notes. Tests that require `eval` or the
`Function` constructor remain outside NestScript's target environment.
