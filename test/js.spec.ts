import { createOperantBuffer, getOperatantByBuffer } from '../src/utils'
import { IOperatantType } from '../src/vm/vm'
import { expect } from 'chai'
import { tm, makeSpy } from './utils'
const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

describe('variable scope', (): void => {
  it('outer variable should not be overwritter', (): void => {
    tm(`
    const a = 1
    const b = () => {
      let a = 2
      expect(a).equal(2)
    }
    b()
    expect(a).equal(1)
    `)
  })

  it('outer variable can be accessed', (): void => {
    tm(`
    let a = 1
    const b = () => {
      a = 2
    }
    expect(a).equal(1)
    b()
    expect(a).equal(2)
    `)
  })
})

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
  it('undefined variable', (): void => {
    tm(`
    var undefined
    var n = undefined
    if (n === undefined) {
      console.log(n)
    } else {
      console.log("undefined")
    }
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

  it('a++, ++a', (): void => {
    tm(`
    let a = 1
    let b = 1
    expect(a++).equal(1)
    expect(++b).equal(2)
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

  it('in', (): void => {
    tm(`
    const a = 'name'
    const b = { 'name': 'Jerry' }
    expect(a in b).equal(true)
    `)
  })

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

  it(`if else and nested if else`, (): void => {
    const spy = makeSpy()
    tm(`
    function test(a, b) {
      if (a) {
        if (b) {
          spy()
        } else {
          throw new Error('error')
        }
        spy()
        if (!b) {
          throw new Error('error')
        } else {
          spy()
        }
      }
    }
    test(true, true)
    expect(spy).to.be.called.exactly(3)
    `, { spy, Error })
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

  it(`not passing parameter`, (): void => {
    tm(`
    const main = (a, b, c) => {
      expect(a).equal('ok')
      expect(b).equal(undefined)
      expect(c).equal(undefined)
      b = 'ok2'
      expect(b).equal('ok2')
    }
    console.log("OK")
    main('ok')
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
      this && 1
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

  it(`arguments`, (): void => {
    tm(`
    function kk(a, b, c) {
      expect(arguments.length).equal(2)
      expect(arguments[0]).equal(1)
      expect(arguments[1]).equal(2)
      expect(arguments[2]).equal(void 555)
    }
    kk(1, 2)
    `)
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

  it(`define function`, (): void => {
    tm(`
    const a = baseProperty("hello")
    console.log(a({ hello: "good" }))
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }
    `)
  })

  it(`new vm function as class`, (): void => {
    tm(`
    function People(a, b) {
      this.a = a
      this.b = b
    }
    People.prototype.add = function() {
      return this.a + this.b
    }
    const people = new People(1, 2)
    expect(people.a).equal(1)
    expect(people.b).equal(2)
    expect(people.add()).equal(3)
    expect(people instanceof People).equal(true)
    `)
  })

  it(`new function with contructor running method`, (): void => {
    tm(`
      function Locale(config) {
        if (config != null) {
            this.set(config);
        }
      }
      const proto = Locale.prototype
      proto.set = function (config) {
        expect(this instanceof Locale).equal(true)
      }
      const l = new Locale()
    `)

    tm(`
    function Hash(entries) {
      this.name = 'jerry'
      new Date()
    }
    expect(new Hash().name).to.equal('jerry')
    `)
  })

  it(`operatant type transfer`, (): void => {
    expect(
      getOperatantByBuffer(new Uint8Array(createOperantBuffer(IOperatantType.NUMBER, -3368))),
    ).deep.equal(
      [IOperatantType.NUMBER, -3368, 3],
    )

    expect(
      getOperatantByBuffer(new Uint8Array(createOperantBuffer(IOperatantType.NUMBER, -3.14159))),
    ).deep.equal(
      [IOperatantType.NUMBER, -3.14159, 8],
    )

    expect(
      getOperatantByBuffer(new Uint8Array(createOperantBuffer(IOperatantType.REGISTER, 100))),
    ).deep.equal(
      [IOperatantType.REGISTER, 100, 1],
    )
  })

  it('immediatly run function', (): void => {
    tm(`
    (function () {
      const a = [1 ,2 ,3]
      function sayHi() {
        console.log('hi')
      }
      sayHi()
    })()
    `)
  })

  it('return new function', (): void => {
    tm(`
    const newFunc = () => {
      return (a, b) => {
        return a + b
      }
    }
    const a = newFunc()
    const b = newFunc()
    expect(a).not.equal(b)
    `)
  })
})

describe('loop', (): void => {
  it(`for loop`, (): void => {
    const spy = chai.spy((): void => {})
    tm(`
    for (let i = 0; i < 100; i++) {
      spy(i)
    }
    expect(spy).to.have.been.called.exactly(100);
    expect(spy).on.nth(38).be.called.with(37)
    `, { spy })
  })

  it(`nested for loop`, (): void => {
    const spy = chai.spy((): void => {})
    tm(`
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        for (let k = 0; k < 10; k++) {
          spy(i, j, k)
        }
      }
    }
    expect(spy).to.have.been.called.exactly(1000);
    expect(spy).on.nth(37).be.called.with(0, 3, 6)
    `, { spy })
  })

  it('while loop', (): void => {
    const spy = chai.spy((): void => {})
    tm(`
      let i = 0
      while (i < 10) {
        spy()
        i++
      }
      expect(spy).to.have.been.called.exactly(10)
    `, { spy })
  })

  it('nested while loop', (): void => {
    const spy = chai.spy((): void => {})
    tm(`
      let i = 0
      while (i < 10) {
        let j = 0
        while (j < 10) {
          spy()
          j++
        }
        i++
      }
      expect(spy).to.have.been.called.exactly(100)
    `, { spy })
  })

  it('break statement', (): void => {
    const spy = chai.spy((): void => {})
    tm(`
      let i = 0
      while (i < 10) {
        let j = 0
        while (j < 10) {
          spy()
          if (j === 4) {
            break
          }
          j++
        }
        if (i === 4) {
          break
        }
        i++
      }
      expect(spy).to.have.been.called.exactly(25)
    `, { spy })
  })

  it('continue', (): void => {
    const spy = chai.spy((): void => {})
    tm(`
    let i = 0
    while (i < 10) {
      i++
      if (i % 3 === 0) {
        continue
      }
      for (let j = 0; j < 10; j++) {
        spy()
      }
    }
    expect(spy).to.have.been.called.exactly(70)
    `, { spy })
  })

  it('do while', (): void => {
    const spy = chai.spy((): void => {})
    tm(
    `
    let i = 0
    do {
      i++
      spy(i)
    } while (i < 10)
    expect(spy).to.have.been.called.exactly(10)
    expect(spy).on.nth(1).be.called.with(1)
    `, { spy })
  })

})

describe('null and undefined', (): void => {
  it('null', (): void => {
    tm(`
    const a = null
    expect(a).equal(null)
    `)
  })

  it('array of null', (): void => {
    tm(`
    const a = [null, 1]
    expect(a[0]).equal(null)
    expect(a[1]).equal(1)
    `)
  })

  it('undefined', (): void => {
    tm(`
    const a = [undefined, 1]
    expect(a[0]).equal(undefined)
    expect(a[1]).equal(1)
    `)
  })

  it('passing null as fucntion argument', (): void => {
    tm(`
    const a = [null, null]
    console.log(null, null, a)
    `)
  })
})

describe('regular expression', (): void => {
  it('normal regular expression', (): void => {
    tm(`
    const a = /\\d+/
    expect(a.test('1234331')).equal(true)
    `)
  })

  it('regular expression with flags', (): void => {
    tm(`
    const a = /HelloWorld/i
    expect(a.test('helloworld')).equal(true)

    const b = /HelloWorld/
    expect(b.test('helloworld')).equal(false)
    `)
  })
})

describe("continue and break", (): void => {
  it('label statment', (): void => {
    const spy = chai.spy((): void => {})
    tm(`
    a: {
      const n = 1
      spy()
      b: {
        if (n > 1) {
          break b
        } else {
          spy()
          break a
        }
      }
      spy()
    }
    expect(spy).to.have.been.called.exactly(2)

    d: {
      spy()
      break d
      spy()
    }

    expect(spy).to.have.been.called.exactly(3)
    `, { spy })
  })

  it('for continue', (): void => {
    const spy = makeSpy()
    tm(`
    for (let i = 0; i < 10; i++) {
      if (i % 3 === 0) { continue }
      spy()
    }
    expect(spy).to.have.been.called.exactly(6)
    `, { spy })
  })

  it(`while continue`, (): void => {
    const spy = makeSpy()
    tm(`
    let i = 0
    while (i < 10) {
      i++
      if (i % 3 === 0) { continue }
      spy()
    }
    expect(spy).to.have.been.called.exactly(7)
    `, { spy })
  })

  it(`continue with label`, (): void => {
    const spy = makeSpy()
    tm(`
    a:
    for (let i = 0; i < 10; i++) {
      b:
      for (let j = 0; j < 10; j++) {
        spy()
        if (j % 3 === 2) {
          continue a
        }
      }
    }
    expect(spy).to.have.been.called.exactly(30)
    `, { spy })
  })

  it(`while continue with label`, (): void => {
    const spy = makeSpy()
    tm(`
    let i = 0
    b:
    while (i < 10) {
      i++
      let j = 0
      c:
      while (j < 10) {
        spy()
        j++
        if (j % 3 == 0) {
          continue b
        }
      }
    }
    expect(spy).to.have.been.called.exactly(30)
    `, { spy })
  })

  it(`for in statement`, (): void => {
    tm(`
    const a = { name: 'jerry', age: 12, title: 'student' }
    const list = []
    for (var i in a) {
      list.push(i)
    }
    expect(list).to.be.deep.equal(['name', 'age', 'title'])

    const b = { name2: 'jerry', age2: 12, title2: 'student' }
    const list2 = []
    for (i in b) {
      if (i === 'title2') { break }
      list2.push(i)
    }
    expect(list2).to.be.deep.equal(['name2', 'age2'])

    const list3 = []
    for (i in b) {
      if (i === 'name2') { continue }
      list3.push(i)
    }
    expect(list3).to.be.deep.equal(['age2', 'title2'])
    `)
  })

})

describe('switch case and break', (): void => {
  const spy = makeSpy()
  it('switch case', (): void => {
    tm(`
    let i = 2
    switch(i) {
      case 0:
        console.log('ok')
        spy(1)
        break
      case 2:
        console.log(2)
        spy('ok')
      case 3:
        console.log(3)
        break
      default:
        spy('default')
        console.log("NOTHING")
    }
    expect(spy).on.nth(1).be.called.with('ok')
    `, { spy })
  })

  it('falling switch case', (): void => {
    tm(`
    const a = (i) => {
      switch(i) {
        case 1:
        case 2:
        case 3:
          return 'a'
        case 4:
          return 'b'
      }
    }
    expect(a(1)).equal('a')
    expect(a(2)).equal('a')
    expect(a(3)).equal('a')
    expect(a(4)).equal('b')
    `)
  })
})

describe("misc", (): void => {
  it('return sequence', (): void => {
    tm(`
    const a = () => {
      return (
        a ? "A" : "B",
        "C"
      );
    }
    expect(a()).equal("C")
    `)
  })

  it(`return logical`, (): void => {
    tm(`
    function pt(n, t, r) {
      return (t && r, n)
    }
    `)
  })

  it('access properties', (): void => {
    tm(`
    expect(typeof Function.prototype.toString).equal('function');
    `, { Function })
  })

  it(`isObject`, (): void => {
    tm(`
      expect(typeof isObject).equal('function')
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
      }
    `)
  })

  it(`should passing before value`, (): void => {
    tm(`
    let a = 0
    expect(a += 1).equal(1)
    expect(a).equal(1)
    `)
  })
})

describe("closure", (): void => {
  it('call function of closure variable', (): void => {
    tm(`
    const a = (add) => {
      return function() {
        return this.b + add(this.c)
      }
    }

    const ret = a((n) => ++n)
    const num = ret.call({ b: 1, c: 2 })
    expect(num).equal(4)
    `)
  })

  it(`calling function in closure`, (): void => {
    tm(`
      const a = () => {
        const b = (n) => {
          return isObject(n) ? 'OK' : 'NO OK'
        }
        expect(b({})).equal('OK')
        function isObject(value) {
          return true
        }
      }
      a()
    `)
  })

  it(`same name argument`, (): void => {
    tm(`
    (() => {
      // var name = 'jerry'
      const a = (name) => name
      expect(a('lucy')).equal('lucy')
    })()
    `)
  })

  it(`?`, (): void => {
    tm(`
      (() => {
        const hasOwnProperty = () => {}
        const getRawTag = () => {
          expect(typeof hasOwnProperty).equal('function')
          hasOwnProperty.call({})
        }
        getRawTag()
      })()
    `)
  })

  it(`shallowed variable`, (): void => {
    tm(`
    (() => {
      var n = 1
      var i = 101
      const a = () => {
        console.log(i)
        var n = 2
        return b = (i) => {
          expect(i).equal(102)
          expect(n).equal(2)
        }
      }
      const c = () => {
        expect(n).equal(1)
      }
      a()(102)
      c()
    })()
    `)
  })

  it(`multiple call returning fucntions`, (): void => {
    tm(`
    const fn = () => {
      let n = 0
      return () => {
        return n++
      }
    }
    const a = fn()
    const b = fn()
    const c = fn()
    expect(a()).equal(0)
    expect(b()).equal(0)
    expect(c()).equal(0)

    expect(a()).equal(1)
    expect(b()).equal(1)
    expect(c()).equal(1)

    expect(b()).equal(2)
    expect(c()).equal(2)
    `)
  })

  it('closure variable should made right', (): void => {
    tm(`
      function a(t) {
        function t(t) {
          console.log("OJBK")
          return t
        }
        return t
      }
      expect(typeof a(100)).equal('function')
    `)
  })

  it('closure variable should made right2', (): void => {
    tm(`
      function aa(t) {
        const kk = () => t
        function t() {}
        return t
      }
      expect(typeof aa(null)).equal('function')
    `)
  })

  it('string indexOf with empty string', (): void => {
    tm(`
        const m = ''
        const W = '\`'
        if (-1 !== m.indexOf(W)) {
          console.log("ok")
        } else {
          console.log("ok")
        }
    `)
  })

  it(`assign to membership`, (): void => {
    tm(`
const args = [1, 2, 3, 4]
const a = args.length

let s
let o
for (o = new Array(a - 1), s = 0; s < o.length; ) {
  o[s++] = args[s];
}
expect(o).deep.equal([2, 3, 4])
    `)

    tm(`
const args = [1, 2, 3, 4]
const a = args.length

let s
let o
for (o = new Array(a - 1), s = 0; s < o.length; ) {
  o[s] = args[++s];
}
expect(o).deep.equal([2, 3, 4])
    `)
  })

  it(`function expression with name`, (): void => {
    tm(`
    (function (e) {
      (function e(n) {
        if (n === 1) {
          expect(typeof e).equal('function')
        } else {
          expect(typeof e).equal('function')
          e(1)
        }
      })()
    })(1000)
    `)
  })

  it(`function expression name can be accessed in fuction body and not outer function body`, (): void => {
    tm(`
    (function(e) {
      console.log('RET -> ', e);
      expect(e).equal(1111);
      (function e() {
        expect(typeof e).equal('function')
      })()
      expect(e).equal(1111)
    })(1111)
    `)
  })

  it(`function varialbe name should not reset parameter with the same name`, (): void => {
    tm(`
    ;(function(e) {
      expect(e).equal(1)
      ;(function e(e) {
        var e
        expect(e).equal(333)
        e = 1
      })(333)
      expect(e).equal(1)
    })(1)
    `)
  })
})

describe('error handling', (): void => {
  it('normal try', (): void => {
    tm(`
    let e = 1
    try {
      k.a()
      throw new Error('ojbk')
    } catch(e) {
      expect(typeof e).equal('object')
    }
    expect(e).equal(1)
    `)
  })
})
// tslint:disable-next-line: max-file-line-count
