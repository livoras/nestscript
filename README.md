<p align="center">
  <img src="docs/logo-readme.svg" alt="NestScript" width="360">
</p>

<h1 align="center">NestScript</h1>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  A JavaScript-to-bytecode compiler and a compact register virtual machine for
  runtimes where <code>eval</code>, <code>new Function</code>, and dynamic source
  execution are unavailable.
</p>

<p align="center">
  <a href="https://github.com/livoras/nestscript/actions/workflows/node.js.yml"><img src="https://github.com/livoras/nestscript/actions/workflows/node.js.yml/badge.svg" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/nestscript"><img src="https://img.shields.io/npm/v/nestscript.svg" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/livoras/nestscript.svg" alt="MIT license"></a>
</p>

NestScript compiles source code ahead of time into a fixed-width binary program.
The target runtime loads that program and executes it with a JavaScript VM; it
never parses or evaluates the original source.

This is useful for WeChat Mini Programs, CSP-restricted applications, embedded
JavaScript hosts, and other environments that allow ordinary JavaScript but
reject dynamic code generation.

> [!IMPORTANT]
> NestScript is an execution mechanism, not a security sandbox. Guest code can
> call functions and mutate objects exposed through the host context. Execute
> only trusted bytecode and expose the smallest practical host API.

## Architecture

![NestScript compilation and runtime architecture](docs/architecture.png)

The repository has one runtime and one public bytecode contract:

1. The compiler parses JavaScript and lowers it through an internal assembly
   representation.
2. The bytecode writer emits a versioned, fixed-width instruction stream.
3. The register VM executes packed instructions with numeric fast paths,
   static superinstructions, property caches, call caches, and loop kernels.

The compiler is intended for a trusted build step. The deployed application
needs only the runtime bundle, bytecode, and an explicit host context.

## Installation

```sh
npm install nestscript
```

The package includes the `nsc` command-line compiler and the browser bundle at
`dist/vm.js`.

## Quick start

Create `main.js`:

```js
function greet(name) {
  return 'Hello, ' + name + '!'
}

result = greet('NestScript')
```

Compile and run it:

```sh
npx nsc compile main.js main.nsc
npx nsc run main.nsc
```

The generated `main.nsc` contains bytecode, not source text.

## JavaScript API

```js
const {
  compileJavaScriptToBytecode,
  createVMFromArrayBuffer,
  createVMFromJavaScript,
} = require('nestscript')

const context = {
  console,
  Math,
  reportMetric(name, value) {
    // Host application bridge.
  },
}

const bytecode = compileJavaScriptToBytecode('result = 40 + 2')
const vm = createVMFromArrayBuffer(bytecode, context)
vm.run()
console.log(context.result) // 42
```

`createVMFromJavaScript` is convenient for trusted Node.js tooling. In a
restricted runtime, compile during the build and ship only the resulting
`ArrayBuffer`.

The context object is the guest global object. Values are shared with the host,
so guest code can invoke exposed functions and mutate exposed objects. Do not
pass an unrestricted `window` or `globalThis` object when a smaller context is
enough.

## Browser and mini-program runtimes

Load `dist/vm.js` as a UMD script. It exposes the package API as `NestScript`
on the host global object:

```html
<script src="/vendor/nestscript/vm.js"></script>
<script>
  fetch('/programs/main.nsc')
    .then(function (response) { return response.arrayBuffer() })
    .then(function (bytecode) {
      var vm = NestScript.createVMFromArrayBuffer(bytecode, {
        console: console,
        Math: Math,
      })
      vm.run()
    })
</script>
```

The same loading model works with platform networking APIs that return an
`ArrayBuffer`, including WeChat Mini Programs.

## Supported language surface

The canonical compiler currently covers the performance-critical core used by
the VM benchmarks: variables, literals, arithmetic and comparison operators,
branches, loops, functions, calls, object and array creation, property access,
global/context access, and host function calls.

Unsupported syntax fails during compilation with `UnsupportedOpcodeError`; it is
never silently evaluated by the host. ES modules, classes, `eval`, and the
`Function` constructor are outside the contract. Closure capture, exception
routing, and several legacy reference operations are also pending compiler
lowering work. Keep the source-level compatibility matrix in tests when adding
new syntax.

## CLI

| Command | Description |
| --- | --- |
| `nsc compile <source.js> <output>` | Compile JavaScript to binary bytecode. |
| `nsc codegen <source.js> <output.nes>` | Emit the internal assembly form for inspection. |
| `nsc run <bytecode>` | Execute bytecode with a Node.js host context. |

## Development

```sh
git clone https://github.com/livoras/nestscript.git
cd nestscript
npm install
npm test
npm run build
```

Project layout:

- `src/compiler/` — parser, source lowering, and compiler-only IR helpers.
- `src/vm.ts` — the single packed register VM and bytecode serializer.
- `src/js.ts` — source-oriented convenience API.
- `src/cli.ts` — the Node.js CLI adapter.
- `dist/vm.js` — generated UMD browser bundle.
- `test/` — canonical runtime and bytecode regression tests.

Performance checks are available with `npm run test:performance`. They report
iterations per second and validate the expected result for every benchmark.

## Security and trust

NestScript is not a sandbox. Treat bytecode like executable application code,
authenticate remotely delivered programs, and expose a deliberately small host
context.

## License

NestScript is released under the [MIT License](LICENSE).
