// tslint:disable: only-arrow-functions
// tslint:disable: typedef
// tslint:disable: one-variable-per-declaration
// tslint:disable: prefer-const
// tslint:disable: no-shadowed-variable
// tslint:disable: no-statements-same-line
// tslint:disable: no-var-keyword
// tslint:disable: new-parens
// tslint:disable: max-file-line-count
import { tm } from './utils'
import { expect } from 'chai'
const fs = require('fs')

function toArgs(array: number[]) {
  return (function() { return arguments }.apply(undefined, array as any))
}

var errors = [
  new Error,
  new EvalError,
  new RangeError,
  new ReferenceError,
  new SyntaxError,
  new TypeError,
  new URIError,
]

function CustomError(this: any, message: any) {
  this.name = 'CustomError'
  this.message = message
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

var burredLetters = [
  // Latin-1 Supplement letters.
  '\xc0', '\xc1', '\xc2', '\xc3', '\xc4', '\xc5', '\xc6', '\xc7', '\xc8', '\xc9', '\xca', '\xcb', '\xcc', '\xcd', '\xce', '\xcf',
  '\xd0', '\xd1', '\xd2', '\xd3', '\xd4', '\xd5', '\xd6',         '\xd8', '\xd9', '\xda', '\xdb', '\xdc', '\xdd', '\xde', '\xdf',
  '\xe0', '\xe1', '\xe2', '\xe3', '\xe4', '\xe5', '\xe6', '\xe7', '\xe8', '\xe9', '\xea', '\xeb', '\xec', '\xed', '\xee', '\xef',
  '\xf0', '\xf1', '\xf2', '\xf3', '\xf4', '\xf5', '\xf6',         '\xf8', '\xf9', '\xfa', '\xfb', '\xfc', '\xfd', '\xfe', '\xff',
  // Latin Extended-A letters.
  '\u0100', '\u0101', '\u0102', '\u0103', '\u0104', '\u0105', '\u0106', '\u0107', '\u0108', '\u0109', '\u010a', '\u010b', '\u010c', '\u010d', '\u010e', '\u010f',
  '\u0110', '\u0111', '\u0112', '\u0113', '\u0114', '\u0115', '\u0116', '\u0117', '\u0118', '\u0119', '\u011a', '\u011b', '\u011c', '\u011d', '\u011e', '\u011f',
  '\u0120', '\u0121', '\u0122', '\u0123', '\u0124', '\u0125', '\u0126', '\u0127', '\u0128', '\u0129', '\u012a', '\u012b', '\u012c', '\u012d', '\u012e', '\u012f',
  '\u0130', '\u0131', '\u0132', '\u0133', '\u0134', '\u0135', '\u0136', '\u0137', '\u0138', '\u0139', '\u013a', '\u013b', '\u013c', '\u013d', '\u013e', '\u013f',
  '\u0140', '\u0141', '\u0142', '\u0143', '\u0144', '\u0145', '\u0146', '\u0147', '\u0148', '\u0149', '\u014a', '\u014b', '\u014c', '\u014d', '\u014e', '\u014f',
  '\u0150', '\u0151', '\u0152', '\u0153', '\u0154', '\u0155', '\u0156', '\u0157', '\u0158', '\u0159', '\u015a', '\u015b', '\u015c', '\u015d', '\u015e', '\u015f',
  '\u0160', '\u0161', '\u0162', '\u0163', '\u0164', '\u0165', '\u0166', '\u0167', '\u0168', '\u0169', '\u016a', '\u016b', '\u016c', '\u016d', '\u016e', '\u016f',
  '\u0170', '\u0171', '\u0172', '\u0173', '\u0174', '\u0175', '\u0176', '\u0177', '\u0178', '\u0179', '\u017a', '\u017b', '\u017c', '\u017d', '\u017e', '\u017f',
]

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
  realm: any = {},
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
  ok: (v: any, msg?: string) => {
    if (!v) {
      throw new Error('should be true' + msg)
    }
  },
  strictEqual: (a: any, b: any, msg?: string): void => {
    try {
      expect(a).equal(b)
    } catch(e) {
      console.log('---->', a, b)
      throw msg ? new Error(msg) : e
    }
  },
  notStrictEqual: (a: any, b: any, msg?: string): void => {
    try {
      expect(a).not.equal(b)
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

describe('values methods', function() {
  lodashStable.each(['values', 'valuesIn'], function(methodName: string) {
    var func = _[methodName],
      isValues = methodName == 'values'

    it('`_.' + methodName + '` should get string keyed values of `object`', function() {
      var object = { 'a': 1, 'b': 2 },
        actual = func(object).sort()

      assert.deepStrictEqual(actual, [1, 2])
    })

    it('`_.' + methodName + '` should work with an object that has a `length` property', function() {
      var object = { '0': 'a', '1': 'b', 'length': 2 },
        actual = func(object).sort()

      assert.deepStrictEqual(actual, [2, 'a', 'b'])
    })

    it('`_.' + methodName + '` should ' + (isValues ? 'not ' : '') + 'include inherited string keyed property values',
    function() {
      function Foo(this: any) {
        this.a = 1
      }
      Foo.prototype.b = 2

      var expected = isValues ? [1] : [1, 2],
        actual = func(new (Foo as any)).sort()

      assert.deepStrictEqual(actual, expected)
    })

    it('`_.' + methodName + '` should work with `arguments` objects', function() {
      var values = [args, strictArgs],
        expected = lodashStable.map(values, lodashStable.constant([1, 2, 3]))

      var actual = lodashStable.map(values, function(value: any) {
        return func(value).sort()
      })

      assert.deepStrictEqual(actual, expected)
    })
  })
})

describe('without', function() {
  const without = _.without
  it('should return the difference of values', function() {
    var actual = without([2, 1, 2, 3], 1, 2)
    assert.deepStrictEqual(actual, [3])
  })

  it('should use strict equality to determine the values to reject', function() {
    var object1 = { 'a': 1 },
      object2 = { 'b': 2 },
      array = [object1, object2]

    assert.deepStrictEqual(without(array, { 'a': 1 }), array)
    assert.deepStrictEqual(without(array, object1), [object2])
  })

  it('should remove all occurrences of each value from an array', function() {
    var array = [1, 2, 3, 1, 2, 3]
    assert.deepStrictEqual(without(array, 1, 2), [3, 3])
  })
})

describe('words', function() {
  const words = _.words
  it('should match words containing Latin Unicode letters', function() {
    var expected = lodashStable.map(burredLetters, function(letter: any) {
      return [letter]
    })

    var actual = lodashStable.map(burredLetters, function(letter: any) {
      return words(letter)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should support a `pattern`', function() {
    assert.deepStrictEqual(words('abcd', /ab|cd/g), ['ab', 'cd'])
    assert.deepStrictEqual(Array.from(words('abcd', 'ab|cd')), ['ab'])
  })

  it('should work with compound words', function() {
    assert.deepStrictEqual(words('12ft'), ['12', 'ft'])
    assert.deepStrictEqual(words('aeiouAreVowels'), ['aeiou', 'Are', 'Vowels'])
    assert.deepStrictEqual(words('enable 6h format'), ['enable', '6', 'h', 'format'])
    assert.deepStrictEqual(words('enable 24H format'), ['enable', '24', 'H', 'format'])
    assert.deepStrictEqual(words('isISO8601'), ['is', 'ISO', '8601'])
    assert.deepStrictEqual(words('LETTERSAeiouAreVowels'), ['LETTERS', 'Aeiou', 'Are', 'Vowels'])
    assert.deepStrictEqual(words('tooLegit2Quit'), ['too', 'Legit', '2', 'Quit'])
    assert.deepStrictEqual(words('walk500Miles'), ['walk', '500', 'Miles'])
    assert.deepStrictEqual(words('xhr2Request'), ['xhr', '2', 'Request'])
    assert.deepStrictEqual(words('XMLHttp'), ['XML', 'Http'])
    assert.deepStrictEqual(words('XmlHTTP'), ['Xml', 'HTTP'])
    assert.deepStrictEqual(words('XmlHttp'), ['Xml', 'Http'])
  })

  it('should work with compound words containing diacritical marks', function() {
    assert.deepStrictEqual(words('LETTERSÆiouAreVowels'), ['LETTERS', 'Æiou', 'Are', 'Vowels'])
    assert.deepStrictEqual(words('æiouAreVowels'), ['æiou', 'Are', 'Vowels'])
    assert.deepStrictEqual(words('æiou2Consonants'), ['æiou', '2', 'Consonants'])
  })

  it('should not treat contractions as separate words', function() {
    var postfixes = ['d', 'll', 'm', 're', 's', 't', 've']

    lodashStable.each(["'", '\u2019'], function(apos: string) {
      lodashStable.times(2, function(index: any) {
        var actual = lodashStable.map(postfixes, function(postfix: string) {
          var string = 'a b' + apos + postfix +  ' c'
          return words(string[index ? 'toUpperCase' : 'toLowerCase']())
        })

        var expected = lodashStable.map(postfixes, function(postfix: string) {
          var words = ['a', 'b' + apos + postfix, 'c']
          return lodashStable.map(words, function(word: { [x: string]: () => any }) {
            return word[index ? 'toUpperCase' : 'toLowerCase']()
          })
        })

        assert.deepStrictEqual(actual, expected)
      })
    })
  })

  it('should not treat ordinal numbers as separate words', function() {
    var ordinals = ['1st', '2nd', '3rd', '4th']

    lodashStable.times(2, function(index: any) {
      var expected = lodashStable.map(ordinals, function(ordinal: { [x: string]: () => any }) {
        return [ordinal[index ? 'toUpperCase' : 'toLowerCase']()]
      })

      var actual = lodashStable.map(expected, function(expectedWords: any[]) {
        return words(expectedWords[0])
      })

      assert.deepStrictEqual(actual, expected)
    })
  })

  it('should not treat mathematical operators as words', function() {
    var operators = ['\xac', '\xb1', '\xd7', '\xf7'],
      expected = lodashStable.map(operators, stubArray),
      actual = lodashStable.map(operators, words)

    assert.deepStrictEqual(actual, expected)
  })

  it('should not treat punctuation as words', function() {
    var marks = [
      '\u2012', '\u2013', '\u2014', '\u2015',
      '\u2024', '\u2025', '\u2026',
      '\u205d', '\u205e',
    ]

    var expected = lodashStable.map(marks, stubArray),
      actual = lodashStable.map(marks, words)

    assert.deepStrictEqual(actual, expected)
  })

  it('should prevent ReDoS', function() {
    var largeWordLen = 50000,
      largeWord = 'A'.repeat(largeWordLen),
      maxMs = 1000,
      startTime = lodashStable.now()

    assert.deepStrictEqual(words(largeWord + 'ÆiouAreVowels'), [largeWord, 'Æiou', 'Are', 'Vowels'])

    var endTime = lodashStable.now(),
      timeSpent = endTime - startTime

    assert.ok(timeSpent < maxMs, `operation took ${timeSpent}ms`)
  })
})


describe('wrap', function() {
  const wrap = _.wrap
  it('should create a wrapped function', function() {
    var p = wrap(lodashStable.escape, function(func: (arg0: any) => string, text: any) {
      return '<p>' + func(text) + '</p>'
    })

    assert.strictEqual(p('fred, barney, & pebbles'), '<p>fred, barney, &amp; pebbles</p>')
  })

  it('should provide correct `wrapper` arguments', function() {
    var args: any

    var wrapped = wrap(noop, function() {
      args || (args = slice.call(arguments))
    })

    wrapped(1, 2, 3)
    assert.deepStrictEqual(args, [noop, 1, 2, 3])
  })

  it('should use `_.identity` when `wrapper` is nullish', function() {
    var values = [, null, undefined],
      expected = lodashStable.map(values, stubA)

    var actual = lodashStable.map(values, function(value: any, index: any) {
      var wrapped = index ? wrap('a', value) : wrap('a')
      return wrapped('b', 'c')
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should use `this` binding of function', function() {
    var p = wrap(lodashStable.escape, function(this: any, func: any) {
      console.log('this ....->', this)
      return '<p>' + func(this.text) + '</p>'
    })

    var object = { 'p': p, 'text': 'fred, barney, & pebbles' }
    assert.strictEqual(object.p(), '<p>fred, barney, &amp; pebbles</p>')
  })
})

describe('xor methods', function() {
  lodashStable.each(['xor', 'xorBy', 'xorWith'], function(methodName: string) {
    var func = _[methodName]

    it('`_.' + methodName + '` should return the symmetric difference of two arrays', function() {
      var actual = func([2, 1], [2, 3])
      assert.deepStrictEqual(actual, [1, 3])
    })

    it('`_.' + methodName + '` should return the symmetric difference of multiple arrays', function() {
      var actual = func([2, 1], [2, 3], [3, 4])
      assert.deepStrictEqual(actual, [1, 4])

      actual = func([1, 2], [2, 1], [1, 2])
      assert.deepStrictEqual(actual, [])
    })

    it('`_.' + methodName + '` should return an empty array when comparing the same array', function() {
      var array = [1],
        actual = func(array, array, array)

      assert.deepStrictEqual(actual, [])
    })

    it('`_.' + methodName + '` should return an array of unique values', function() {
      var actual = func([1, 1, 2, 5], [2, 2, 3, 5], [3, 4, 5, 5])
      assert.deepStrictEqual(actual, [1, 4])

      actual = func([1, 1])
      assert.deepStrictEqual(actual, [1])
    })

    it('`_.' + methodName + '` should return a new array when a single array is given', function() {
      var array = [1]
      assert.notStrictEqual(func(array), array)
    })

    it('`_.' + methodName + '` should ignore individual secondary arguments', function() {
      var array = [0]
      assert.deepStrictEqual(func(array, 3, null, { '0': 1 }), array)
    })

    it('`_.' + methodName + '` should ignore values that are not arrays or `arguments` objects', function() {
      var array = [1, 2]
      assert.deepStrictEqual(func(array, 3, { '0': 1 }, null), array)
      assert.deepStrictEqual(func(null, array, null, [2, 3]), [1, 3])
      assert.deepStrictEqual(func(array, null, args, null), [3])
    })

    it('`_.' + methodName + '` should return a wrapped value when chaining', function() {
      var wrapped = _([1, 2, 3])[methodName]([5, 2, 1, 4])
      assert.ok(wrapped instanceof _)
    })

    it('`_.' + methodName + '` should work when in a lazy sequence before `head` or `last`', function() {
      var array = lodashStable.range(LARGE_ARRAY_SIZE + 1),
        wrapped = _(array).slice(1)[methodName]([LARGE_ARRAY_SIZE, LARGE_ARRAY_SIZE + 1])

      var actual = lodashStable.map(['head', 'last'], function(methodName: string | number) {
        return wrapped[methodName]()
      })

      assert.deepEqual(actual, [1, LARGE_ARRAY_SIZE + 1])
    })
  })
})

describe('xorBy', function() {
  const xorBy = _.xorBy
  it('should accept an `iteratee`', function() {
    var actual = xorBy([2.1, 1.2], [2.3, 3.4], Math.floor)
    assert.deepStrictEqual(actual, [1.2, 3.4])

    actual = xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x')
    assert.deepStrictEqual(actual, [{ 'x': 2 }])
  })

  it('should provide correct `iteratee` arguments', function() {
    var args: any

    xorBy([2.1, 1.2], [2.3, 3.4], function() {
      args || (args = slice.call(arguments))
    })

    assert.deepStrictEqual(args, [2.3])
  })
})

describe('zipObject methods', function() {
  lodashStable.each(['zipObject', 'zipObjectDeep'], function(methodName: string) {
    var func = _[methodName],
      object = { 'barney': 36, 'fred': 40 },
      isDeep = methodName == 'zipObjectDeep'

    it('`_.' + methodName + '` should zip together key/value arrays into an object', function() {
      var actual = func(['barney', 'fred'], [36, 40])
      assert.deepStrictEqual(actual, object)
    })

    it('`_.' + methodName + '` should ignore extra `values`', function() {
      assert.deepStrictEqual(func(['a'], [1, 2]), { 'a': 1 })
    })

    it('`_.' + methodName + '` should assign `undefined` values for extra `keys`', function() {
      assert.deepStrictEqual(func(['a', 'b'], [1]), { 'a': 1, 'b': undefined })
    })

    it('`_.' + methodName + '` should ' + (isDeep ? '' : 'not ') + 'support deep paths', function() {
      lodashStable.each(['a.b.c', ['a', 'b', 'c']], function(path: any, index: any) {
        var expected = isDeep ? ({ 'a': { 'b': { 'c': 1 } } }) : (index ? { 'a,b,c': 1 } : { 'a.b.c': 1 })
        assert.deepStrictEqual(func([path], [1]), expected)
      })
    })

    it('`_.' + methodName + '` should work in a lazy sequence', function() {
      var values = lodashStable.range(LARGE_ARRAY_SIZE),
        props = lodashStable.map(values, function(value: string) { return 'key' + value }),
        actual = _(props)[methodName](values).map(square).filter(isEven).take().value()

      assert.deepEqual(actual, _.take(_.filter(_.map(func(props, values), square), isEven)))
    })
  })
})

describe('zipWith', function() {
  const zipWith = _.zipWith
  const zip = _.zip
  it('should zip arrays combining grouped elements with `iteratee`', function() {
    var array1 = [1, 2, 3],
      array2 = [4, 5, 6],
      array3 = [7, 8, 9]

    var actual = zipWith(array1, array2, array3, function(a: any, b: any, c: any) {
      return a + b + c
    })

    assert.deepStrictEqual(actual, [12, 15, 18])

    var actual = zipWith(array1, [], function(a: any, b: any) {
      return a + (b || 0)
    })

    assert.deepStrictEqual(actual, [1, 2, 3])
  })

  it('should provide correct `iteratee` arguments', function() {
    var args: any

    zipWith([1, 2], [3, 4], [5, 6], function() {
      args || (args = slice.call(arguments))
    })

    assert.deepStrictEqual(args, [1, 3, 5])
  })

  it('should perform a basic zip when `iteratee` is nullish', function() {
    var array1 = [1, 2],
      array2 = [3, 4],
      values = [, null, undefined],
      expected = lodashStable.map(values, lodashStable.constant(zip(array1, array2)))

    var actual = lodashStable.map(values, function(value: any, index: any) {
      return index ? zipWith(array1, array2, value) : zipWith(array1, array2)
    })

    assert.deepStrictEqual(actual, expected)
  })
})

describe('curry', function() {
  const curry = _.curry
  const bind = _.bind
  const partial = _.partial
  const partialRight = _.partialRight
  let placeholder = _.placeholder
  function fn(a: any, b: any, c: any, d: any) {
    return slice.call(arguments)
  }

  it('should curry based on the number of arguments given', function() {
    var curried = curry(fn),
      expected = [1, 2, 3, 4]

    assert.deepStrictEqual(curried(1)(2)(3)(4), expected)
    assert.deepStrictEqual(curried(1, 2)(3, 4), expected)
    assert.deepStrictEqual(curried(1, 2, 3, 4), expected)
  })

  it('should allow specifying `arity`', function() {
    var curried = curry(fn, 3),
      expected = [1, 2, 3]

    assert.deepStrictEqual(curried(1)(2, 3), expected)
    assert.deepStrictEqual(curried(1, 2)(3), expected)
    assert.deepStrictEqual(curried(1, 2, 3), expected)
  })

  it('should coerce `arity` to an integer', function() {
    var values = ['0', 0.6, 'xyz'],
      expected = lodashStable.map(values, stubArray)

    var actual = lodashStable.map(values, function(arity: any) {
      return curry(fn, arity)()
    })

    assert.deepStrictEqual(actual, expected)
    assert.deepStrictEqual(curry(fn, '2')(1)(2), [1, 2])
  })

  it('should support placeholders', function() {
    var curried = curry(fn),
      ph = curried.placeholder

    assert.deepStrictEqual(curried(1)(ph, 3)(ph, 4)(2), [1, 2, 3, 4])
    assert.deepStrictEqual(curried(ph, 2)(1)(ph, 4)(3), [1, 2, 3, 4])
    assert.deepStrictEqual(curried(ph, ph, 3)(ph, 2)(ph, 4)(1), [1, 2, 3, 4])
    assert.deepStrictEqual(curried(ph, ph, ph, 4)(ph, ph, 3)(ph, 2)(1), [1, 2, 3, 4])
  })

  it('should persist placeholders', function() {
    var curried = curry(fn),
      ph = curried.placeholder,
      actual = curried(ph, ph, ph, 'd')('a')(ph)('b')('c')

    assert.deepStrictEqual(actual, ['a', 'b', 'c', 'd'])
  })

  it('should provide additional arguments after reaching the target arity', function() {
    var curried = curry(fn, 3)
    assert.deepStrictEqual(curried(1)(2, 3, 4), [1, 2, 3, 4])
    assert.deepStrictEqual(curried(1, 2)(3, 4, 5), [1, 2, 3, 4, 5])
    assert.deepStrictEqual(curried(1, 2, 3, 4, 5, 6), [1, 2, 3, 4, 5, 6])
  })

  it('should create a function with a `length` of `0`', function() {
    lodashStable.times(2, function(index: any) {
      var curried = index ? curry(fn, 4) : curry(fn)
      assert.strictEqual(curried.length, 0)
      assert.strictEqual(curried(1).length, 0)
      assert.strictEqual(curried(1, 2).length, 0)
    })
  })

  it('should ensure `new curried` is an instance of `func`', function() {
    var object = {}
    function Foo(value: any) {
      return value && object
    }

    var curried = curry(Foo)

    assert.ok(new curried(false) instanceof Foo)
    assert.strictEqual(new curried(true), object)
  })

  it('should use `this` binding of function', function() {
    var fn = function(this: any, a: string | number, b: string | number, c: string | number) {
      var value = this || {}
      return [value[a], value[b], value[c]]
    }

    var object: any = { 'a': 1, 'b': 2, 'c': 3 },
      expected = [1, 2, 3]

    assert.deepStrictEqual(curry(bind(fn, object), 3)('a')('b')('c'), expected)
    assert.deepStrictEqual(curry(bind(fn, object), 3)('a', 'b')('c'), expected)
    assert.deepStrictEqual(curry(bind(fn, object), 3)('a', 'b', 'c'), expected)

    assert.deepStrictEqual(bind(curry(fn), object)('a')('b')('c'), Array(3))
    assert.deepStrictEqual(bind(curry(fn), object)('a', 'b')('c'), Array(3))
    assert.deepStrictEqual(bind(curry(fn), object)('a', 'b', 'c'), expected)

    object.curried = curry(fn)
    assert.deepStrictEqual(object.curried('a')('b')('c'), Array(3))
    assert.deepStrictEqual(object.curried('a', 'b')('c'), Array(3))
    assert.deepStrictEqual(object.curried('a', 'b', 'c'), expected)
  })

  it('should work with partialed methods', function() {
    var curried = curry(fn),
      expected = [1, 2, 3, 4]

    var a = partial(curried, 1),
      b = bind(a, null, 2),
      c = partialRight(b, 4),
      d = partialRight(b(3), 4)

    assert.deepStrictEqual(c(3), expected)
    assert.deepStrictEqual(d(), expected)
  })
})

describe('attempt', function() {
  const attempt = _.attempt
  it('should return the result of `func`', function() {
    assert.strictEqual(attempt(lodashStable.constant('x')), 'x')
  })

  it('should provide additional arguments to `func`', function() {
    var actual = attempt(function() { return slice.call(arguments) }, 1, 2)
    assert.deepStrictEqual(actual, [1, 2])
  })

  it('should return the caught error', function() {
    var expected = lodashStable.map(errors, stubTrue)

    var actual = lodashStable.map(errors, function(error: any) {
      return attempt(function() { throw error }) === error
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should coerce errors to error objects', function() {
    var actual = attempt(function() { throw new Error('x') })
    assert.ok(lodashStable.isEqual(actual, Error('x')))
  })

  it('should preserve custom errors', function() {
    var actual = attempt(function() { throw new (CustomError as any)('x') })
    assert.ok(actual instanceof CustomError)
  })

  it('should work with an error object from another realm', function() {
    if (realm.errors) {
      var expected = lodashStable.map(realm.errors, stubTrue)

      var actual = lodashStable.map(realm.errors, function(error: any) {
        return attempt(function() { throw error }) === error
      })

      assert.deepStrictEqual(actual, expected)
    }
  })

  it('should return an unwrapped value when implicitly chaining', function() {
    assert.strictEqual(_(lodashStable.constant('x')).attempt(), 'x')
  })

  it('should return a wrapped value when explicitly chaining', function() {
    assert.ok(_(lodashStable.constant('x')).chain().attempt() instanceof _)
  })
})

describe('before', function() {
  function before(n: number, times: number) {
    var count = 0
    lodashStable.times(times, _.before(n, function() { count++ }))
    return count
  }

  it('should create a function that invokes `func` after `n` calls', function() {
    assert.strictEqual(before(5, 4), 4, 'before(n) should invoke `func` before being called `n` times')
    assert.strictEqual(before(5, 6), 4, 'before(n) should not invoke `func` after being called `n - 1` times')
    assert.strictEqual(before(0, 0), 0, 'before(0) should not invoke `func` immediately')
    assert.strictEqual(before(0, 1), 0, 'before(0) should not invoke `func` when called')
  })

  it('should coerce `n` values of `NaN` to `0`', function() {
    assert.strictEqual(before(NaN, 1), 0)
  })

  it('should use `this` binding of function', function() {
    var before = _.before(2, function(this: any) { return ++this.count }),
      object = { 'before': before, 'count': 0 }

    object.before()
    assert.strictEqual(object.before(), 1)
    assert.strictEqual(object.count, 1)
  })
})

