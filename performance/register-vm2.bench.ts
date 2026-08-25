import { generateAssemblyFromJs } from '../src/codegen'
import { parseCodeToProgram } from '../src/assembler'
import { createVMFromArrayBuffer } from '../src/vm/vm'
import {
  compileV2FromJavaScript,
  RegisterVirtualMachine,
  serializeV2Program,
} from '../src/vm/vm2'

interface ICase {
  name: string
  source: string
  expected: number
  native: (iterations: number) => number
}

const argument = (name: string, fallback: number): number => {
  const prefix = `--${name}=`
  const value = process.argv.find((item): boolean => item.startsWith(prefix))
  return value === undefined ? fallback : Number(value.slice(prefix.length))
}

const iterations = argument('iterations', 100000)
const warmups = argument('warmups', 2)
const samples = argument('samples', 5)
if (!Number.isInteger(iterations) || iterations <= 0) throw new Error('invalid --iterations')

const expected = ((): number => {
  let value = 0
  for (let i = 0; i < iterations; i++) {
    // tslint:disable-next-line: no-bitwise
    value = (value + i) | 0
  }
  return value
})()

const cases: ICase[] = [
  {
    name: 'arithmetic-loop',
    source: `var sum = 0; var i = 0; while (i < ${iterations}) { sum = (sum + i) | 0; i = i + 1; } result = sum;`,
    expected,
    native: (count: number): number => {
      let sum = 0
      let i = 0
      while (i < count) {
        // tslint:disable-next-line: no-bitwise
        sum = (sum + i) | 0
        i = i + 1
      }
      return sum
    },
  },
  {
    name: 'function-calls',
    source: `function add(a, b) { return (a + b) | 0; } var sum = 0; var i = 0; while (i < ${iterations}) { sum = add(sum, i); i = i + 1; } result = sum;`,
    expected,
    native: (count: number): number => {
      const add = (a: number, b: number): number => {
        // tslint:disable-next-line: no-bitwise
        return (a + b) | 0
      }
      let sum = 0
      let i = 0
      while (i < count) {
        sum = add(sum, i)
        i = i + 1
      }
      return sum
    },
  },
  {
    name: 'property-read-write',
    source: `var object = { value: 0 }; var i = 0; while (i < ${iterations}) { object.value = object.value + 1; i = i + 1; } result = object.value;`,
    expected: iterations,
    native: (count: number): number => {
      const object = { value: 0 }
      let i = 0
      while (i < count) {
        object.value = object.value + 1
        i = i + 1
      }
      return object.value
    },
  },
]

const elapsed = (start: [number, number]): number => {
  const value = process.hrtime(start)
  return value[0] * 1000 + value[1] / 1e6
}

const median = (values: number[]): number => {
  const sorted = values.slice().sort((a, b): number => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

interface IPrepared {
  bytes: number
  run: () => { milliseconds: number, result: any }
}

const prepare = (item: ICase, kind: 'v1' | 'v2' | 'native'): IPrepared => {
  if (kind === 'native') {
    return {
      bytes: 0,
      run: (): { milliseconds: number, result: any } => {
        const start = process.hrtime()
        const result = item.native(iterations)
        return { milliseconds: elapsed(start), result }
      },
    }
  }
  let makeVM: (context: any) => any
  let bytes: number
  if (kind === 'v1') {
    const bytecode = parseCodeToProgram(generateAssemblyFromJs(item.source)).buffer
    bytes = bytecode.byteLength
    makeVM = (context: any): any => createVMFromArrayBuffer(bytecode, context)
  } else {
    const program = compileV2FromJavaScript(item.source)
    const bytecode = serializeV2Program(program)
    bytes = bytecode.byteLength
    makeVM = (context: any): any => new RegisterVirtualMachine(program, context)
  }
  return {
    bytes,
    run: (): { milliseconds: number, result: any } => {
      const context: any = {}
      const start = process.hrtime()
      makeVM(context).run()
      return { milliseconds: elapsed(start), result: context.result }
    },
  }
}

for (const item of cases) {
  const nativePrepared = prepare(item, 'native')
  const v1Prepared = prepare(item, 'v1')
  const v2Prepared = prepare(item, 'v2')
  const nativeSamples: number[] = []
  const v1Samples: number[] = []
  const v2Samples: number[] = []
  for (let run = 0; run < warmups + samples; run++) {
    const native = nativePrepared.run()
    const v1 = v1Prepared.run()
    const v2 = v2Prepared.run()
    if (native.result !== item.expected || v1.result !== item.expected || v2.result !== item.expected) {
      throw new Error(`${item.name}: result mismatch (${native.result}, ${v1.result}, ${v2.result}), expected ${item.expected}`)
    }
    if (run >= warmups) {
      nativeSamples.push(native.milliseconds)
      v1Samples.push(v1.milliseconds)
      v2Samples.push(v2.milliseconds)
    }
  }
  const nativeMs = median(nativeSamples)
  const v1Ms = median(v1Samples)
  const v2Ms = median(v2Samples)
  const nativeRate = iterations * 1000 / nativeMs
  const v1Rate = iterations * 1000 / v1Ms
  const v2Rate = iterations * 1000 / v2Ms
  console.log([
    item.name,
    `native ${Math.round(nativeRate).toLocaleString()}/s`,
    `V1 ${Math.round(v1Rate).toLocaleString()}/s`,
    `V2 ${Math.round(v2Rate).toLocaleString()}/s`,
    `V2/V1 ${(v2Rate / v1Rate).toFixed(2)}x`,
    `native/V2 ${(nativeRate / v2Rate).toFixed(0)}x`,
    `V1 ${v1Prepared.bytes} B`,
    `V2 ${v2Prepared.bytes} B`,
  ].join(' | '))
}
