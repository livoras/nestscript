import { createVMFromJavaScript } from '../src/js'
import { expect } from 'chai'

const tm = (codes: string, ctx: any = {}): void => {
  const c = { expect, Date, console, ...ctx }
  const vm = createVMFromJavaScript(codes, c)
  vm.run()
}

// const tm = (codes: string, ctx): void => {
//   return t(`
//     ${codes}
//   `)
// }

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
  it("a = b = 1", (): void => {
    tm(`
    let a = 1
    expect(a).equal(1)
    const b = a = 3
    expect(a).equal(b)
    expect(b).equal(3)
    `)
  })

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
    tm(`
    const a = 100
    const b = 10
    const c = 5
    const d = a > 50
      ? b < 10
        ? 1
        : 2
      : c > 3
        ? 4
        : 5
    expect(d).equal(2)
    `)

  })
})

describe('class', (): void => {
  it(`new and instanceof`, (): void => {
    tm(`
    const a = new Date()
    expect(a instanceof Date).equal(true)
    `)
  })
})

describe('function', (): void => {
  it('call function of virtual machine', (): void => {
    tm(`
    const a = (b, c) => b + c
    const d = a
    expect(a(1, 2)).equal(3)
    expect(d(2, 3)).equal(5)
    `)
  })

  it('call function of raw js', (): void => {
    tm(`
    const a = console.log
    expect(outFunc(1, 2)).equal(-1)
    `, { outFunc: (a: number, b: number): number => a - b })
  })

  it('call function of virual machine from raw js', (): void => {
    tm(`
    wrapper.sub = (a, b) => a - b
    expect(wrapper.getResult(100, 50)).equal(50)
    expect(wrapper.sub(39, 20)).equal(19)
    `, {
      wrapper: {
        getResult(a: number, b: number): number {
          return this.sub(a, b)
        },
        sub(a: number, b: number): number {
          throw new Error('This method should be rewritten by vm')
        },
      },
    })
  })

  it('call function of virual machine from raw js with proper this', (): void => {
    tm(`
    wrapper.sub = function (a, b) {
      console.log(this, a - b + this.a, 'this is the result')
      return a - b + this.a + this.c
    }
    expect(wrapper.sub(39, 20)).equal(120)
    expect(wrapper.getResult(100, 50)).equal(151)
    `, {
      wrapper: {
        a: 100,
        c: 1,
        getResult(a: number, b: number): number {
          return this.sub(a, b)
        },
        sub(a: number, b: number): number {
          throw new Error('This method should be rewritten by vm')
        },
      },
    })
  })

  it('call function of vm from vm with proper this', (): void => {
    tm(`
    const wrapper = {
      a: 100,
      c: 1,
      getResult(a, b) {
        return this.sub(a, b)
      },
      sub(a, b) {
        throw new Error('This method should be rewritten by vm')
      },
    }
    wrapper.sub = (a, b) => a - b + this.a + this.c
    expect(wrapper.sub(39, 20)).equal(120)
    expect(wrapper.getResult(100, 50)).equal(151)
    `)
  })

  it(`call function of vm nested with function of vm`, (): void => {
    const ctx = { wrapper: {
      say (): number {
        throw new Error('should be rewritten.')
      },
      run (): number {
        return this.say()
      },
      add (a: number, b: number): number {
        return a + b
      },
    } }
    tm(`
    wrapper.say = function() {
      const a = this.say2()
      return a + 1
    }
    wrapper.say2 = function() {
      return 2
    }
    const add = wrapper.add
    expect(wrapper.run()).equal(3)
    expect(add(3, 5)).equal(8)
    `, ctx)
    expect(ctx.wrapper.run()).equal(3)
  })

  it(`new vm function as class`, (): void => {
    tm(`
    function People() {
      this.a = 1
      this.b = 2
    }
    People.prototype.add = function() {
      return this.a + this.b
    }
    const people = new People()
    // console.log('====>', people, People, people instanceof People)
    expect(people.a).equal(1)
    expect(people.b).equal(2)
    expect(people.add()).equal(3)
    `)
  })
})
