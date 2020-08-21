import { createVMFromJavaScript } from '../src/js'
const chai = require('chai')
const spies = require('chai-spies')

export const makeSpy = (): any => chai.spy((): void => {})

export const tm = (codes: string, ctx: any = {}): void => {
  const c = { expect: chai.expect, Date, console, ...ctx, Error,
    Array,
    Function,
    RegExp,
    Object,
    String,
    TypeError,
    ArrayBuffer,
    DataView,
    Math,
  }
  const vm = createVMFromJavaScript(codes, c)
  vm.run()
}
