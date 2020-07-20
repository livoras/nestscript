import { createVMFromJavaScript } from '../src/js'
import { expect } from 'chai'

const t = (codes: string, cb?: () => void): void => {
  const vm = createVMFromJavaScript(codes, { expect, cb })
  vm.run()
}

const tm = (codes: string): void => {
  return t(`
    const main = () => {
      ${codes}
    }
  `)
}

describe("uinary operators", (): void => {
  it('+a', (): void => {
    tm(`
      const a = '-1000'
      expect(+a).equal(-1000)
    `)
  })
  it('-a', (): void => {
    tm(`
      const a = 1
      expect(-a).equal(-1)
      expect(a).equal(1)
    `)
  })
  it('void 0', ():void => {
    tm(`
      const a = void 5
      expect(a).equal(undefined)
    `)
  })
  it('~a', (): void => {
    tm(`
      const a = 7
      expect(~a).equal(-8)
      expect(a).equal(7)
    `)
  })
  it('!a and true & false boolean value', (): void => {
    tm(`
      const b = true
      const a = !b
      expect(b).equal(true)
      expect(a).equal(false)
      expect(!!b).equal(true)
      expect(!!a).equal(false)
    `)
  })
  it('delete object property', (): void => {
    tm(`
    const a = { a: 'good', b: 'night' }
    expect(a.a).equal('good')
    delete a.a
    expect(a.a).equal(void 555)
    `)
  })
})

describe("binary operators", (): void => {
  it("a + b", (): void => {
    tm(`
      const a = 1
      const b = 2
      expect(a + b).equal(3)
    `)
  })

  it("a - b", (): void => {
    tm(`
      const a = 1
      const b = 2
      expect(a - b).equal(-1)
    `)
  })

  it("a * b", (): void => {
    tm(`
      const a = 5
      const b = 5
      expect(a * b).equal(25)
      expect(a).equal(5)
      expect(b).equal(5)
    `)
  })
})
