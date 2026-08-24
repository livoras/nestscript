# Runtime performance benchmarks

The runtime benchmark measures bytecode execution only. JavaScript parsing,
assembly generation, bytecode generation, and VM construction happen outside
the timed region.

Run the report without enforcing thresholds:

```sh
npm run benchmark:runtime
```

Run the performance regression gate:

```sh
npm run test:performance
```

The gate uses median throughput after warm-up and covers arithmetic loops, VM
function calls, and object property access. It is intentionally separate from
the correctness suite because absolute timing is sensitive to hardware, power
management, and the host JavaScript engine.

Iterations and sampling can be adjusted when investigating a regression:

```sh
node -r ts-node/register performance/runtime.bench.ts \
  --iterations=200000 --warmups=5 --samples=10
```
