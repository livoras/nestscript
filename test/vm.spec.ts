import { expect } from 'chai'
import {
  compileProgramFromJavaScript,
  createVMFromArrayBuffer,
  createVMFromJavaScript,
  deserializeProgram,
  VirtualMachine,
  serializeProgram,
  Opcode,
  UnsupportedOpcodeError,
} from '../src'

const runVM = (source: string): any => {
  const context: any = {}
  createVMFromJavaScript(source, context).run()
  return context
}

describe('canonical register VM', (): void => {
  it('executes arithmetic, branches, and global writes', (): void => {
    const source = `
      var sum = 0
      var i = 0
      while (i < 25) {
        if ((i % 2) === 0) sum = (sum + i) | 0
        i = i + 1
      }
      result = sum
    `
    expect(runVM(source).result).equal(156)
  })

  it('lowers the canonical accumulator loop to one loop kernel', (): void => {
    const source = `
      var sum = 0
      var i = 0
      while (i < 100) {
        sum = (sum + i) | 0
        i = i + 1
      }
      result = sum
    `
    const context: any = {}
    const vm = createVMFromJavaScript(source, context)
    vm.run()
    expect(context.result).equal(4950)
    expect(vm.stats.loopKernelHits).equal(1)
  })

  it('snapshots PUSH arguments before later register writes', (): void => {
    const source = `
      function difference(left, right) { return left - right }
      var first = 7
      var second = 2
      result = difference(first, second)
    `
    expect(runVM(source).result).equal(5)
  })

  it('uses call and property caches without changing observable values', (): void => {
    const source = `
      function add(left, right) { return left + right }
      var object = { value: 0 }
      var i = 0
      while (i < 8) {
        object.value = add(object.value, 1)
        i = i + 1
      }
      result = object.value
    `
    const context: any = {}
    const vm = createVMFromJavaScript(source, context)
    vm.run()
    expect(context.result).equal(8)
    expect(vm.stats.callCacheHits).greaterThan(0)
    expect(vm.stats.propertyCacheHits).greaterThan(0)
    expect(vm.stats.numericFastPathHits).greaterThan(0)
  })

  it('falls back to generic JavaScript arithmetic when types change', (): void => {
    const context: any = {}
    createVMFromJavaScript(`
      var value = 1
      value = value + 1
      value = 'value'
      result = value + 1
    `, context).run()
    expect(context.result).equal('value1')
  })

  it('supports calls, object properties, and context access', (): void => {
    const source = `
      function add(left, right) { return left + right }
      var object = { value: 4 }
      object.value = add(object.value, 6)
      result = object.value
    `
    const context: any = { hostValue: 3 }
    createVMFromJavaScript(source, context).run()
    expect(context.result).equal(10)
  })

  it('exposes guest functions as ordinary host callables', (): void => {
    const context: any = {}
    createVMFromJavaScript('result = function(value) { return value + 1 }', context).run()
    expect(context.result(4)).equal(5)
  })

  it('emits static specializations and fused store superinstructions', (): void => {
    const program = compileProgramFromJavaScript('var value = 1; value = value + 2; result = value;')
    const superInstruction = program.instructions.find(
      (item): boolean => item.op === Opcode.SUPER_BINARY_STORE,
    )
    expect(superInstruction).to.not.equal(undefined)
    expect(superInstruction!.flags).equal(Opcode.ADD_CONST)
  })

  it('round-trips fixed-width bytecode through ArrayBuffer', (): void => {
    const source = 'var value = 40; result = value + 2;'
    const program = compileProgramFromJavaScript(source)
    const buffer = serializeProgram(program)
    const decoded = deserializeProgram(buffer)
    expect(decoded.version).equal(program.version)
    expect(decoded.functions).deep.equal(program.functions)
    expect(decoded.constants).deep.equal(program.constants)
    expect(decoded.globalNames).deep.equal(program.globalNames)
    const context: any = {}
    createVMFromArrayBuffer(buffer, context).run()
    expect(context.result).equal(42)
    expect(new VirtualMachine(decoded, {}).run()).equal(undefined)
  })

  it('rejects syntax outside the canonical lowering contract', (): void => {
    expect((): any => compileProgramFromJavaScript('var outer = 1; result = function() { return outer }'))
      .to.throw(UnsupportedOpcodeError)
  })

  it('does not accept the removed bytecode magic', (): void => {
    const buffer = new ArrayBuffer(64)
    new DataView(buffer).setUint32(0, 0x3256534e, true)
    expect((): any => deserializeProgram(buffer)).to.throw('Not a NestScript bytecode buffer')
  })
})
