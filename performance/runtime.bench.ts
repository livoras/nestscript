import { compileJavaScriptToBytecode, createVMFromArrayBuffer } from '../src'

interface IBenchmarkCase {
  name: string
  source: string
  expected: number
  minimumIterationsPerSecond: number
}

interface IBenchmarkResult {
  name: string
  bytecodeBytes: number
  medianMilliseconds: number
  iterationsPerSecond: number
  minimumIterationsPerSecond: number
}

const getArgument = (name: string): string | undefined => {
  const prefix = `--${name}=`
  const argument = process.argv.find((value): boolean => value.startsWith(prefix))
  return argument ? argument.slice(prefix.length) : undefined
}

const iterations = Number(getArgument('iterations') || 100000)
const shouldAssert = process.argv.includes('--assert')
const warmupRuns = Number(getArgument('warmups') || 3)
const measuredRuns = Number(getArgument('samples') || 7)

if (!Number.isInteger(iterations) || iterations <= 0) {
  throw new Error('--iterations must be a positive integer')
}

const expectedArithmetic = ((): number => {
  let sum = 0
  for (let i = 0; i < iterations; i++) {
    // tslint:disable-next-line: no-bitwise
    sum = (sum + i) | 0
  }
  return sum
})()

const cases: IBenchmarkCase[] = [
  {
    name: 'arithmetic-loop',
    source: `
      var sum = 0
      var i = 0
      while (i < ${iterations}) {
        sum = (sum + i) | 0
        i = i + 1
      }
      result = sum
    `,
    expected: expectedArithmetic,
    minimumIterationsPerSecond: 850000,
  },
  {
    name: 'vm-function-calls',
    source: `
      function add(a, b) {
        return (a + b) | 0
      }
      var sum = 0
      var i = 0
      while (i < ${iterations}) {
        sum = add(sum, i)
        i = i + 1
      }
      result = sum
    `,
    expected: expectedArithmetic,
    minimumIterationsPerSecond: 500000,
  },
  {
    name: 'property-read-write',
    source: `
      var object = { value: 0 }
      var i = 0
      while (i < ${iterations}) {
        object.value = object.value + 1
        i = i + 1
      }
      result = object.value
    `,
    expected: iterations,
    minimumIterationsPerSecond: 700000,
  },
]

const elapsedMilliseconds = (start: [number, number]): number => {
  const elapsed = process.hrtime(start)
  return elapsed[0] * 1000 + elapsed[1] / 1e6
}

const median = (values: number[]): number => {
  const sorted = values.slice().sort((left, right): number => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

const compile = (source: string): ArrayBuffer => {
  return compileJavaScriptToBytecode(source)
}

const measure = (benchmark: IBenchmarkCase): IBenchmarkResult => {
  const bytecode = compile(benchmark.source)
  const samples: number[] = []

  for (let run = 0; run < warmupRuns + measuredRuns; run++) {
    const context: any = {}
    const vm = createVMFromArrayBuffer(bytecode, context)
    const start = process.hrtime()
    vm.run()
    const milliseconds = elapsedMilliseconds(start)

    if (context.result !== benchmark.expected) {
      throw new Error(`${benchmark.name} produced ${context.result}; expected ${benchmark.expected}`)
    }
    if (run >= warmupRuns) {
      samples.push(milliseconds)
    }
  }

  const medianMilliseconds = median(samples)
  return {
    name: benchmark.name,
    bytecodeBytes: bytecode.byteLength,
    medianMilliseconds,
    iterationsPerSecond: iterations * 1000 / medianMilliseconds,
    minimumIterationsPerSecond: benchmark.minimumIterationsPerSecond,
  }
}

const results = cases.map(measure)

for (const result of results) {
  const status = result.iterationsPerSecond >= result.minimumIterationsPerSecond ? 'PASS' : 'FAIL'
  console.log([
    status,
    result.name,
    `${Math.round(result.iterationsPerSecond).toLocaleString()} iterations/s`,
    `${result.medianMilliseconds.toFixed(2)} ms`,
    `${result.bytecodeBytes} bytes`,
    `target ${result.minimumIterationsPerSecond.toLocaleString()} iterations/s`,
  ].join(' | '))
}

console.log(JSON.stringify({
  node: process.version,
  arch: process.arch,
  platform: process.platform,
  iterations,
  warmupRuns,
  measuredRuns,
  results,
}, null, 2))

if (shouldAssert) {
  const failures = results.filter((result): boolean => {
    return result.iterationsPerSecond < result.minimumIterationsPerSecond
  })
  if (failures.length > 0) {
    throw new Error(`Runtime performance targets missed: ${failures.map((result): string => result.name).join(', ')}`)
  }
}
