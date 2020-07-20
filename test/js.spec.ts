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
    expect(a.b).equal('night')
    `)
  })
})

describe("binary operators", (): void => {
  it("a + b", (): void => {
    tm(`
      const a = 1
      const b = 2
      expect(a + b).equal(3)
      expect(a).equal(1)
      expect(b).equal(2)
    `)
  })

  it("a - b", (): void => {
    tm(`
      const a = 1
      const b = 2
      expect(a - b).equal(-1)
      expect(a).equal(1)
      expect(b).equal(2)
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

  it("a / b", (): void => {
    tm(`
    const a = 25
    const b = 5
    expect(a / b).equal(5)
    expect(a).equal(25)
    expect(b).equal(5)
    `)
  })

  it("<, >, <=, >=", (): void => {
    tm(`
    const a = 25
    const b = 5
    expect(a > b).equal(true)
    expect(b < a).equal(true)
    expect(a < b).equal(false)
    expect(b > a).equal(false)
    expect(1 >= 5).equal(false)
    expect(1 >= 1).equal(true)
    expect(1 >= 0).equal(true)
    expect(1 <= 0).equal(false)
    expect(5 <= 5).equal(true)
    expect(a).equal(25)
    expect(b).equal(5)
    `)
  })

  it('a % b', (): void => {
    tm(`
    const a = 25
    const b = 5
    expect(a % b).equal(0)
    expect(b % a).equal(5)
    expect(a).equal(25)
    expect(b).equal(5)
    `)
  })

  it('+=, -=, /=, *=, &=, |=', (): void => {
    tm(`
    let a = 5
    let b = 1
    a += b
    expect(a).equal(6)
    expect(b).equal(1)
    a -= b
    expect(a).equal(5)
    expect(b).equal(1)
    const c = 2
    a *= c
    expect(a).equal(10)
    expect(c).equal(2)
    a /= c
    expect(a).equal(5)
    expect(c).equal(2)
    let d = 0b001
    let e = 0b010
    d |= e
    expect(d).equal(0b011)
    d &= e
    expect(d).equal(0b010)
    `)
  })

  it("<< && >>", (): void => {
    tm(`
    const a = 1
    expect(a << 1).equal(2)
    expect(a << 2).equal(4)
    expect(a << 3).equal(8)

    const b = 16
    expect(b >> 1).equal(8)
    expect(b >> 2).equal(4)
    expect(b >> 3).equal(2)
    `)
  })

  it('&, | , ^', (): void => {
    tm(`
    const a = 1
    const b = 2
    expect(a | b | 4).equal(7)
    expect(a | b).equal(3)
    expect(a & b).equal(0)
    expect(a).equal(1)
    expect(b).equal(2)
    expect(0b001 & 0b010).equal(0b000)
    expect(0b001 | 0b010).equal(0b011)
    expect(0b001 ^ 0b110).equal(0b111)
    `)
  })

  it('||, &&', (): void => {
    tm(`
    const a = true
    const b = false
    expect(a && b).equal(false)
    expect(a || b).equal(true)
    `)
  })

  it('===', (): void => {
    tm(`
    const a = 1
    const b = '1'
    expect(a === 1).equal(true)
    expect(a !== 1).equal(false)
    expect(a === '1').equal(false)
    expect(a !== '1').equal(true)
    expect(a).equal(1)
    expect(b).equal('1')
    `)
  })

  // TODO
  // it('instanceof', (): void => {
  //   tm(`
  //   const a
  //   `)
  // })

})

describe('conditional expression and if else expression', (): void => {
  it('a ? 1: 0', (): void => {

  })
})
