// tslint:disable: only-arrow-functions
// tslint:disable: typedef
// tslint:disable: one-variable-per-declaration
// tslint:disable: prefer-const
// tslint:disable: no-shadowed-variable
// tslint:disable: no-statements-same-line
// tslint:disable: no-var-keyword
import { tm } from './utils'
import { expect } from 'chai'
const fs = require('fs')

function toArgs(array: number[]) {
  return (function() { return arguments }.apply(undefined, array as any))
}

/** Used to detect when a function becomes hot. */
let HOT_COUNT = 150

/** Used as the size to cover large array optimizations. */
let LARGE_ARRAY_SIZE = 200

/** Used as the `TypeError` message for "Functions" methods. */
let FUNC_ERROR_TEXT = 'Expected a function'

/** Used as the maximum memoize cache size. */
let MAX_MEMOIZE_SIZE = 500

/** Used as references for various `Number` constants. */
let MAX_SAFE_INTEGER = 9007199254740991,
  MAX_INTEGER = 1.7976931348623157e+308

/** Used as references for the maximum length and index of an array. */
let MAX_ARRAY_LENGTH = 4294967295,
  MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1

/** `Object#toString` result references. */
let funcTag = '[object Function]',
  numberTag = '[object Number]',
  objectTag = '[object Object]'

/** Used as a reference to the global object. */
let root = (typeof global === 'object' && global) || this

/** Used to store lodash to test for bad extensions/shims. */
var falsey = [, null, undefined, false, 0, NaN, '']

/** Used to specify the emoji style glyph variant of characters. */
var emojiVar = '\ufe0f'

/** Used to provide empty values to methods. */
var empties = [[], {}].concat(falsey.slice(1))

/** Used for native method references. */
let arrayProto = Array.prototype,
  funcProto = Function.prototype,
  objectProto = Object.prototype,
  numberProto = Number.prototype,
  stringProto = String.prototype

/** Method and object shortcuts. */
let process = root.process,
  args = toArgs([1, 2, 3]),
  argv = process ? process.argv : undefined,
  defineProperty = Object.defineProperty,
  body = root.document ? root.document.body : undefined,
  create = Object.create,
  fnToString = funcProto.toString,
  freeze = Object.freeze,
  getSymbols = Object.getOwnPropertySymbols,
  identity = function(value: any) { return value },
  noop = function() {},
  objToString = objectProto.toString,
  params = argv,
  push = arrayProto.push,
  realm = {},
  slice = arrayProto.slice,
  strictArgs = (function(a, b, c) { 'use strict'; return arguments }(1, 2, 3))

let ArrayBuffer = root.ArrayBuffer,
  Map = root.Map,
  Promise = root.Promise,
  Proxy = root.Proxy,
  Set = root.Set,
  Symbol = root.Symbol,
  Uint8Array = root.Uint8Array,
  WeakMap = root.WeakMap,
  WeakSet = root.WeakSet

let arrayBuffer = ArrayBuffer ? new ArrayBuffer(2) : undefined,
  map = Map ? new Map : undefined,
  promise = Promise ? Promise.resolve(1) : undefined,
  set = Set ? new Set : undefined,
  symbol = Symbol ? Symbol('a') : undefined,
  weakMap = WeakMap ? new WeakMap : undefined,
  weakSet = WeakSet ? new WeakSet : undefined

/** Math helpers. */
let add = function(x: any, y: any) { return x + y },
  doubled = function(n: number) { return n * 2 },
  isEven = function(n: number) { return n % 2 == 0 },
  square = function(n: number) { return n * n }

/** Stub functions. */
let stubA = function() { return 'a' },
  stubB = function() { return 'b' },
  stubC = function() { return 'c' }

let stubTrue = function() { return true },
  stubFalse = function() { return false }

let stubNaN = function() { return NaN },
  stubNull = function() { return null }

let stubZero = function() { return 0 },
  stubOne = function() { return 1 },
  stubTwo = function() { return 2 },
  stubThree = function() { return 3 },
  stubFour = function() { return 4 }

let stubArray = function() { return [] },
  stubObject = function() { return {} },
  stubString = function() { return '' }

const read = (filename: string): string => {
  return fs.readFileSync(__dirname + '/textures/' + filename, 'utf-8')
}

const readAndRun = (filename: string): any => {
  const content = read(filename)
  return tm(content, {})
}

readAndRun('lodash.js')
let _: any
const lodashStable = _ = (global as any)._

const deepStrictEqual = (a: any, b: any, msg?: string): void => {
  try {
    expect(a).deep.equal(b)
  } catch(e) {
    console.log('---->', a, b)
    throw msg ? new Error(msg) : e
  }
}
const assert = {
  deepStrictEqual,
  deepEqual: deepStrictEqual,
  strictEqual: (a: any, b: any, msg?: string): void => {
    try {
      expect(a).equal(b)
    } catch(e) {
      console.log('---->', a, b)
      throw msg ? new Error(msg) : e
    }
  },
}

describe('compile and running third part libraries', (): void => {

  it('moment.js', (): void => {
    readAndRun('moment.js')
  })

  it('moment.min.js', (): void => {
    readAndRun('moment.min.js')
  })

  // it('lodash.min.js', (): void => {
  //   readAndRun('lodash.min.js')
  // })

  it('lodash.js', (): void => {
    expect(_.isNumber(3)).equal(true)
    expect(_.isNumber('3')).equal(false)

    const curried = _.curry((a: any, b: any, c: any, d: any): any[] => [a, b, c, d])
    let expected = [1, 2, 3, 4]
    expect(curried(1)(2)(3)(4)).to.deep.equal(expected)
    expect(curried(1, 2)(3, 4)).to.deep.equal(expected)
    expect(curried(1, 2, 3, 4)).to.deep.equal(expected)

    let actual = _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)
    expect(actual).to.deep.equal([1.2])

    actual = _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x')
    expect(actual).to.deep.equal([{ 'x': 2 }])

    const array = [1, [2, [3, [4]], 5]]
    const values = [, null, undefined]
    expected = _.map(values, _.constant([1, 2, [3, [4]], 5]))
    actual = _.map(values, (value: any, index: any): void => {
      return index ? _.flatMapDepth(array, value) : _.flatMapDepth(array)
    })
    expect(actual).to.deep.equal(expected)

    // should treat a `depth` of < `1` as a shallow clone
    _.each([-1, 0], (depth: any): void => {
      assert.deepStrictEqual(_.flatMapDepth(array, _.identity, depth), [1, [2, [3, [4]], 5]])
    })

  })
  it('should use `_.identity` when `iteratee` is nullish', (): void => {
    const array = [6, 4, 6]
    const values = [, null, undefined]
    const expected = _.map(values, _.constant({ '4': [4], '6': [6, 6] }))
    const actual = _.map(values, (value: any, index: any): void => {
      return index ? _.groupBy(array, value) : _.groupBy(array)
    })
    assert.deepStrictEqual(actual, expected)
  })

  it('should work in a lazy sequence', (): void => {
    const LARGE_ARRAY_SIZE = 200
    const array = _.range(LARGE_ARRAY_SIZE).concat(
      _.range(Math.floor(LARGE_ARRAY_SIZE / 2), LARGE_ARRAY_SIZE),
      _.range(Math.floor(LARGE_ARRAY_SIZE / 1.5), LARGE_ARRAY_SIZE),
    )

    const iteratee = (value: any): void => {
      value.push(value[0])
      return value
    }
    const isEven = (n: any): boolean => { return n % 2 === 0 }
    const predicate = (value: any): boolean => { return isEven(value[0]) }
    const actual = _(array).groupBy().map(iteratee).filter(predicate).take().value()

    assert.deepStrictEqual(actual, _.take(_.filter(_.map(_.groupBy(array), iteratee), predicate)))
  })
})

describe('without', function() {
  it('should return the difference of values', function() {
    const actual = _.without([2, 1, 2, 3], 1, 2)
    assert.deepStrictEqual(actual, [3])
  })

  it('should use strict equality to determine the values to reject', function() {
    const object1 = { 'a': 1 },
      object2 = { 'b': 2 },
      array = [object1, object2]

    assert.deepStrictEqual(_.without(array, { 'a': 1 }), array)
    assert.deepStrictEqual(_.without(array, object1), [object2])
  })

  it('should remove all occurrences of each value from an array', function() {
    const array = [1, 2, 3, 1, 2, 3]
    assert.deepStrictEqual(_.without(array, 1, 2), [3, 3])
  })
})

describe('add', function() {
  it('should add two numbers', function() {
    assert.strictEqual(_.add(6, 4), 10)
    assert.strictEqual(_.add(-6, 4), -2)
    assert.strictEqual(_.add(-6, -4), -10)
  })

  it('should not coerce arguments to numbers', function() {
    assert.strictEqual(_.add('6', '4'), '64')
    assert.strictEqual(_.add('x', 'y'), 'xy')
  })
})

describe('after', function() {
  function testAfter(n: any, times: any) {
    let count = 0
    _.times(times, _.after(n, function() { count++ }))
    return count
  }

  it('should create a function that invokes `func` after `n` calls', function() {
    assert.strictEqual(testAfter(5, 5), 1, 'after(n) should invoke `func` after being called `n` times')
    assert.strictEqual(testAfter(5, 4), 0, 'after(n) should not invoke `func` before being called `n` times')
    assert.strictEqual(testAfter(0, 0), 0, 'after(0) should not invoke `func` immediately')
    assert.strictEqual(testAfter(0, 1), 1, 'after(0) should invoke `func` when called once')
  })

  it('should coerce `n` values of `NaN` to `0`', function() {
    assert.strictEqual(testAfter(NaN, 1), 1)
  })

  it('should use `this` binding of function', function() {
    const afterFn = _.after(1, function(this: any) { return ++this.count }),
      object = { 'after': afterFn, 'count': 0 }

    object.after()
    assert.strictEqual(object.after(), 2)
    assert.strictEqual(object.count, 2)
  })
})

describe('"Arrays" category methods', function() {
  function toArgs(array: any) {
    return (function() { return arguments }.apply(undefined, array))
  }

  let args = toArgs([1, null, [3], null, 5]),
    sortedArgs = toArgs([1, [3], 5, null, null]),
    array = [1, 2, 3, 4, 5, 6]

  it('should work with `arguments` objects', function() {
    function message(methodName: any) {
      return '`_.' + methodName + '` should work with `arguments` objects'
    }

    assert.deepStrictEqual(_.difference(args, [null]), [1, [3], 5], message('difference'))
    assert.deepStrictEqual(_.difference(array, args), [2, 3, 4, 6], '_.difference should work with `arguments` objects as secondary arguments')

    assert.deepStrictEqual(_.union(args, [null, 6]), [1, null, [3], 5, 6], message('union'))
    assert.deepStrictEqual(_.union(array, args), array.concat([null, [3]] as any[]), '_.union should work with `arguments` objects as secondary arguments')

    assert.deepStrictEqual(_.compact(args), [1, [3], 5], message('compact'))
    assert.deepStrictEqual(_.drop(args, 3), [null, 5], message('drop'))
    assert.deepStrictEqual(_.dropRight(args, 3), [1, null], message('dropRight'))
    assert.deepStrictEqual(_.dropRightWhile(args,_.identity), [1, null, [3], null], message('dropRightWhile'))
    assert.deepStrictEqual(_.dropWhile(args,_.identity), [null, [3], null, 5], message('dropWhile'))
    assert.deepStrictEqual(_.findIndex(args, _.identity), 0, message('findIndex'))
    assert.deepStrictEqual(_.findLastIndex(args, _.identity), 4, message('findLastIndex'))
    assert.deepStrictEqual(_.flatten(args), [1, null, 3, null, 5], message('flatten'))
    assert.deepStrictEqual(_.head(args), 1, message('head'))
    assert.deepStrictEqual(_.indexOf(args, 5), 4, message('indexOf'))
    assert.deepStrictEqual(_.initial(args), [1, null, [3], null], message('initial'))
    assert.deepStrictEqual(_.intersection(args, [1]), [1], message('intersection'))
    assert.deepStrictEqual(_.last(args), 5, message('last'))
    assert.deepStrictEqual(_.lastIndexOf(args, 1), 0, message('lastIndexOf'))
    assert.deepStrictEqual(_.sortedIndex(sortedArgs, 6), 3, message('sortedIndex'))
    assert.deepStrictEqual(_.sortedIndexOf(sortedArgs, 5), 2, message('sortedIndexOf'))
    assert.deepStrictEqual(_.sortedLastIndex(sortedArgs, 5), 3, message('sortedLastIndex'))
    assert.deepStrictEqual(_.sortedLastIndexOf(sortedArgs, 1), 0, message('sortedLastIndexOf'))
    assert.deepStrictEqual(_.tail(args, 4), [null, [3], null, 5], message('tail'))
    assert.deepStrictEqual(_.take(args, 2), [1, null], message('take'))
    assert.deepStrictEqual(_.takeRight(args, 1), [5], message('takeRight'))
    assert.deepStrictEqual(_.takeRightWhile(args, _.identity), [5], message('takeRightWhile'))
    assert.deepStrictEqual(_.takeWhile(args, _.identity), [1], message('takeWhile'))
    assert.deepStrictEqual(_.uniq(args), [1, null, [3], 5], message('uniq'))
    assert.deepStrictEqual(_.without(args, null), [1, [3], 5], message('without'))
    assert.deepStrictEqual(_.zip(args, args), [[1, 1], [null, null], [[3], [3]], [null, null], [5, 5]], message('zip'))
  })

  it('should accept falsey primary arguments', function() {
    function message(methodName: string) {
      return '`_.' + methodName + '` should accept falsey primary arguments'
    }

    assert.deepStrictEqual(_.difference(null, array), [], message('difference'))
    assert.deepStrictEqual(_.intersection(null, array), [], message('intersection'))
    assert.deepStrictEqual(_.union(null, array), array, message('union'))
    assert.deepStrictEqual(_.xor(null, array), array, message('xor'))
  })

  it('should accept falsey secondary arguments', function() {
    function message(methodName: string) {
      return '`_.' + methodName + '` should accept falsey secondary arguments'
    }

    assert.deepStrictEqual(_.difference(array, null), array, message('difference'))
    assert.deepStrictEqual(_.intersection(array, null), [], message('intersection'))
    assert.deepStrictEqual(_.union(array, null), array, message('union'))
  })
})

describe('ary', function() {
  function fn(a: any, b: any, c: any) {
    return slice.call(arguments)
  }

  it('should cap the number of arguments provided to `func`', function() {
    let actual = lodashStable.map(['6', '8', '10'], _.ary(parseInt, 1))
    assert.deepStrictEqual(actual, [6, 8, 10])

    let capped = _.ary(fn, 2)
    assert.deepStrictEqual(capped('a', 'b', 'c', 'd'), ['a', 'b'])
  })

  it('should use `func.length` if `n` is not given', function() {
    let capped = _.ary(fn)
    assert.deepStrictEqual(capped('a', 'b', 'c', 'd'), ['a', 'b', 'c'])
  })

  it('should treat a negative `n` as `0`', function() {
    let capped = _.ary(fn, -1)

    try {
      var actual = capped('a')
    } catch (e) {}

    assert.deepStrictEqual(actual, [])
  })

  it('should coerce `n` to an integer', function() {
    let values = ['1', 1.6, 'xyz'],
      expected = [['a'], ['a'], []]

    let actual = lodashStable.map(values, function(n: any) {
      let capped = _.ary(fn, n)
      return capped('a', 'b')
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should not force a minimum argument count', function() {
    let args = ['a', 'b', 'c'],
      capped = _.ary(fn, 3)

    let expected = lodashStable.map(args, function(arg: any, index: number | undefined) {
      return args.slice(0, index)
    })

    let actual = lodashStable.map(expected, function(array: any) {
      return capped.apply(undefined, array)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should use `this` binding of function', function() {
    let capped = _.ary(function(this: any, a: any, b: any) { return this }, 1),
      object = { 'capped': capped }

    assert.strictEqual(object.capped(), object)
  })

  it('should use the existing `ary` if smaller', function() {
    let capped = _.ary(_.ary(fn, 1), 2)
    assert.deepStrictEqual(capped('a', 'b', 'c'), ['a'])
  })

  it('should work as an iteratee for methods like `_.map`', function() {
    let funcs = lodashStable.map([fn], _.ary),
      actual = funcs[0]('a', 'b', 'c')

    assert.deepStrictEqual(actual, ['a', 'b', 'c'])
  })

  it('should work when combined with other methods that use metadata', function() {
    let array = ['a', 'b', 'c'],
      includes = _.curry(_.rearg(_.ary(_.includes, 2), 1, 0), 2)

    assert.strictEqual(includes('b')(array, 2), true)

    includes = _(_.includes).ary(2).rearg(1, 0).curry(2).value()
    assert.strictEqual(includes('b')(array, 2), true)
  })
})

describe('assign and assignIn', function() {
  lodashStable.each(['assign', 'assignIn'], function(methodName: string) {
    var func = _[methodName]

    it('`_.' + methodName + '` should assign source properties to `object`', function() {
      assert.deepStrictEqual(func({ 'a': 1 }, { 'b': 2 }), { 'a': 1, 'b': 2 })
    })

    it('`_.' + methodName + '` should accept multiple sources', function() {
      var expected = { 'a': 1, 'b': 2, 'c': 3 }
      assert.deepStrictEqual(func({ 'a': 1 }, { 'b': 2 }, { 'c': 3 }), expected)
      assert.deepStrictEqual(func({ 'a': 1 }, { 'b': 2, 'c': 2 }, { 'c': 3 }), expected)
    })

    it('`_.' + methodName + '` should overwrite destination properties', function() {
      var expected = { 'a': 3, 'b': 2, 'c': 1 }
      assert.deepStrictEqual(func({ 'a': 1, 'b': 2 }, expected), expected)
    })

    it('`_.' + methodName + '` should assign source properties with nullish values', function() {
      var expected = { 'a': null, 'b': undefined, 'c': null }
      assert.deepStrictEqual(func({ 'a': 1, 'b': 2 }, expected), expected)
    })

    it('`_.' + methodName + '` should skip assignments if values are the same', function() {
      var object = {}

      var descriptor = {
        'configurable': true,
        'enumerable': true,
        'set'() { throw new Error() },
      }

      var source = {
        'a': 1,
        'b': undefined,
        'c': NaN,
        'd': undefined,
        'constructor': Object,
        'toString': lodashStable.constant('source'),
      }

      defineProperty(object, 'a', lodashStable.assign({}, descriptor, {
        'get': stubOne,
      }))

      defineProperty(object, 'b', lodashStable.assign({}, descriptor, {
        'get': noop,
      }))

      defineProperty(object, 'c', lodashStable.assign({}, descriptor, {
        'get': stubNaN,
      }))

      defineProperty(object, 'constructor', lodashStable.assign({}, descriptor, {
        'get': lodashStable.constant(Object),
      }))

      try {
        var actual = func(object, source)
      } catch (e) {}

      assert.deepStrictEqual(actual, source)
    })

    it('`_.' + methodName + '` should treat sparse array sources as dense', function() {
      var array = [1]
      array[2] = 3

      assert.deepStrictEqual(func({}, array), { '0': 1, '1': undefined, '2': 3 })
    })

    it('`_.' + methodName + '` should assign values of prototype objects', function() {
      function Foo() {}
      Foo.prototype.a = 1

      assert.deepStrictEqual(func({}, Foo.prototype), { 'a': 1 })
    })

    it('`_.' + methodName + '` should coerce string sources to objects', function() {
      assert.deepStrictEqual(func({}, 'a'), { '0': 'a' })
    })
  })
})

describe('at', function() {
  const at = _.at
  var array = ['a', 'b', 'c'],
    object = { 'a': [{ 'b': { 'c': 3 } }, 4] }

  it('should return the elements corresponding to the specified keys', function() {
    var actual = at(array, [0, 2])
    assert.deepStrictEqual(actual, ['a', 'c'])
  })

  it('should return `undefined` for nonexistent keys', function() {
    var actual = at(array, [2, 4, 0])
    assert.deepStrictEqual(actual, ['c', undefined, 'a'])
  })

  it('should work with non-index keys on array values', function() {
    var values = lodashStable.reject(empties, function(value: number) {
      return (value === 0) || lodashStable.isArray(value)
    }).concat(-1, 1.1)

    var array = lodashStable.transform(values, function(result: { [x: string]: number }, value: string | number) {
      result[value] = 1
    }, [])

    var expected = lodashStable.map(values, stubOne),
      actual = at(array, values)

    assert.deepStrictEqual(actual, expected)
  })

  it('should return an empty array when no keys are given', function() {
    assert.deepStrictEqual(at(array), [])
    assert.deepStrictEqual(at(array, [], []), [])
  })

  it('should accept multiple key arguments', function() {
    var actual = at(['a', 'b', 'c', 'd'], 3, 0, 2)
    assert.deepStrictEqual(actual, ['d', 'a', 'c'])
  })

  it('should work with a falsey `object` when keys are given', function() {
    var expected = lodashStable.map(falsey, lodashStable.constant(Array(4).fill(undefined)))

    var actual = lodashStable.map(falsey, function(object: any) {
      try {
        return at(object, 0, 1, 'pop', 'push')
      } catch (e) {}
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should work with an `arguments` object for `object`', function() {
    var actual = at(args, [2, 0])
    assert.deepStrictEqual(actual, [3, 1])
  })

  it('should work with `arguments` object as secondary arguments', function() {
    var actual = at([1, 2, 3, 4, 5], args)
    assert.deepStrictEqual(actual, [2, 3, 4])
  })

  it('should work with an object for `object`', function() {
    var actual = at(object, ['a[0].b.c', 'a[1]'])
    assert.deepStrictEqual(actual, [3, 4])
  })

  it('should pluck inherited property values', function() {
    function Foo(this: any) {
      this.a = 1
    }
    Foo.prototype.b = 2

    // tslint:disable-next-line: new-parens
    var actual = at(new (Foo as any), 'b')
    assert.deepStrictEqual(actual, [2])
  })

  it('should work in a lazy sequence', function() {
    var largeArray = lodashStable.range(LARGE_ARRAY_SIZE),
      smallArray = array

    lodashStable.each([[2], ['2'], [2, 1]], function(paths: any) {
      lodashStable.times(2, function(index: any) {
        var array = index ? largeArray : smallArray,
          wrapped = _(array).map(identity).at(paths)

        assert.deepEqual(wrapped.value(), at(_.map(array, identity), paths))
      })
    })
  })

  it('should support shortcut fusion', function() {
    var array = lodashStable.range(LARGE_ARRAY_SIZE),
      count = 0,
      iteratee = function(value: number) { count++; return value * value },
      lastIndex = LARGE_ARRAY_SIZE - 1

    lodashStable.each([lastIndex, lastIndex + '', LARGE_ARRAY_SIZE, []], (n: any, index: number) => {
      count = 0
      var actual = _(array).map(iteratee).at(n).value()
        // expected: any = index < 2 ? 1 : 0
    })


    // lodashStable.each([lastIndex, lastIndex + '', LARGE_ARRAY_SIZE, []], function(n: any, index: number) {
    //   count = 0
    //   var actual = _(array).map(iteratee).at(n).value(),
    //     expected: any = index < 2 ? 1 : 0

    //   assert.strictEqual(count, expected)

    //   expected = index == 3 ? [] : [index == 2 ? undefined : square(lastIndex)]
    //   assert.deepEqual(actual, expected)
    // })
  })

  it('work with an object for `object` when chaining', function() {
    var paths = ['a[0].b.c', 'a[1]'],
      actual = _(object).map(identity).at(paths).value()

    assert.deepEqual(actual, at(_.map(object, identity), paths))

    var indexObject = { '0': 1 }
    actual = _(indexObject).at(0).value()
    assert.deepEqual(actual, at(indexObject, 0))
  })
})
