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

var typedArrays = [
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
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

function setProperty(object: any, key: any, value: any) {
  try {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': value,
    })
  } catch (e) {
    object[key] = value
  }
  return object
}

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

var deburredLetters = [
  // Converted Latin-1 Supplement letters.
  'A',  'A', 'A', 'A', 'A', 'A', 'Ae', 'C',  'E', 'E', 'E', 'E', 'I', 'I', 'I',
  'I',  'D', 'N', 'O', 'O', 'O', 'O',  'O',  'O', 'U', 'U', 'U', 'U', 'Y', 'Th',
  'ss', 'a', 'a', 'a', 'a', 'a', 'a',  'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i',  'i',
  'i',  'd', 'n', 'o', 'o', 'o', 'o',  'o',  'o', 'u', 'u', 'u', 'u', 'y', 'th', 'y',
  // Converted Latin Extended-A letters.
  'A', 'a', 'A', 'a', 'A', 'a', 'C', 'c', 'C', 'c', 'C', 'c', 'C', 'c',
  'D', 'd', 'D', 'd', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e',
  'G', 'g', 'G', 'g', 'G', 'g', 'G', 'g', 'H', 'h', 'H', 'h',
  'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'IJ', 'ij', 'J', 'j',
  'K', 'k', 'k', 'L', 'l', 'L', 'l', 'L', 'l', 'L', 'l', 'L', 'l',
  'N', 'n', 'N', 'n', 'N', 'n', "'n", 'N', 'n',
  'O', 'o', 'O', 'o', 'O', 'o', 'Oe', 'oe',
  'R', 'r', 'R', 'r', 'R', 'r', 'S', 's', 'S', 's', 'S', 's', 'S', 's',
  'T', 't', 'T', 't', 'T', 't',
  'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u',
  'W', 'w', 'Y', 'y', 'Y', 'Z', 'z', 'Z', 'z', 'Z', 'z', 's',
]

var comboMarks = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030a', '\u030b', '\u030c', '\u030d', '\u030e', '\u030f',
  '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031a', '\u031b', '\u031c', '\u031d', '\u031e', '\u031f',
  '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f',
  '\u0330', '\u0331', '\u0332', '\u0333', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0339', '\u033a', '\u033b', '\u033c', '\u033d', '\u033e', '\u033f',
  '\u0340', '\u0341', '\u0342', '\u0343', '\u0344', '\u0345', '\u0346', '\u0347', '\u0348', '\u0349', '\u034a', '\u034b', '\u034c', '\u034d', '\u034e', '\u034f',
  '\u0350', '\u0351', '\u0352', '\u0353', '\u0354', '\u0355', '\u0356', '\u0357', '\u0358', '\u0359', '\u035a', '\u035b', '\u035c', '\u035d', '\u035e', '\u035f',
  '\u0360', '\u0361', '\u0362', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f',
  '\ufe20', '\ufe21', '\ufe22', '\ufe23',
]

/** Used to provide empty values to methods. */
var empties = [[], {}].concat(falsey.slice(1))
var primitives = [null, undefined, false, true, 1, NaN, 'a']

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

let arrayBuffer: any = ArrayBuffer ? new ArrayBuffer(2) : undefined,
  map = Map ? new Map : undefined,
  promise = Promise ? Promise.resolve(1) : undefined,
  set = Set ? new Set : undefined,
  symbol: any = Symbol ? Symbol('a') : undefined,
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
      throw new Error('should be true ' + v)
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

  it('should return a wrapped value when explicitly chaining', function() {
    assert.ok(_(lodashStable.constant('x')).chain().attempt() instanceof _)
  })

  it('should return an unwrapped value when implicitly chaining', function() {
    assert.strictEqual(_(lodashStable.constant('x')).attempt(), 'x')
  })

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

describe('bind', function() {
  let bind = _.bind
  function fn(this: any) {
    var result = [this]
    push.apply(result, arguments as any)
    return result
  }

  it('should bind a function to an object', function() {
    var object = {},
      bound = bind(fn, object)

    assert.deepStrictEqual(bound('a'), [object, 'a'])
  })

  it('should accept a falsey `thisArg`', function() {
    var values = lodashStable.reject(falsey.slice(1), function(value: null) { return value == null }),
      expected = lodashStable.map(values, function(value: any) { return [value] })

    var actual = lodashStable.map(values, function(value: any) {
      try {
        var bound = bind(fn, value)
        return bound()
      } catch (e) {}
    })

    assert.ok(lodashStable.every(actual, function(value: any, index: string | number) {
      return lodashStable.isEqual(value, expected[index])
    }))
  })

  it('should bind a function to nullish values', function() {
    var bound = bind(fn, null),
      actual = bound('a')

    assert.ok((actual[0] === null) || (actual[0] && actual[0].Array))
    assert.strictEqual(actual[1], 'a')

    lodashStable.times(2, function(index: any) {
      bound = index ? bind(fn, undefined) : bind(fn)
      actual = bound('b')

      assert.ok((actual[0] === undefined) || (actual[0] && actual[0].Array))
      assert.strictEqual(actual[1], 'b')
    })
  })

  it('should partially apply arguments ', function() {
    var object = {},
      bound = bind(fn, object, 'a')

    assert.deepStrictEqual(bound(), [object, 'a'])

    bound = bind(fn, object, 'a')
    assert.deepStrictEqual(bound('b'), [object, 'a', 'b'])

    bound = bind(fn, object, 'a', 'b')
    assert.deepStrictEqual(bound(), [object, 'a', 'b'])
    assert.deepStrictEqual(bound('c', 'd'), [object, 'a', 'b', 'c', 'd'])
  })

  it('should support placeholders', function() {
    var object = {},
      ph = bind.placeholder,
      bound = bind(fn, object, ph, 'b', ph)

    assert.deepStrictEqual(bound('a', 'c'), [object, 'a', 'b', 'c'])
    assert.deepStrictEqual(bound('a'), [object, 'a', 'b', undefined])
    assert.deepStrictEqual(bound('a', 'c', 'd'), [object, 'a', 'b', 'c', 'd'])
    assert.deepStrictEqual(bound(), [object, undefined, 'b', undefined])
  })

  it('should create a function with a `length` of `0`', function() {
    var fn = function(a: any, b: any, c: any) {},
      bound = bind(fn, {})

    assert.strictEqual(bound.length, 0)

    bound = bind(fn, {}, 1)
    assert.strictEqual(bound.length, 0)
  })

  it('should ignore binding when called with the `new` operator', function() {
    function Foo(this: any) {
      return this
    }

    var bound = bind(Foo, { 'a': 1 }),
      newBound = new bound

    assert.strictEqual(bound().a, 1)
    assert.strictEqual(newBound.a, undefined)
    assert.ok(newBound instanceof Foo)
  })

  it('should handle a number of arguments when called with the `new` operator', function() {
    function Foo(this: any) {
      return this
    }

    function Bar() {}

    var thisArg = { 'a': 1 },
      boundFoo = bind(Foo, thisArg),
      boundBar = bind(Bar, thisArg),
      count = 9,
      expected = lodashStable.times(count, lodashStable.constant([undefined, undefined]))

    var actual = lodashStable.times(count, function(index: any) {
      try {
        switch (index) {
        case 0: return [new boundFoo().a, new boundBar().a]
        case 1: return [new boundFoo(1).a, new boundBar(1).a]
        case 2: return [new boundFoo(1, 2).a, new boundBar(1, 2).a]
        case 3: return [new boundFoo(1, 2, 3).a, new boundBar(1, 2, 3).a]
        case 4: return [new boundFoo(1, 2, 3, 4).a, new boundBar(1, 2, 3, 4).a]
        case 5: return [new boundFoo(1, 2, 3, 4, 5).a, new boundBar(1, 2, 3, 4, 5).a]
        case 6: return [new boundFoo(1, 2, 3, 4, 5, 6).a, new boundBar(1, 2, 3, 4, 5, 6).a]
        case 7: return [new boundFoo(1, 2, 3, 4, 5, 6, 7).a, new boundBar(1, 2, 3, 4, 5, 6, 7).a]
        case 8: return [new boundFoo(1, 2, 3, 4, 5, 6, 7, 8).a, new boundBar(1, 2, 3, 4, 5, 6, 7, 8).a]
        }
      } catch (e) {}
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should ensure `new bound` is an instance of `func`', function() {
    function Foo(value: any) {
      return value && object
    }

    var bound = bind(Foo),
      object = {}

    assert.ok(new bound instanceof Foo)
    assert.strictEqual(new bound(true), object)
  })

  it('should append array arguments to partially applied arguments', function() {
    var object = {},
      bound = bind(fn, object, 'a')

    assert.deepStrictEqual(bound(['b'], 'c'), [object, 'a', ['b'], 'c'])
  })

  it('should not rebind functions', function() {
    var object1 = {},
      object2 = {},
      object3 = {}

    var bound1 = bind(fn, object1),
      bound2 = bind(bound1, object2, 'a'),
      bound3 = bind(bound1, object3, 'b')

    assert.deepStrictEqual(bound1(), [object1])
    assert.deepStrictEqual(bound2(), [object1, 'a'])
    assert.deepStrictEqual(bound3(), [object1, 'b'])
  })

  it('should not error when instantiating bound built-ins', function() {
    var Ctor = bind(Date, null),
      expected = new Date(2012, 4, 23, 0, 0, 0, 0)

    try {
      var actual = new Ctor(2012, 4, 23, 0, 0, 0, 0)
    } catch (e) {}

    assert.deepStrictEqual(actual, expected)

    Ctor = bind(Date, null, 2012, 4, 23)

    try {
      actual = new Ctor(0, 0, 0, 0)
    } catch (e) {}

    assert.deepStrictEqual(actual, expected)
  })

  it('should not error when calling bound class constructors with the `new` operator', function() {
    var createCtor = lodashStable.attempt(Function, '"use strict";return class A{}')

    if (typeof createCtor === 'function') {
      var bound = bind(createCtor()),
        count = 8,
        expected = lodashStable.times(count, stubTrue)

      var actual = lodashStable.times(count, function(index: any) {
        try {
          switch (index) {
          case 0: return !!(new bound)
          case 1: return !!(new bound(1))
          case 2: return !!(new bound(1, 2))
          case 3: return !!(new bound(1, 2, 3))
          case 4: return !!(new bound(1, 2, 3, 4))
          case 5: return !!(new bound(1, 2, 3, 4, 5))
          case 6: return !!(new bound(1, 2, 3, 4, 5, 6))
          case 7: return !!(new bound(1, 2, 3, 4, 5, 6, 7))
          }
        } catch (e) {}
      })

      assert.deepStrictEqual(actual, expected)
    }
  })

  it('should return a wrapped value when chaining', function() {
    var object = {},
      bound = _(fn).bind({}, 'a', 'b')

    assert.ok(bound instanceof _)

    var actual = bound.value()('c')
    assert.deepEqual(actual, [object, 'a', 'b', 'c'])
  })
})

describe('bindAll', function() {
  let bindAll = _.bindAll
  var args = toArgs(['a'] as any)

  var source = {
    '_n0': -2,
    '_p0': -1,
    '_a': 1,
    '_b': 2,
    '_c': 3,
    '_d': 4,
    '-0'() { return this._n0 },
    '0'() { return this._p0 },
    'a'() { return this._a },
    'b'() { return this._b },
    'c'() { return this._c },
    'd'() { return this._d },
  }

  it('should accept individual method names', function() {
    var object = lodashStable.cloneDeep(source)
    bindAll(object, 'a', 'b')

    var actual = lodashStable.map(['a', 'b', 'c'], function(key: string | number) {
      return object[key].call({})
    })

    assert.deepStrictEqual(actual, [1, 2, undefined])
  })

  it('should accept arrays of method names', function() {
    var object = lodashStable.cloneDeep(source)
    bindAll(object, ['a', 'b'], ['c'])

    var actual = lodashStable.map(['a', 'b', 'c', 'd'], function(key: string | number) {
      return object[key].call({})
    })

    assert.deepStrictEqual(actual, [1, 2, 3, undefined])
  })

  it('should preserve the sign of `0`', function() {
    var props = [-0, Object(-0), 0, Object(0)]

    var actual = lodashStable.map(props, function(key: any) {
      var object = lodashStable.cloneDeep(source)
      bindAll(object, key)
      return object[lodashStable.toString(key)].call({})
    })

    assert.deepStrictEqual(actual, [-2, -2, -1, -1])
  })

  it('should work with an array `object`', function() {
    var array = ['push', 'pop']
    bindAll(array)
    assert.strictEqual(array.pop, arrayProto.pop)
  })

  it('should work with `arguments` objects as secondary arguments', function() {
    var object = lodashStable.cloneDeep(source)
    bindAll(object, args)

    var actual = lodashStable.map(args, function(key: string | number) {
      return object[key].call({})
    })

    assert.deepStrictEqual(actual, [1])
  })
})


describe('bindKey', function() {
  let bindKey= _.bindKey
  it('should work when the target function is overwritten', function() {
    var object = {
      'user': 'fred',
      'greet'(greeting: string) {
        return this.user + ' says: ' + greeting
      },
    }

    var bound = bindKey(object, 'greet', 'hi')
    assert.strictEqual(bound(), 'fred says: hi')

    object.greet = function(greeting) {
      return this.user + ' says: ' + greeting + '!'
    }

    assert.strictEqual(bound(), 'fred says: hi!')
  })

  it('should support placeholders', function() {
    var object = {
      'fn'() {
        return slice.call(arguments)
      },
    }

    var ph = bindKey.placeholder,
      bound = bindKey(object, 'fn', ph, 'b', ph)

    assert.deepStrictEqual(bound('a', 'c'), ['a', 'b', 'c'])
    assert.deepStrictEqual(bound('a'), ['a', 'b', undefined])
    assert.deepStrictEqual(bound('a', 'c', 'd'), ['a', 'b', 'c', 'd'])
    assert.deepStrictEqual(bound(), [undefined, 'b', undefined])
  })

  it('should use `_.placeholder` when set', function() {
    var object = {
      'fn'() {
        return slice.call(arguments)
      },
    }

    var _ph = _.placeholder = {},
      ph = bindKey.placeholder,
      bound = bindKey(object, 'fn', _ph, 'b', ph)

    assert.deepEqual(bound('a', 'c'), ['a', 'b', ph, 'c'])
    delete _.placeholder
  })

  it('should ensure `new bound` is an instance of `object[key]`', function() {
    function Foo(value: any) {
      return value && object
    }

    var object = { 'Foo': Foo },
      bound = bindKey(object, 'Foo')

    assert.ok(new bound instanceof Foo)
    assert.strictEqual(new bound(true), object)
  })
})

describe('camelCase', function() {
  let camelCase = _.camelCase
  it('should work with numbers', function() {
    assert.strictEqual(camelCase('12 feet'), '12Feet')
    assert.strictEqual(camelCase('enable 6h format'), 'enable6HFormat')
    assert.strictEqual(camelCase('enable 24H format'), 'enable24HFormat')
    assert.strictEqual(camelCase('too legit 2 quit'), 'tooLegit2Quit')
    assert.strictEqual(camelCase('walk 500 miles'), 'walk500Miles')
    assert.strictEqual(camelCase('xhr2 request'), 'xhr2Request')
  })

  it('should handle acronyms', function() {
    lodashStable.each(['safe HTML', 'safeHTML'], function(string: any) {
      assert.strictEqual(camelCase(string), 'safeHtml')
    })

    lodashStable.each(['escape HTML entities', 'escapeHTMLEntities'], function(string: any) {
      assert.strictEqual(camelCase(string), 'escapeHtmlEntities')
    })

    lodashStable.each(['XMLHttpRequest', 'XmlHTTPRequest'], function(string: any) {
      assert.strictEqual(camelCase(string), 'xmlHttpRequest')
    })
  })
})

describe('capitalize', function() {
  let capitalize = _.capitalize
  it('should capitalize the first character of a string', function() {
    assert.strictEqual(capitalize('fred'), 'Fred')
    assert.strictEqual(capitalize('Fred'), 'Fred')
    assert.strictEqual(capitalize(' fred'), ' fred')
  })
})

let camelCase = _.camelCase
let kebabCase = _.kebabCase
let lowerCase = _.lowerCase
let snakeCase = _.snakeCase
let startCase = _.startCase
let upperCase = _.upperCase

const caseMethods = {
  camelCase,
  kebabCase,
  lowerCase,
  snakeCase,
  startCase,
  upperCase,
}

describe('case methods', function() {
  lodashStable.each(['camel', 'kebab', 'lower', 'snake', 'start', 'upper'], function(caseName: string) {
    var methodName = caseName + 'Case',
      func = caseMethods[methodName]

    var strings = [
      'foo bar', 'Foo bar', 'foo Bar', 'Foo Bar',
      'FOO BAR', 'fooBar', '--foo-bar--', '__foo_bar__',
    ]

    var converted = (function() {
      switch (caseName) {
      case 'camel': return 'fooBar'
      case 'kebab': return 'foo-bar'
      case 'lower': return 'foo bar'
      case 'snake': return 'foo_bar'
      case 'start': return 'Foo Bar'
      case 'upper': return 'FOO BAR'
      }
    }())

    it('`_.' + methodName + '` should convert `string` to ' + caseName + ' case', function() {
      var actual = lodashStable.map(strings, function(string: string) {
        var expected = (caseName == 'start' && string == 'FOO BAR') ? string : converted
        return func(string) === expected
      })

      assert.deepStrictEqual(actual, lodashStable.map(strings, stubTrue))
    })

    it('`_.' + methodName + '` should handle double-converting strings', function() {
      var actual = lodashStable.map(strings, function(string: string) {
        var expected = (caseName == 'start' && string == 'FOO BAR') ? string : converted
        return func(func(string)) === expected
      })

      assert.deepStrictEqual(actual, lodashStable.map(strings, stubTrue))
    })

    it('`_.' + methodName + '` should remove contraction apostrophes', function() {
      var postfixes = ['d', 'll', 'm', 're', 's', 't', 've']

      lodashStable.each(["'", '\u2019'], function(apos: string) {
        var actual = lodashStable.map(postfixes, function(postfix: string) {
          return func('a b' + apos + postfix +  ' c')
        })

        var expected = lodashStable.map(postfixes, function(postfix: string) {
          switch (caseName) {
          case 'camel': return 'aB'  + postfix + 'C'
          case 'kebab': return 'a-b' + postfix + '-c'
          case 'lower': return 'a b' + postfix + ' c'
          case 'snake': return 'a_b' + postfix + '_c'
          case 'start': return 'A B' + postfix + ' C'
          case 'upper': return 'A B' + postfix.toUpperCase() + ' C'
          }
        })

        assert.deepStrictEqual(actual, expected)
      })
    })

    it('`_.' + methodName + '` should remove Latin mathematical operators', function() {
      var actual = lodashStable.map(['\xd7', '\xf7'], func)
      assert.deepStrictEqual(actual, ['', ''])
    })

    it('`_.' + methodName + '` should coerce `string` to a string', function() {
      var string = 'foo bar'
      assert.strictEqual(func(Object(string)), converted)
      assert.strictEqual(func({ 'toString': lodashStable.constant(string) }), converted)
    })
  });

  (function() {
    it('should get the original value after cycling through all case methods', function() {
      var funcs = [camelCase, kebabCase, lowerCase, snakeCase, startCase, lowerCase, camelCase]

      var actual = lodashStable.reduce(funcs, function(result: any, func: (arg0: any) => any) {
        return func(result)
      }, 'enable 6h format')

      assert.strictEqual(actual, 'enable6HFormat')
    })
  })()
})

describe('castArray', function() {
  const castArray = _.castArray
  it('should wrap non-array items in an array', function() {
    var values = (falsey as any).concat(true, 1, 'a', { 'a': 1 }),
      expected = lodashStable.map(values, function(value: any) { return [value] }),
      actual = lodashStable.map(values, castArray)

    assert.deepStrictEqual(actual, expected)
  })

  it('should return array values by reference', function() {
    var array = [1]
    assert.strictEqual(castArray(array), array)
  })

  it('should return an empty array when no arguments are given', function() {
    assert.deepStrictEqual(castArray(), [])
  })
})


describe('chain', function() {
  const chain = _.chain
  it('should return a wrapped value', function() {
    var actual = chain({ 'a': 0 })
    assert.ok(actual instanceof _)
  })

  it('should return existing wrapped values', function() {
    var wrapped = _({ 'a': 0 })
    assert.strictEqual(chain(wrapped), wrapped)
    assert.strictEqual(wrapped.chain(), wrapped)
  })

  it('should enable chaining for methods that return unwrapped values', function() {
    var array = ['c', 'b', 'a']

    assert.ok(chain(array).head() instanceof _)
    assert.ok(_(array).chain().head() instanceof _)

    assert.ok(chain(array).isArray() instanceof _)
    assert.ok(_(array).chain().isArray() instanceof _)

    assert.ok(chain(array).sortBy().head() instanceof _)
    assert.ok(_(array).chain().sortBy().head() instanceof _)
  })

  it('should chain multiple methods', function() {
    lodashStable.times(2, function(index: any) {
      var array = ['one two three four', 'five six seven eight', 'nine ten eleven twelve'],
        expected = { ' ': 9, 'e': 14, 'f': 2, 'g': 1, 'h': 2, 'i': 4, 'l': 2, 'n': 6, 'o': 3, 'r': 2, 's': 2, 't': 5, 'u': 1, 'v': 4, 'w': 2, 'x': 1 },
        wrapped = index ? _(array).chain() : chain(array)

      var actual = wrapped
        .chain()
        .map(function(value: string) { return value.split('') })
        .flatten()
        .reduce(function(object: { [x: string]: number }, chr: string | number) {
          object[chr] || (object[chr] = 0)
          object[chr]++
          return object
        }, {})
        .value()

      assert.deepStrictEqual(actual, expected)

      array = [1, 2, 3, 4, 5, 6] as any
      wrapped = index ? _(array).chain() : chain(array)
      actual = wrapped
        .chain()
        .filter(function(n: number) { return n % 2 != 0 })
        .reject(function(n: number) { return n % 3 == 0 })
        .sortBy(function(n: number) { return -n })
        .value()

      assert.deepStrictEqual(actual, [5, 1])

      array = [3, 4] as any
      wrapped = index ? _(array).chain() : chain(array)
      actual = wrapped
        .reverse()
        .concat([2, 1])
        .unshift(5)
        .tap(function(value: void[]) { value.pop() })
        .map(square)
        .value()

      assert.deepStrictEqual(actual, [25, 16, 9, 4])
    })
  })
})

describe('chunk', function() {
  const chunk = _.chunk
  var array = [0, 1, 2, 3, 4, 5]

  it('should return chunked arrays', function() {
    var actual = chunk(array, 3)
    assert.deepStrictEqual(actual, [[0, 1, 2], [3, 4, 5]])
  })

  it('should return the last chunk as remaining elements', function() {
    var actual = chunk(array, 4)
    assert.deepStrictEqual(actual, [[0, 1, 2, 3], [4, 5]])
  })

  it('should treat falsey `size` values, except `undefined`, as `0`', function() {
    var expected = lodashStable.map(falsey, function(value: undefined) {
      return value === undefined ? [[0], [1], [2], [3], [4], [5]] : []
    })

    var actual = lodashStable.map(falsey, function(size: any, index: any) {
      return index ? chunk(array, size) : chunk(array)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should ensure the minimum `size` is `0`', function() {
    var values = lodashStable.reject(falsey, lodashStable.isUndefined).concat(-1, -Infinity),
      expected = lodashStable.map(values, stubArray)

    var actual = lodashStable.map(values, function(n: any) {
      return chunk(array, n)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should coerce `size` to an integer', function() {
    assert.deepStrictEqual(chunk(array, array.length / 4), [[0], [1], [2], [3], [4], [5]])
  })
})

describe('clamp', function() {
  const clamp = _.clamp
  it('should work with a `max`', function() {
    assert.strictEqual(clamp(5, 3), 3)
    assert.strictEqual(clamp(1, 3), 1)
  })

  it('should clamp negative numbers', function() {
    assert.strictEqual(clamp(-10, -5, 5), -5)
    assert.strictEqual(clamp(-10.2, -5.5, 5.5), -5.5)
    assert.strictEqual(clamp(-Infinity, -5, 5), -5)
  })

  it('should clamp positive numbers', function() {
    assert.strictEqual(clamp(10, -5, 5), 5)
    assert.strictEqual(clamp(10.6, -5.6, 5.4), 5.4)
    assert.strictEqual(clamp(Infinity, -5, 5), 5)
  })

  it('should not alter negative numbers in range', function() {
    assert.strictEqual(clamp(-4, -5, 5), -4)
    assert.strictEqual(clamp(-5, -5, 5), -5)
    assert.strictEqual(clamp(-5.5, -5.6, 5.6), -5.5)
  })

  it('should not alter positive numbers in range', function() {
    assert.strictEqual(clamp(4, -5, 5), 4)
    assert.strictEqual(clamp(5, -5, 5), 5)
    assert.strictEqual(clamp(4.5, -5.1, 5.2), 4.5)
  })

  it('should not alter `0` in range', function() {
    assert.strictEqual(1 / clamp(0, -5, 5), Infinity)
  })

  it('should clamp to `0`', function() {
    assert.strictEqual(1 / clamp(-10, 0, 5), Infinity)
  })

  it('should not alter `-0` in range', function() {
    assert.strictEqual(1 / clamp(-0, -5, 5), -Infinity)
  })

  it('should clamp to `-0`', function() {
    assert.strictEqual(1 / clamp(-10, -0, 5), -Infinity)
  })

  it('should return `NaN` when `number` is `NaN`', function() {
    assert.deepStrictEqual(clamp(NaN, -5, 5), NaN)
  })

  it('should coerce `min` and `max` of `NaN` to `0`', function() {
    assert.deepStrictEqual(clamp(1, -5, NaN), 0)
    assert.deepStrictEqual(clamp(-1, NaN, 5), 0)
  })
})


describe('clone methods', function() {
  const cloneDeep = _.cloneDeep
  const cloneDeepWith = _.cloneDeepWith
  const last = _.last
    /** Used to test async functions. */
  var asyncFunc = lodashStable.attempt(function() {
    return Function('return async () => {}')
  })

  function Foo(this: any) {
    this.a = 1
  }
    /** Used to test generator functions. */
  var genFunc = lodashStable.attempt(function() {
    return Function('return function*(){}')
  })

  Foo.prototype.b = 1
  Foo.c = function() {}
  var map: any
  var set: any

  if (Map) {
    map = new Map
    map.set('a', 1)
    map.set('b', 2)
  }
  if (Set) {
    set = new Set
    set.add(1)
    set.add(2)
  }
  var objects = {
    '`arguments` objects': arguments,
    'arrays': ['a', ''],
    'array-like objects': { '0': 'a', 'length': 1 },
    'booleans': false,
    'boolean objects': Object(false),
    'date objects': new Date,
    'Foo instances': new (Foo as any),
    'objects': { 'a': 0, 'b': 1, 'c': 2 },
    'objects with object values': { 'a': /a/, 'b': ['B'], 'c': { 'C': 1 } },
    'objects from another document': realm.object || {},
    'maps': map,
    'null values': null,
    'numbers': 0,
    'number objects': Object(0),
    'regexes': /a/gim,
    'sets': set,
    'strings': 'a',
    'string objects': Object('a'),
    'undefined values': undefined,
  }

  objects.arrays.length = 3

  var uncloneable = {
    'DOM elements': body,
    'functions': Foo,
    'async functions': asyncFunc,
    'generator functions': genFunc,
    'the `Proxy` constructor': Proxy,
  }

  lodashStable.each(errors, function(error: { name: string }) {
    uncloneable[error.name + 's'] = error
  })

  it('`_.clone` should perform a shallow clone', function() {
    var array = [{ 'a': 0 }, { 'b': 1 }],
      actual = _.clone(array)

    assert.deepStrictEqual(actual, array)
    assert.ok(actual !== array && actual[0] === array[0])
  })

  it('`_.cloneDeep` should deep clone objects with circular references', function() {
    var object = {
      'foo': { 'b': { 'c': { 'd': {} } } },
      'bar': {},
    }

    object.foo.b.c.d = object;
    (object.bar as any).b = object.foo.b

    var actual = cloneDeep(object)
    assert.ok(actual.bar.b === actual.foo.b && actual === actual.foo.b.c.d && actual !== object)
  })

  it('`_.cloneDeep` should deep clone objects with lots of circular references', function() {
    var cyclical = {}
    lodashStable.times(LARGE_ARRAY_SIZE + 1, function(index: any) {
      cyclical['v' + index] = [index ? cyclical['v' + (index - 1)] : cyclical]
    })

    var clone = cloneDeep(cyclical),
      actual = clone['v' + LARGE_ARRAY_SIZE][0]

    assert.strictEqual(actual, clone['v' + (LARGE_ARRAY_SIZE - 1)])
    assert.notStrictEqual(actual, cyclical['v' + (LARGE_ARRAY_SIZE - 1)])
  })


  lodashStable.each(['clone', 'cloneDeep'], function(methodName: string) {
    var func = _[methodName],
      isDeep = methodName == 'cloneDeep'

    lodashStable.forOwn(objects, function(object: any, kind: string) {
      it('`_.' + methodName + '` should clone ' + kind, function() {
        var actual = func(object)
        if (!lodashStable.isEqual(actual, object)) {
          console.log('====================================>', actual, object)
        }
        assert.ok(lodashStable.isEqual(actual, object))

        if (lodashStable.isObject(object)) {
          assert.notStrictEqual(actual, object)
        } else {
          assert.strictEqual(actual, object)
        }
      })
    })

    it('`_.' + methodName + '` should clone array buffers', function() {
      if (ArrayBuffer) {
        var actual = func(arrayBuffer)
        assert.strictEqual(actual.byteLength, arrayBuffer.byteLength)
        assert.notStrictEqual(actual, arrayBuffer)
      }
    })


    it('`_.' + methodName + '` should clone `index` and `input` array properties', function() {
      var array = /c/.exec('abcde'),
        actual = func(array)

      assert.strictEqual(actual.index, 2)
      assert.strictEqual(actual.input, 'abcde')
    })

    it('`_.' + methodName + '` should clone `lastIndex` regexp property', function() {
      var regexp = /c/g
      regexp.exec('abcde')

      assert.strictEqual(func(regexp).lastIndex, 3)
    })

    it('`_.' + methodName + '` should clone expando properties', function() {
      var values = lodashStable.map([false, true, 1, 'a'], function(value: any) {
        var object = Object(value)
        object.a = 1
        return object
      })

      var expected = lodashStable.map(values, stubTrue)

      var actual = lodashStable.map(values, function(value: any) {
        return func(value).a === 1
      })

      assert.deepStrictEqual(actual, expected)
    })

    it('`_.' + methodName + '` should clone prototype objects', function() {
      var actual = func(Foo.prototype)

      assert.ok(!(actual instanceof Foo))
      assert.deepStrictEqual(actual, { 'b': 1 })
    })

    it('`_.' + methodName + '` should set the `[[Prototype]]` of a clone', function() {
      assert.ok(func(new (Foo as any)) instanceof Foo)
    })

    it('`_.' + methodName + '` should set the `[[Prototype]]` of a clone even when the `constructor` is incorrect', function() {
      Foo.prototype.constructor = Object
      assert.ok(func(new (Foo as any)) instanceof Foo)
      Foo.prototype.constructor = Foo
    })

    it('`_.' + methodName + '` should ensure `value` constructor is a function before using its `[[Prototype]]`', function() {
      Foo.prototype.constructor = null
      assert.ok(!(func(new (Foo as any)) instanceof Foo))
      Foo.prototype.constructor = Foo
    })

    it('`_.' + methodName + '` should clone properties that shadow those on `Object.prototype`', function() {
      var object = {
        'constructor': objectProto.constructor,
        'hasOwnProperty': objectProto.hasOwnProperty,
        'isPrototypeOf': objectProto.isPrototypeOf,
        'propertyIsEnumerable': objectProto.propertyIsEnumerable,
        'toLocaleString': objectProto.toLocaleString,
        'toString': objectProto.toString,
        'valueOf': objectProto.valueOf,
      }

      var actual = func(object)

      assert.deepStrictEqual(actual, object)
      assert.notStrictEqual(actual, object)
    })

    it('`_.' + methodName + '` should clone symbol properties', function() {
      function Foo(this: any) {
        this[symbol as any] = { 'c': 1 }
      }

      if (Symbol) {
        var symbol2 = Symbol('b')
        Foo.prototype[symbol2] = 2

        var symbol3 = Symbol('c')
        defineProperty(Foo.prototype, symbol3, {
          'configurable': true,
          'enumerable': false,
          'writable': true,
          'value': 3,
        })

        var object = { 'a': { 'b': new (Foo as any) } }
        object[symbol] = { 'b': 1 }

        var actual = func(object)
        if (isDeep) {
          assert.notStrictEqual(actual[symbol], object[symbol])
          assert.notStrictEqual(actual.a, object.a)
        } else {
          assert.strictEqual(actual[symbol], object[symbol])
          assert.strictEqual(actual.a, object.a)
        }
        assert.deepStrictEqual(actual[symbol], object[symbol])
        assert.deepStrictEqual(getSymbols(actual.a.b), [symbol])
        assert.deepStrictEqual(actual.a.b[symbol], object.a.b[symbol])
        assert.deepStrictEqual(actual.a.b[symbol2], object.a.b[symbol2])
        assert.deepStrictEqual(actual.a.b[symbol3], object.a.b[symbol3])
      }
    })

    it('`_.' + methodName + '` should clone symbol objects', function() {
      assert.strictEqual(func(symbol), symbol)

      var object = Object(symbol),
        actual = func(object)

      assert.strictEqual(typeof actual, 'object')
      assert.strictEqual(typeof actual.valueOf(), 'symbol')
      assert.notStrictEqual(actual, object)
    })

    it('`_.' + methodName + '` should not clone symbol primitives', function() {
      assert.strictEqual(func(symbol), symbol)
    })

    it('`_.' + methodName + '` should create an object from the same realm as `value`', function() {
      var props: any[] = []

      var objects = lodashStable.transform(_, function(result: any[], value: any, key: any) {
        if (lodashStable.startsWith(key, '_') && lodashStable.isObject(value) &&
            !lodashStable.isArguments(value) && !lodashStable.isElement(value) &&
            !lodashStable.isFunction(value)) {
          props.push(lodashStable.capitalize(lodashStable.camelCase(key)))
          result.push(value)
        }
      }, [])

      var expected = lodashStable.map(objects, stubTrue)

      var actual = lodashStable.map(objects, function(object: { constructor: any }) {
        var Ctor = object.constructor,
          result = func(object)

        return result !== object && ((result instanceof Ctor) || !(new Ctor instanceof Ctor))
      })

      assert.deepStrictEqual(actual, expected, props.join(', '))
    })

    it('`_.' + methodName + '` should perform a ' + (isDeep ? 'deep' : 'shallow') + ' clone when used as an iteratee for methods like `_.map`', function() {
      var expected = [{ 'a': [0] }, { 'b': [1] }],
        actual = lodashStable.map(expected, func)

      assert.deepStrictEqual(actual, expected)

      if (isDeep) {
        assert.ok(actual[0] !== expected[0] && actual[0].a !== expected[0].a && actual[1].b !== expected[1].b)
      } else {
        assert.ok(actual[0] !== expected[0] && actual[0].a === expected[0].a && actual[1].b === expected[1].b)
      }
    })

    it('`_.' + methodName + '` should return a unwrapped value when chaining', function() {
      var object = objects.objects,
        actual = _(object)[methodName]()

      assert.deepEqual(actual, object)
      assert.notStrictEqual(actual, object)
    })

    var arrayViews = typedArrays.concat('DataView')
    lodashStable.each(arrayViews, function(type: string) {
      it('`_.' + methodName + '` should clone ' + type + ' values', function() {
        var Ctor = root[type]

        lodashStable.times(2, function(index: any) {
          if (Ctor) {
            var buffer = new ArrayBuffer(24),
              view = index ? new Ctor(buffer, 8, 1) : new Ctor(buffer),
              actual = func(view)

            assert.deepStrictEqual(actual, view)
            assert.notStrictEqual(actual, view)
            assert.strictEqual(actual.buffer === view.buffer, !isDeep)
            assert.strictEqual(actual.byteOffset, view.byteOffset)
            assert.strictEqual(actual.length, view.length)
          }
        })
      })
    })

    lodashStable.forOwn(uncloneable, function(value: { (): void; c(): void }, key: string) {
      it('`_.' + methodName + '` should not clone ' + key, function() {
        if (value) {
          var object = { 'a': value, 'b': { 'c': value } },
            actual = func(object),
            expected = value === Foo ? { 'c': Foo.c } : {}

          assert.deepStrictEqual(actual, object)
          assert.notStrictEqual(actual, object)
          assert.deepStrictEqual(func(value), expected)
        }
      })
    })
  })

  lodashStable.each(['cloneWith', 'cloneDeepWith'], function(methodName: string) {
    var func = _[methodName],
      isDeep = methodName == 'cloneDeepWith'

    it('`_.' + methodName + '` should provide correct `customizer` arguments', function() {
      var argsList: any[][] = [],
        object = new (Foo as any)

      func(object, function() {
        var length = arguments.length,
          args = slice.call(arguments, 0, length - (length > 1 ? 1 : 0))

        argsList.push(args)
      })

      assert.deepStrictEqual(argsList, isDeep ? [[object], [1, 'a', object]] : [[object]])
    })

    it('`_.' + methodName + '` should handle cloning when `customizer` returns `undefined`', function() {
      var actual = func({ 'a': { 'b': 'c' } }, noop)
      assert.deepStrictEqual(actual, { 'a': { 'b': 'c' } })
    })

    lodashStable.forOwn(uncloneable, function(value: any, key: string) {
      it('`_.' + methodName + '` should work with a `customizer` callback and ' + key, function() {
        var customizer = function(value: any) {
          return lodashStable.isPlainObject(value) ? undefined : value
        }

        var actual = func(value, customizer)
        assert.strictEqual(actual, value)

        var object = { 'a': value, 'b': { 'c': value } }
        actual = func(object, customizer)

        assert.deepStrictEqual(actual, object)
        assert.notStrictEqual(actual, object)
      })
    })
  })
})

describe('concat', function() {
  const concat = _.concat
  it('should shallow clone `array`', function() {
    var array = [1, 2, 3],
      actual = concat(array)

    assert.deepStrictEqual(actual, array)
    assert.notStrictEqual(actual, array)
  })

  it('should concat arrays and values', function() {
    var array = [1],
      actual = concat(array, 2, [3], [[4]])

    assert.deepStrictEqual(actual, [1, 2, 3, [4]])
    assert.deepStrictEqual(array, [1])
  })

  it('should cast non-array `array` values to arrays', function() {
    var values = [, null, undefined, false, true, 1, NaN, 'a']

    var expected = lodashStable.map(values, function(value: any, index: any) {
      return index ? [value] : []
    })

    var actual = lodashStable.map(values, function(value: any, index: any) {
      return index ? concat(value) : concat()
    })

    assert.deepStrictEqual(actual, expected)

    expected = lodashStable.map(values, function(value: any) {
      return [value, 2, [3]]
    })

    actual = lodashStable.map(values, function(value: any) {
      return concat(value, [2], [[3]])
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should treat sparse arrays as dense', function() {
    var expected = [],
      actual = concat(Array(1), Array(1))

    expected.push(undefined, undefined)

    assert.ok('0'in actual)
    assert.ok('1' in actual)
    assert.deepStrictEqual(actual, expected)
  })

  it('should return a new wrapped array', function() {
    var array = [1],
      wrapped = _(array).concat([2, 3]),
      actual = wrapped.value()

    assert.deepEqual(array, [1])
    assert.deepEqual(actual, [1, 2, 3])
  })
})

describe('cond', function() {
  it('should create a conditional function', function() {
    var cond = _.cond([
      [lodashStable.matches({ 'a': 1 }),     stubA],
      [lodashStable.matchesProperty('b', 1), stubB],
      [lodashStable.property('c'),           stubC],
    ])

    assert.strictEqual(cond({ 'a':  1, 'b': 2, 'c': 3 }), 'a')
    assert.strictEqual(cond({ 'a':  0, 'b': 1, 'c': 2 }), 'b')
    assert.strictEqual(cond({ 'a': -1, 'b': 0, 'c': 1 }), 'c')
  })

  it('should provide arguments to functions', function() {
    var args1: any,
      args2: any,
      expected = ['a', 'b', 'c']

    var cond = _.cond([[
      function() { args1 || (args1 = slice.call(arguments)); return true },
      function() { args2 || (args2 = slice.call(arguments)) },
    ]])

    cond('a', 'b', 'c')

    assert.deepStrictEqual(args1, expected)
    assert.deepStrictEqual(args2, expected)
  })

  it('should work with predicate shorthands', function() {
    var cond = _.cond([
      [{ 'a': 1 }, stubA],
      [['b', 1],   stubB],
      ['c',        stubC],
    ])

    assert.strictEqual(cond({ 'a':  1, 'b': 2, 'c': 3 }), 'a')
    assert.strictEqual(cond({ 'a':  0, 'b': 1, 'c': 2 }), 'b')
    assert.strictEqual(cond({ 'a': -1, 'b': 0, 'c': 1 }), 'c')
  })

  it('should return `undefined` when no condition is met', function() {
    var cond = _.cond([[stubFalse, stubA]])
    assert.strictEqual(cond({ 'a': 1 }), undefined)
  })


  it('should use `this` binding of function for `pairs`', function(this: any) {
    var cond = _.cond([
      [function(this: any, a: string | number) { return this[a] },
        function(this: any, a: any, b: string | number) { return this[b] }],
    ])

    var object = { 'cond': cond, 'a': 1, 'b': 2 }
    assert.strictEqual(object.cond('a', 'b'), 2)
  })
})

describe('conforms methods', function() {
  const conformsTo = _.conformsTo
  lodashStable.each(['conforms', 'conformsTo'], function(methodName: string) {
    var isConforms = methodName == 'conforms'

    function conforms(source: any) {
      return isConforms ? _.conforms(source) : function(object: any) {
        return conformsTo(object, source)
      }
    }

    it('`_.' + methodName + '` should check if `object` conforms to `source`', function() {
      var objects = [
        { 'a': 1, 'b': 8 },
        { 'a': 2, 'b': 4 },
        { 'a': 3, 'b': 16 },
      ]

      var par = conforms({
        'b'(value: number) { return value > 4 },
      })

      var actual = lodashStable.filter(objects, par)
      assert.deepStrictEqual(actual, [objects[0], objects[2]])

      par = conforms({
        'b'(value: number) { return value > 8 },
        'a'(value: number) { return value > 1 },
      })

      actual = lodashStable.filter(objects, par)
      assert.deepStrictEqual(actual, [objects[2]])
    })

    it('`_.' + methodName + '` should not match by inherited `source` properties', function() {
      function Foo(this: any) {
        this.a = function(value: number) {
          return value > 1
        }
      }
      Foo.prototype.b = function(value: number) {
        return value > 8
      }

      var objects = [
        { 'a': 1, 'b': 8 },
        { 'a': 2, 'b': 4 },
        { 'a': 3, 'b': 16 },
      ]

      var par = conforms(new (Foo as any)),
        actual = lodashStable.filter(objects, par)

      assert.deepStrictEqual(actual, [objects[1], objects[2]])
    })

    it('`_.' + methodName + '` should not invoke `source` predicates for missing `object` properties', function() {
      var count = 0

      var par = conforms({
        'a'() { count++; return true },
      } as any)

      assert.strictEqual(par({}), false)
      assert.strictEqual(count, 0)
    })

    it('`_.' + methodName + '` should work with a function for `object`', function() {
      function Foo() {}
      Foo.a = 1

      function Bar() {}
      Bar.a = 2

      var par = conforms({
        'a'(value: number) { return value > 1 },
      })

      assert.strictEqual(par(Foo), false)
      assert.strictEqual(par(Bar), true)
    })

    it('`_.' + methodName + '` should work with a function for `source`', function() {
      function Foo() {}
      Foo.a = function(value: number) { return value > 1 }

      var objects = [{ 'a': 1 }, { 'a': 2 }],
        actual = lodashStable.filter(objects, conforms(Foo))

      assert.deepStrictEqual(actual, [objects[1]])
    })

    it('`_.' + methodName + '` should work with a non-plain `object`', function() {
      function Foo(this: any) {
        this.a = 1
      }
      Foo.prototype.b = 2

      var par = conforms({
        'b'(value: number) { return value > 1 },
      })

      assert.strictEqual(par(new (Foo as any)), true)
    })

    it('`_.' + methodName + '` should return `false` when `object` is nullish', function() {
      var values = [, null, undefined],
        expected = lodashStable.map(values, stubFalse)

      var par = conforms({
        'a'(value: number) { return value > 1 },
      })

      var actual = lodashStable.map(values, function(value: any, index: any) {
        try {
          return index ? par(value) : par()
        } catch (e) {}
      })

      assert.deepStrictEqual(actual, expected)
    })

    it('`_.' + methodName + '` should return `true` when comparing an empty `source` to a nullish `object`', function() {
      var values = [, null, undefined],
        expected = lodashStable.map(values, stubTrue),
        par = conforms({})

      var actual = lodashStable.map(values, function(value: any, index: any) {
        try {
          return index ? par(value) : par()
        } catch (e) {}
      })

      assert.deepStrictEqual(actual, expected)
    })

    it('`_.' + methodName + '` should return `true` when comparing an empty `source`', function() {
      var object = { 'a': 1 },
        expected = lodashStable.map(empties, stubTrue)

      var actual = lodashStable.map(empties, function(value: any) {
        var par = conforms(value)
        return par(object)
      })

      assert.deepStrictEqual(actual, expected)
    })
  })
})

describe('constant', function() {
  it('should create a function that returns `value`', function() {
    var object = { 'a': 1 },
      values = Array(2).concat(empties, true, 1, 'a'),
      constant = _.constant(object)

    var results = lodashStable.map(values, function(value: any, index: number) {
      if (index < 2) {
        return index ? constant.call({}) : constant()
      }
      return constant(value)
    })

    assert.ok(lodashStable.every(results, function(result: { a: number }) {
      return result === object
    }))
  })

  it('should work with falsey values', function() {
    var expected = lodashStable.map(falsey, stubTrue)

    var actual = lodashStable.map(falsey, function(value: any, index: any) {
      var constant = index ? _.constant(value) : _.constant(),
        result = constant()

      return (result === value) || (result !== result && value !== value)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should return a wrapped value when chaining', function() {
    var wrapped = _(true).constant()
    assert.ok(wrapped instanceof _)
  })
})

describe('countBy', function() {
  var array = [6.1, 4.2, 6.3]
  const countBy = _.countBy

  it('should transform keys by `iteratee`', function() {
    var actual = countBy(array, Math.floor)
    assert.deepStrictEqual(actual, { '4': 1, '6': 2 })
  })

  it('should use `_.identity` when `iteratee` is nullish', function() {
    var array = [4, 6, 6],
      values = [, null, undefined],
      expected = lodashStable.map(values, lodashStable.constant({ '4': 1, '6':  2 }))

    var actual = lodashStable.map(values, function(value: any, index: any) {
      return index ? countBy(array, value) : countBy(array)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should work with `_.property` shorthands', function() {
    var actual = countBy(['one', 'two', 'three'], 'length')
    assert.deepStrictEqual(actual, { '3': 2, '5': 1 })
  })

  it('should only add values to own, not inherited, properties', function() {
    var actual = countBy(array, function(n: number) {
      return Math.floor(n) > 4 ? 'hasOwnProperty' : 'constructor'
    })

    assert.deepStrictEqual(actual.constructor, 1)
    assert.deepStrictEqual(actual.hasOwnProperty, 2)
  })

  it('should work with a number for `iteratee`', function() {
    var array = [
      [1, 'a'],
      [2, 'a'],
      [2, 'b'],
    ]

    assert.deepStrictEqual(countBy(array, 0), { '1': 1, '2': 2 })
    assert.deepStrictEqual(countBy(array, 1), { 'a': 2, 'b': 1 })
  })

  it('should work with an object for `collection`', function() {
    var actual = countBy({ 'a': 6.1, 'b': 4.2, 'c': 6.3 }, Math.floor)
    assert.deepStrictEqual(actual, { '4': 1, '6': 2 })
  })

  it('should work in a lazy sequence', function() {
    var array = lodashStable.range(LARGE_ARRAY_SIZE).concat(
      lodashStable.range(Math.floor(LARGE_ARRAY_SIZE / 2), LARGE_ARRAY_SIZE),
      lodashStable.range(Math.floor(LARGE_ARRAY_SIZE / 1.5), LARGE_ARRAY_SIZE),
    )

    var actual = _(array).countBy().map(square).filter(isEven).take().value()

    assert.deepEqual(actual, _.take(_.filter(_.map(countBy(array), square), isEven)))
  })
})

describe('create', function() {
  const keys = _.keys
  const create = _.create
  function Shape(this: any) {
    this.x = 0
    this.y = 0
  }

  function Circle(this: any) {
    Shape.call(this)
  }

  it('should create an object that inherits from the given `prototype` object', function() {
    Circle.prototype = create(Shape.prototype)
    Circle.prototype.constructor = Circle

    var actual = new (Circle as any)

    assert.ok(actual instanceof Circle)
    assert.ok(actual instanceof Shape)
    assert.notStrictEqual(Circle.prototype, Shape.prototype)
  })

  it('should assign `properties` to the created object', function() {
    var expected = { 'constructor': Circle, 'radius': 0 }
    var properties = Object.keys(expected)
    Circle.prototype = create(Shape.prototype, expected)

    var actual = new (Circle as any)

    assert.ok(actual instanceof Circle)
    assert.ok(actual instanceof Shape)
    assert.deepStrictEqual(Object.keys(Circle.prototype), properties)
    properties.forEach((property) => {
      assert.strictEqual(Circle.prototype[property], expected[property])
    })
  })

  it('should assign own properties', function() {
    function Foo(this: any) {
      this.a = 1
      this.c = 3
    }
    Foo.prototype.b = 2

    var actual = create({}, new (Foo as any))
    var expected = { 'a': 1, 'c': 3 }
    var properties = Object.keys(expected)

    assert.deepStrictEqual(Object.keys(actual), properties)
    properties.forEach((property) => {
      assert.strictEqual(actual[property], expected[property])
    })
  })

  it('should assign properties that shadow those of `prototype`', function() {
    function Foo(this: any) {
      this.a = 1
    }
    var object = create(new (Foo as any), { 'a': 1 })
    assert.deepStrictEqual(lodashStable.keys(object), ['a'])
  })

  it('should accept a falsey `prototype`', function() {
    var actual = lodashStable.map(falsey, function(prototype: object | null, index: any) {
      return index ? create(prototype) : (create as any)()
    })

    actual.forEach((value: any) => {
      assert.ok(lodashStable.isObject(value))
    })
  })

  it('should accept a primitive `prototype`', function() {
    var actual = lodashStable.map(primitives, function(value: object | null, index: any) {
      return index ? create(value) : (create as any)()
    })

    actual.forEach((value: any) => {
      assert.ok(lodashStable.isObject(value))
    })
  })

  it('should work as an iteratee for methods like `_.map`', function() {
    var array = [{ 'a': 1 }, { 'a': 1 }, { 'a': 1 }],
      expected = lodashStable.map(array, stubTrue),
      objects = lodashStable.map(array, create)

    var actual = lodashStable.map(objects, function(object: { a: number }) {
      return object.a === 1 && !keys(object).length
    })

    assert.deepStrictEqual(actual, expected)
  })
})

describe('curry methods', function() {
  const curry = _.curry
  lodashStable.each(['curry', 'curryRight'], function(methodName: string) {
    var func = _[methodName],
      fn = function(a: any, b: any) { return slice.call(arguments) },
      isCurry = methodName == 'curry'

    it('`_.' + methodName + '` should not error on functions with the same name as lodash methods', function() {
      function run(a: any, b: any) {
        return a + b
      }

      var curried = func(run)

      try {
        var actual = curried(1)(2)
      } catch (e) {}

      assert.strictEqual(actual, 3)
    })

    it('`_.' + methodName + '` should work for function names that shadow those on `Object.prototype`', function() {
      var curried = curry(function hasOwnProperty(a: any, b: any, c: any) {
        return [a, b, c]
      })

      var expected = [1, 2, 3]

      assert.deepStrictEqual(curried(1)(2)(3), expected)
    })

    it('`_.' + methodName + '` should work as an iteratee for methods like `_.map`', function() {
      var array = [fn, fn, fn],
        object = { 'a': fn, 'b': fn, 'c': fn }

      lodashStable.each([array, object], function(collection: any) {
        var curries = lodashStable.map(collection, func),
          expected = lodashStable.map(collection, lodashStable.constant(isCurry ? ['a', 'b'] : ['b', 'a']))

        var actual = lodashStable.map(curries, function(curried: (arg0: string) => { (arg0: string): any; new(): any }) {
          return curried('a')('b')
        })

        assert.deepStrictEqual(actual, expected)
      })
    })
  })
})

describe('curryRight', function() {
  const curryRight = _.curryRight
  const bind = _.bind
  const partialRight = _.partialRight
  const partial = _.partial
  function fn(a: any, b: any, c: any, d: any) {
    return slice.call(arguments)
  }

  it('should curry based on the number of arguments given', function() {
    var curried = curryRight(fn),
      expected = [1, 2, 3, 4]

    assert.deepStrictEqual(curried(4)(3)(2)(1), expected)
    assert.deepStrictEqual(curried(3, 4)(1, 2), expected)
    assert.deepStrictEqual(curried(1, 2, 3, 4), expected)
  })

  it('should allow specifying `arity`', function() {
    var curried = curryRight(fn, 3),
      expected = [1, 2, 3]

    assert.deepStrictEqual(curried(3)(1, 2), expected)
    assert.deepStrictEqual(curried(2, 3)(1), expected)
    assert.deepStrictEqual(curried(1, 2, 3), expected)
  })

  it('should coerce `arity` to an integer', function() {
    var values = ['0', 0.6, 'xyz'],
      expected = lodashStable.map(values, stubArray)

    var actual = lodashStable.map(values, function(arity: any) {
      return curryRight(fn, arity)()
    })

    assert.deepStrictEqual(actual, expected)
    assert.deepStrictEqual(curryRight(fn, '2')(1)(2), [2, 1])
  })

  it('should support placeholders', function() {
    var curried = curryRight(fn),
      expected = [1, 2, 3, 4],
      ph = curried.placeholder

    assert.deepStrictEqual(curried(4)(2, ph)(1, ph)(3), expected)
    assert.deepStrictEqual(curried(3, ph)(4)(1, ph)(2), expected)
    assert.deepStrictEqual(curried(ph, ph, 4)(ph, 3)(ph, 2)(1), expected)
    assert.deepStrictEqual(curried(ph, ph, ph, 4)(ph, ph, 3)(ph, 2)(1), expected)
  })

  it('should persist placeholders', function() {
    var curried = curryRight(fn),
      ph = curried.placeholder,
      actual = curried('a', ph, ph, ph)('b')(ph)('c')('d')

    assert.deepStrictEqual(actual, ['a', 'b', 'c', 'd'])
  })


  it('should provide additional arguments after reaching the target arity', function() {
    var curried = curryRight(fn, 3)
    assert.deepStrictEqual(curried(4)(1, 2, 3), [1, 2, 3, 4])
    assert.deepStrictEqual(curried(4, 5)(1, 2, 3), [1, 2, 3, 4, 5])
    assert.deepStrictEqual(curried(1, 2, 3, 4, 5, 6), [1, 2, 3, 4, 5, 6])
  })

  it('should create a function with a `length` of `0`', function() {
    lodashStable.times(2, function(index: any) {
      var curried = index ? curryRight(fn, 4) : curryRight(fn)
      assert.strictEqual(curried.length, 0)
      assert.strictEqual(curried(4).length, 0)
      assert.strictEqual(curried(3, 4).length, 0)
    })
  })

  it('should ensure `new curried` is an instance of `func`', function() {
    function Foo(value: any) {
      return value && object
    }

    var curried = curryRight(Foo),
      object = {}

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

    assert.deepStrictEqual(curryRight(bind(fn, object), 3)('c')('b')('a'), expected)
    assert.deepStrictEqual(curryRight(bind(fn, object), 3)('b', 'c')('a'), expected)
    assert.deepStrictEqual(curryRight(bind(fn, object), 3)('a', 'b', 'c'), expected)

    assert.deepStrictEqual(bind(curryRight(fn), object)('c')('b')('a'), Array(3))
    assert.deepStrictEqual(bind(curryRight(fn), object)('b', 'c')('a'), Array(3))
    assert.deepStrictEqual(bind(curryRight(fn), object)('a', 'b', 'c'), expected)

    object.curried = curryRight(fn)
    assert.deepStrictEqual(object.curried('c')('b')('a'), Array(3))
    assert.deepStrictEqual(object.curried('b', 'c')('a'), Array(3))
    assert.deepStrictEqual(object.curried('a', 'b', 'c'), expected)
  })

  it('should work with partialed methods', function() {
    var curried = curryRight(fn),
      expected = [1, 2, 3, 4]

    var a = partialRight(curried, 4),
      b = partialRight(a, 3),
      c = bind(b, null, 1),
      d = partial(b(2), 1)

    assert.deepStrictEqual(c(2), expected)
    assert.deepStrictEqual(d(), expected)
  })
})

describe('debounce and throttle', function() {
  lodashStable.each(['debounce', 'throttle'], function(methodName: string) {
    var func = _[methodName],
      isDebounce = methodName == 'debounce'

    it('`_.' + methodName + '` should not error for non-object `options` values', function() {
      func(noop, 32, 1)
      assert.ok(true)
    })

    it('`_.' + methodName + '` should use a default `wait` of `0`', function(done) {
      var callCount = 0,
        funced = func(function() { callCount++ })

      funced()

      setTimeout(function() {
        funced()
        assert.strictEqual(callCount, isDebounce ? 1 : 2)
        done()
      }, 32)
    })

    it('`_.' + methodName + '` should invoke `func` with the correct `this` binding', function(done) {
      var actual: any[] = [],
        object = { 'funced': func(function(this: any) { actual.push(this) }, 32) },
        expected = lodashStable.times(isDebounce ? 1 : 2, lodashStable.constant(object))

      object.funced()
      if (!isDebounce) {
        object.funced()
      }
      setTimeout(function() {
        assert.deepStrictEqual(actual, expected)
        done()
      }, 64)
    })

    it('`_.' + methodName + '` supports recursive calls', function(done) {
      var actual: any[][] = [],
        args = lodashStable.map(['a', 'b', 'c'], function(chr: any) { return [{}, chr] }),
        expected = args.slice(),
        queue = args.slice()

      var funced = func(function(this: any) {
        var current = [this]
        push.apply(current, arguments as any)
        actual.push(current)

        var next = queue.shift()
        if (next) {
          funced.call(next[0], next[1])
        }
      }, 32)

      var next = queue.shift()
      funced.call(next[0], next[1])
      assert.deepStrictEqual(actual, expected.slice(0, isDebounce ? 0 : 1))

      setTimeout(function() {
        assert.deepStrictEqual(actual, expected.slice(0, actual.length))
        done()
      }, 256)
    })

    it('`_.' + methodName + '` should support cancelling delayed calls', function(done) {
      var callCount = 0

      var funced = func(function() {
        callCount++
      }, 32, { 'leading': false })

      funced()
      funced.cancel()

      setTimeout(function() {
        assert.strictEqual(callCount, 0)
        done()
      }, 64)
    })

    it('`_.' + methodName + '` should reset `lastCalled` after cancelling', function(done) {
      var callCount = 0

      var funced = func(function() {
        return ++callCount
      }, 32, { 'leading': true })

      assert.strictEqual(funced(), 1)
      funced.cancel()

      assert.strictEqual(funced(), 2)
      funced()

      setTimeout(function() {
        assert.strictEqual(callCount, 3)
        done()
      }, 64)
    })

    it('`_.' + methodName + '` should support flushing delayed calls', function(done) {
      var callCount = 0

      var funced = func(function() {
        return ++callCount
      }, 32, { 'leading': false })

      funced()
      assert.strictEqual(funced.flush(), 1)

      setTimeout(function() {
        assert.strictEqual(callCount, 1)
        done()
      }, 64)
    })

    it('`_.' + methodName + '` should noop `cancel` and `flush` when nothing is queued', function(done) {
      var callCount = 0,
        funced = func(function() { callCount++ }, 32)

      funced.cancel()
      assert.strictEqual(funced.flush(), undefined)

      setTimeout(function() {
        assert.strictEqual(callCount, 0)
        done()
      }, 64)
    })
  })
})

describe('debounce', function() {
  const debounce = _.debounce
  it('should debounce a function', function(done) {
    var callCount = 0

    var debounced = debounce(function(value: any) {
      ++callCount
      return value
    }, 32)

    var results = [debounced('a'), debounced('b'), debounced('c')]
    assert.deepStrictEqual(results, [undefined, undefined, undefined])
    assert.strictEqual(callCount, 0)

    setTimeout(function() {
      assert.strictEqual(callCount, 1)

      var results = [debounced('d'), debounced('e'), debounced('f')]
      assert.deepStrictEqual(results, ['c', 'c', 'c'])
      assert.strictEqual(callCount, 1)
    }, 128)

    setTimeout(function() {
      assert.strictEqual(callCount, 2)
      done()
    }, 256)
  })

  it('subsequent debounced calls return the last `func` result', function(done) {
    var debounced = debounce(identity, 32)
    debounced('a')

    setTimeout(function() {
      assert.notStrictEqual(debounced('b'), 'b')
    }, 64)

    setTimeout(function() {
      assert.notStrictEqual(debounced('c'), 'c')
      done()
    }, 128)
  })

  it('should not immediately call `func` when `wait` is `0`', function(done) {
    var callCount = 0,
      debounced = debounce(function() { ++callCount }, 0)

    debounced()
    debounced()
    assert.strictEqual(callCount, 0)

    setTimeout(function() {
      assert.strictEqual(callCount, 1)
      done()
    }, 5)
  })

  it('should apply default options', function(done) {
    var callCount = 0,
      debounced = debounce(function() { callCount++ }, 32, {})

    debounced()
    assert.strictEqual(callCount, 0)

    setTimeout(function() {
      assert.strictEqual(callCount, 1)
      done()
    }, 64)
  })

  it('should support a `leading` option', function(done) {
    var callCounts = [0, 0]

    var withLeading = debounce(function() {
      callCounts[0]++
    }, 32, { 'leading': true })

    var withLeadingAndTrailing = debounce(function() {
      callCounts[1]++
    }, 32, { 'leading': true })

    withLeading()
    assert.strictEqual(callCounts[0], 1)

    withLeadingAndTrailing()
    withLeadingAndTrailing()
    assert.strictEqual(callCounts[1], 1)

    setTimeout(function() {
      assert.deepStrictEqual(callCounts, [1, 2])

      withLeading()
      assert.strictEqual(callCounts[0], 2)

      done()
    }, 64)
  })

  it('subsequent leading debounced calls return the last `func` result', function(done) {
    var debounced = debounce(identity, 32, { 'leading': true, 'trailing': false }),
      results = [debounced('a'), debounced('b')]

    assert.deepStrictEqual(results, ['a', 'a'])

    setTimeout(function() {
      var results = [debounced('c'), debounced('d')]
      assert.deepStrictEqual(results, ['c', 'c'])
      done()
    }, 64)
  })

  it('should support a `trailing` option', function(done) {
    var withCount = 0,
      withoutCount = 0

    var withTrailing = debounce(function() {
      withCount++
    }, 32, { 'trailing': true })

    var withoutTrailing = debounce(function() {
      withoutCount++
    }, 32, { 'trailing': false })

    withTrailing()
    assert.strictEqual(withCount, 0)

    withoutTrailing()
    assert.strictEqual(withoutCount, 0)

    setTimeout(function() {
      assert.strictEqual(withCount, 1)
      assert.strictEqual(withoutCount, 0)
      done()
    }, 64)
  })

  it('should support a `maxWait` option', function(done) {
    var callCount = 0

    var debounced = debounce(function(value: any) {
      ++callCount
      return value
    }, 32, { 'maxWait': 64 })

    debounced()
    debounced()
    assert.strictEqual(callCount, 0)

    setTimeout(function() {
      assert.strictEqual(callCount, 1)
      debounced()
      debounced()
      assert.strictEqual(callCount, 1)
    }, 128)

    setTimeout(function() {
      assert.strictEqual(callCount, 2)
      done()
    }, 256)
  })

  it('should support `maxWait` in a tight loop', function(done) {
    var limit = 1000,
      withCount = 0,
      withoutCount = 0

    var withMaxWait = debounce(function() {
      withCount++
    }, 64, { 'maxWait': 128 })

    var withoutMaxWait = debounce(function() {
      withoutCount++
    }, 96)

    var start = +new Date
    while ((new (Date as any) - start) < limit) {
      withMaxWait()
      withoutMaxWait()
    }
    var actual = [Boolean(withoutCount), Boolean(withCount)]
    setTimeout(function() {
      assert.deepStrictEqual(actual, [false, true])
      done()
    }, 1)
  })

  it('should queue a trailing call for subsequent debounced calls after `maxWait`', function(done) {
    var callCount = 0

    var debounced = debounce(function() {
      ++callCount
    }, 200, { 'maxWait': 200 })

    debounced()

    setTimeout(debounced, 190)
    setTimeout(debounced, 200)
    setTimeout(debounced, 210)

    setTimeout(function() {
      assert.strictEqual(callCount, 2)
      done()
    }, 500)
  })

  it('should cancel `maxDelayed` when `delayed` is invoked', function(done) {
    var callCount = 0

    var debounced = debounce(function() {
      callCount++
    }, 32, { 'maxWait': 64 })

    debounced()

    setTimeout(function() {
      debounced()
      assert.strictEqual(callCount, 1)
    }, 128)

    setTimeout(function() {
      assert.strictEqual(callCount, 2)
      done()
    }, 192)
  })

  it('should invoke the trailing call with the correct arguments and `this` binding', function(done) {
    var actual: any[],
      callCount = 0,
      object = {}

    var debounced = debounce(function(this: any, value: any) {
      actual = [this]
      push.apply(actual, arguments as any)
      return ++callCount != 2
    }, 32, { 'leading': true, 'maxWait': 64 })

    while (true) {
      if (!debounced.call(object, 'a')) {
        break
      }
    }
    setTimeout(function() {
      assert.strictEqual(callCount, 2)
      assert.deepStrictEqual(actual, [object, 'a'])
      done()
    }, 64)
  })
})


describe('deburr', function() {
  const deburr = _.deburr
  it('should convert Latin Unicode letters to basic Latin', function() {
    var actual = lodashStable.map(burredLetters, deburr)
    assert.deepStrictEqual(actual, deburredLetters)
  })

  it('should not deburr Latin mathematical operators', function() {
    var operators = ['\xd7', '\xf7'],
      actual = lodashStable.map(operators, deburr)

    assert.deepStrictEqual(actual, operators)
  })

  it('should deburr combining diacritical marks', function() {
    var expected = lodashStable.map(comboMarks, lodashStable.constant('ei'))

    var actual = lodashStable.map(comboMarks, function(chr: string) {
      return deburr('e' + chr + 'i')
    })

    assert.deepStrictEqual(actual, expected)
  })
})

describe('defaults', function() {
  const defaults = _.defaults
  it('should assign source properties if missing on `object`', function() {
    var actual = defaults({ 'a': 1 }, { 'a': 2, 'b': 2 })
    assert.deepStrictEqual(actual, { 'a': 1, 'b': 2 })
  })

  it('should accept multiple sources', function() {
    var expected = { 'a': 1, 'b': 2, 'c': 3 },
      actual = defaults({ 'a': 1, 'b': 2 }, { 'b': 3 }, { 'c': 3 })

    assert.deepStrictEqual(actual, expected)

    actual = defaults({ 'a': 1, 'b': 2 }, { 'b': 3, 'c': 3 }, { 'c': 2 })
    assert.deepStrictEqual(actual, expected)
  })

  it('should not overwrite `null` values', function() {
    var actual = defaults({ 'a': null }, { 'a': 1 })
    assert.strictEqual(actual.a, null)
  })

  it('should overwrite `undefined` values', function() {
    var actual = defaults({ 'a': undefined }, { 'a': 1 })
    assert.strictEqual(actual.a, 1)
  })

  it('should assign `undefined` values', function() {
    var source = { 'a': undefined, 'b': 1 },
      actual = defaults({}, source)

    assert.deepStrictEqual(actual, { 'a': undefined, 'b': 1 })
  })

  it('should assign properties that shadow those on `Object.prototype`', function() {
    var object = {
      'constructor': objectProto.constructor,
      'hasOwnProperty': objectProto.hasOwnProperty,
      'isPrototypeOf': objectProto.isPrototypeOf,
      'propertyIsEnumerable': objectProto.propertyIsEnumerable,
      'toLocaleString': objectProto.toLocaleString,
      'toString': objectProto.toString,
      'valueOf': objectProto.valueOf,
    }

    var source = {
      'constructor': 1,
      'hasOwnProperty': 2,
      'isPrototypeOf': 3,
      'propertyIsEnumerable': 4,
      'toLocaleString': 5,
      'toString': 6,
      'valueOf': 7,
    }

    var expected = lodashStable.clone(source)
    assert.deepStrictEqual(defaults({}, source), expected)

    expected = lodashStable.clone(object)
    assert.deepStrictEqual(defaults({}, object, source), expected)
  })
})


describe('defaultsDeep', function() {
  const defaultsDeep = _.defaultsDeep
  it('should deep assign source properties if missing on `object`', function() {
    var object = { 'a': { 'b': 2 }, 'd': 4 },
      source = { 'a': { 'b': 3, 'c': 3 }, 'e': 5 },
      expected = { 'a': { 'b': 2, 'c': 3 }, 'd': 4, 'e': 5 }

    assert.deepStrictEqual(defaultsDeep(object, source), expected)
  })

  it('should accept multiple sources', function() {
    var source1 = { 'a': { 'b': 3 } },
      source2 = { 'a': { 'c': 3 } },
      source3 = { 'a': { 'b': 3, 'c': 3 } },
      source4 = { 'a': { 'c': 4 } },
      expected = { 'a': { 'b': 2, 'c': 3 } }

    assert.deepStrictEqual(defaultsDeep({ 'a': { 'b': 2 } }, source1, source2), expected)
    assert.deepStrictEqual(defaultsDeep({ 'a': { 'b': 2 } }, source3, source4), expected)
  })

  it('should not overwrite `null` values', function() {
    var object = { 'a': { 'b': null } },
      source = { 'a': { 'b': 2 } },
      actual = defaultsDeep(object, source)

    assert.strictEqual(actual.a.b, null)
  })

  it('should not overwrite regexp values', function() {
    var object = { 'a': { 'b': /x/ } },
      source = { 'a': { 'b': /y/ } },
      actual = defaultsDeep(object, source)

    assert.deepStrictEqual(actual.a.b, /x/)
  })

  it('should not convert function properties to objects', function() {
    var actual = defaultsDeep({}, { 'a': noop })
    assert.strictEqual(actual.a, noop)

    actual = defaultsDeep({}, { 'a': { 'b': noop } })
    assert.strictEqual(actual.a.b, noop)
  })

  it('should overwrite `undefined` values', function() {
    var object = { 'a': { 'b': undefined } },
      source = { 'a': { 'b': 2 } },
      actual = defaultsDeep(object, source)

    assert.strictEqual(actual.a.b, 2)
  })

  it('should assign `undefined` values', function() {
    var source = { 'a': undefined, 'b': { 'c': undefined, 'd': 1 } },
      expected = lodashStable.cloneDeep(source),
      actual = defaultsDeep({}, source)

    assert.deepStrictEqual(actual, expected)
  })

  it('should merge sources containing circular references', function() {
    var object = {
      'foo': { 'b': { 'c': { 'd': {} } } },
      'bar': { 'a': 2 },
    }

    var source: any  = {
      'foo': { 'b': { 'c': { 'd': {} } } },
      'bar': {},
    }

    object.foo.b.c.d = object
    source.foo.b.c.d = source
    source.bar.b = source.foo.b

    var actual = defaultsDeep(object, source)

    assert.strictEqual(actual.bar.b, actual.foo.b)
    assert.strictEqual(actual.foo.b.c.d, actual.foo.b.c.d.foo.b.c.d)
  })

  it('should not modify sources', function() {
    var source1 = { 'a': 1, 'b': { 'c': 2 } },
      source2 = { 'b': { 'c': 3, 'd': 3 } },
      actual = defaultsDeep({}, source1, source2)

    assert.deepStrictEqual(actual, { 'a': 1, 'b': { 'c': 2, 'd': 3 } })
    assert.deepStrictEqual(source1, { 'a': 1, 'b': { 'c': 2 } })
    assert.deepStrictEqual(source2, { 'b': { 'c': 3, 'd': 3 } })
  })

  it('should not attempt a merge of a string into an array', function() {
    var actual = defaultsDeep({ 'a': ['abc'] }, { 'a': 'abc' })
    assert.deepStrictEqual(actual.a, ['abc'])
  })
})

describe('defaultTo', function() {
  const defaultTo = _.defaultTo
  it('should return a default value if `value` is `NaN` or nullish', function() {
    var expected = lodashStable.map(falsey, function(value: null) {
      return (value == null || value !== value) ? 1 : value
    })

    var actual = lodashStable.map(falsey, function(value: any) {
      return defaultTo(value, 1)
    })

    assert.deepStrictEqual(actual, expected)
  })
})


describe('defer', function() {
  const defer = _.defer
  it('should defer `func` execution', function(done) {
    var pass = false
    defer(function() { pass = true })

    setTimeout(function() {
      assert.ok(pass)
      done()
    }, 32)
  })

  it('should provide additional arguments to `func`', function(done) {
    var args: any

    defer(function() {
      args = slice.call(arguments)
    }, 1, 2)

    setTimeout(function() {
      assert.deepStrictEqual(args, [1, 2])
      done()
    }, 32)
  })

  it('should be cancelable', function(done) {
    var pass = true,
      timerId = defer(function() { pass = false })

    clearTimeout(timerId)

    setTimeout(function() {
      assert.ok(pass)
      done()
    }, 32)
  })
})

describe('delay', function() {
  const delay = _.delay
  it('should delay `func` execution', function(done) {
    var pass = false
    delay(function() { pass = true }, 32)

    setTimeout(function() {
      assert.ok(!pass)
    }, 1)

    setTimeout(function() {
      assert.ok(pass)
      done()
    }, 64)
  })

  it('should provide additional arguments to `func`', function(done) {
    var args: any

    delay(function() {
      args = slice.call(arguments)
    }, 32, 1, 2)

    setTimeout(function() {
      assert.deepStrictEqual(args, [1, 2])
      done()
    }, 64)
  })

  it('should use a default `wait` of `0`', function(done) {
    var pass = false
    delay(function() { pass = true })

    assert.ok(!pass)

    setTimeout(function() {
      assert.ok(pass)
      done()
    }, 0)
  })

  it('should be cancelable', function(done) {
    var pass = true,
      timerId = delay(function() { pass = false }, 32)

    clearTimeout(timerId)

    setTimeout(function() {
      assert.ok(pass)
      done()
    }, 64)
  })

  it('should work with mocked `setTimeout`', function() {
    var pass = false,
      setTimeout = root.setTimeout

    setProperty(root, 'setTimeout', function(func: any) { func() })
    delay(function() { pass = true }, 32)
    setProperty(root, 'setTimeout', setTimeout)

    assert.ok(pass)
  })
})

describe('difference methods', function() {
  lodashStable.each(['difference', 'differenceBy', 'differenceWith'], function(methodName: string) {
    var func = _[methodName]

    it('`_.' + methodName + '` should return the difference of two arrays', function() {
      var actual = func([2, 1], [2, 3])
      assert.deepStrictEqual(actual, [1])
    })

    it('`_.' + methodName + '` should return the difference of multiple arrays', function() {
      var actual = func([2, 1, 2, 3], [3, 4], [3, 2])
      assert.deepStrictEqual(actual, [1])
    })

    it('`_.' + methodName + '` should treat `-0` as `0`', function() {
      var array = [-0, 0]

      var actual = lodashStable.map(array, function(value: any) {
        return func(array, [value])
      })

      assert.deepStrictEqual(actual, [[], []])

      actual = lodashStable.map(func([-0, 1], [1]), lodashStable.toString)
      assert.deepStrictEqual(actual, ['0'])
    })

    it('`_.' + methodName + '` should match `NaN`', function() {
      assert.deepStrictEqual(func([1, NaN, 3], [NaN, 5, NaN]), [1, 3])
    })

    it('`_.' + methodName + '` should work with large arrays', function() {
      var array1 = lodashStable.range(LARGE_ARRAY_SIZE + 1),
        array2 = lodashStable.range(LARGE_ARRAY_SIZE),
        a = {},
        b = {},
        c = {}

      array1.push(a, b, c)
      array2.push(b, c, a)

      assert.deepStrictEqual(func(array1, array2), [LARGE_ARRAY_SIZE])
    })

    it('`_.' + methodName + '` should work with large arrays of `-0` as `0`', function() {
      var array = [-0, 0]

      var actual = lodashStable.map(array, function(value: any) {
        var largeArray = lodashStable.times(LARGE_ARRAY_SIZE, lodashStable.constant(value))
        return func(array, largeArray)
      })

      assert.deepStrictEqual(actual, [[], []])

      var largeArray = lodashStable.times(LARGE_ARRAY_SIZE, stubOne)
      actual = lodashStable.map(func([-0, 1], largeArray), lodashStable.toString)
      assert.deepStrictEqual(actual, ['0'])
    })

    it('`_.' + methodName + '` should work with large arrays of `NaN`', function() {
      var largeArray = lodashStable.times(LARGE_ARRAY_SIZE, stubNaN)
      assert.deepStrictEqual(func([1, NaN, 3], largeArray), [1, 3])
    })

    it('`_.' + methodName + '` should work with large arrays of objects', function() {
      var object1 = {},
        object2 = {},
        largeArray = lodashStable.times(LARGE_ARRAY_SIZE, lodashStable.constant(object1))

      assert.deepStrictEqual(func([object1, object2], largeArray), [object2])
    })

    it('`_.' + methodName + '` should ignore values that are not array-like', function() {
      var array = [1, null, 3]

      assert.deepStrictEqual(func(args, 3, { '0': 1 }), [1, 2, 3])
      assert.deepStrictEqual(func(null, array, 1), [])
      assert.deepStrictEqual(func(array, args, null), [null])
    })
  })
})

describe('differenceBy', function() {
  const differenceBy = _.differenceBy
  it('should accept an `iteratee`', function() {
    var actual = differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)
    assert.deepStrictEqual(actual, [1.2])

    actual = differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x')
    assert.deepStrictEqual(actual, [{ 'x': 2 }])
  })

  it('should provide correct `iteratee` arguments', function() {
    var args: any

    differenceBy([2.1, 1.2], [2.3, 3.4], function() {
      args || (args = slice.call(arguments))
    })

    assert.deepStrictEqual(args, [2.3])
  })
})

describe('differenceWith', function() {
  const differenceWith = _.differenceWith
  it('should work with a `comparator`', function() {
    var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }],
      actual = differenceWith(objects, [{ 'x': 1, 'y': 2 }], lodashStable.isEqual)

    assert.deepStrictEqual(actual, [objects[1]])
  })

  it('should preserve the sign of `0`', function() {
    var array = [-0, 1],
      largeArray = lodashStable.times(LARGE_ARRAY_SIZE, stubOne),
      others = [[1], largeArray],
      expected = lodashStable.map(others, lodashStable.constant(['-0']))

    var actual = lodashStable.map(others, function(other: any) {
      return lodashStable.map(differenceWith(array, other, lodashStable.eq), lodashStable.toString)
    })

    assert.deepStrictEqual(actual, expected)
  })
})

describe('divide', function() {
  const divide = _.divide
  it('should divide two numbers', function() {
    assert.strictEqual(divide(6, 4), 1.5)
    assert.strictEqual(divide(-6, 4), -1.5)
    assert.strictEqual(divide(-6, -4), 1.5)
  })

  it('should coerce arguments to numbers', function() {
    assert.strictEqual(divide('6', '4'), 1.5)
    assert.deepStrictEqual(divide('x', 'y'), NaN)
  })
})

describe('drop', function() {
  const drop = _.drop
  var array = [1, 2, 3]

  it('should drop the first two elements', function() {
    assert.deepStrictEqual(drop(array, 2), [3])
  })

  it('should treat falsey `n` values, except `undefined`, as `0`', function() {
    var expected = lodashStable.map(falsey, function(value: undefined) {
      return value === undefined ? [2, 3] : array
    })

    var actual = lodashStable.map(falsey, function(n: any) {
      return drop(array, n)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should return all elements when `n` < `1`', function() {
    lodashStable.each([0, -1, -Infinity], function(n: any) {
      assert.deepStrictEqual(drop(array, n), array)
    })
  })

  it('should return an empty array when `n` >= `length`', function() {
    lodashStable.each([3, 4, Math.pow(2, 32), Infinity], function(n: any) {
      assert.deepStrictEqual(drop(array, n), [])
    })
  })

  it('should coerce `n` to an integer', function() {
    assert.deepStrictEqual(drop(array, 1.6), [2, 3])
  })

  it('should work in a lazy sequence', function() {
    var array = lodashStable.range(1, LARGE_ARRAY_SIZE + 1),
      predicate = function(value: number) { values.push(value); return isEven(value) },
      values: any[] = [],
      actual = _(array).drop(2).drop().value()

    assert.deepEqual(actual, array.slice(3))

    actual = _(array).filter(predicate).drop(2).drop().value()
    assert.deepEqual(values, array)
    assert.deepEqual(actual, drop(drop(_.filter(array, predicate), 2)))

    actual = _(array).drop(2).dropRight().drop().dropRight(2).value()
    assert.deepEqual(actual, _.dropRight(drop(_.dropRight(drop(array, 2))), 2))

    values = []

    actual = _(array).drop().filter(predicate).drop(2).dropRight().drop().dropRight(2).value()
    assert.deepEqual(values, array.slice(1))
    assert.deepEqual(actual, _.dropRight(drop(_.dropRight(drop(_.filter(drop(array), predicate), 2))), 2))
  })
})

describe('dropRight', function() {
  const dropRight = _.dropRight
  var array = [1, 2, 3]

  it('should drop the last two elements', function() {
    assert.deepStrictEqual(dropRight(array, 2), [1])
  })

  it('should treat falsey `n` values, except `undefined`, as `0`', function() {
    var expected = lodashStable.map(falsey, function(value: undefined) {
      return value === undefined ? [1, 2] : array
    })

    var actual = lodashStable.map(falsey, function(n: any) {
      return dropRight(array, n)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should return all elements when `n` < `1`', function() {
    lodashStable.each([0, -1, -Infinity], function(n: any) {
      assert.deepStrictEqual(dropRight(array, n), array)
    })
  })

  it('should return an empty array when `n` >= `length`', function() {
    lodashStable.each([3, 4, Math.pow(2, 32), Infinity], function(n: any) {
      assert.deepStrictEqual(dropRight(array, n), [])
    })
  })

  it('should coerce `n` to an integer', function() {
    assert.deepStrictEqual(dropRight(array, 1.6), [1, 2])
  })

  it('should work in a lazy sequence', function() {
    var array = lodashStable.range(1, LARGE_ARRAY_SIZE + 1),
      predicate = function(value: number) { values.push(value); return isEven(value) },
      values: any[] = [],
      actual = _(array).dropRight(2).dropRight().value()

    assert.deepEqual(actual, array.slice(0, -3))

    actual = _(array).filter(predicate).dropRight(2).dropRight().value()
    assert.deepEqual(values, array)
    assert.deepEqual(actual, dropRight(dropRight(_.filter(array, predicate), 2)))

    actual = _(array).dropRight(2).drop().dropRight().drop(2).value()
    assert.deepEqual(actual, _.drop(dropRight(_.drop(dropRight(array, 2))), 2))

    values = []

    actual = _(array).dropRight().filter(predicate).dropRight(2).drop().dropRight().drop(2).value()
    assert.deepEqual(values, array.slice(0, -1))
    assert.deepEqual(actual, _.drop(dropRight(_.drop(dropRight(_.filter(dropRight(array), predicate), 2))), 2))
  })
})

describe('dropRightWhile', function() {
  const dropRightWhile = _.dropRightWhile
  var array = [1, 2, 3, 4]

  var objects = [
    { 'a': 0, 'b': 0 },
    { 'a': 1, 'b': 1 },
    { 'a': 2, 'b': 2 },
  ]

  it('should drop elements while `predicate` returns truthy', function() {
    var actual = dropRightWhile(array, function(n: number) {
      return n > 2
    })

    assert.deepStrictEqual(actual, [1, 2])
  })

  it('should provide correct `predicate` arguments', function() {
    var args

    dropRightWhile(array, function() {
      args = slice.call(arguments)
    })

    assert.deepStrictEqual(args, [4, 3, array])
  })

  it('should work with `_.matches` shorthands', function() {
    assert.deepStrictEqual(dropRightWhile(objects, { 'b': 2 }), objects.slice(0, 2))
  })

  it('should work with `_.matchesProperty` shorthands', function() {
    assert.deepStrictEqual(dropRightWhile(objects, ['b', 2]), objects.slice(0, 2))
  })

  it('should work with `_.property` shorthands', function() {
    assert.deepStrictEqual(dropRightWhile(objects, 'b'), objects.slice(0, 1))
  })

  it('should return a wrapped value when chaining', function() {
    var wrapped = _(array).dropRightWhile(function(n: number) {
      return n > 2
    })

    assert.ok(wrapped instanceof _)
    assert.deepEqual(wrapped.value(), [1, 2])
  })
})

describe('endsWith', function() {
  const endsWith = _.endsWith
  var string = 'abc'

  it('should return `true` if a string ends with `target`', function() {
    assert.strictEqual(endsWith(string, 'c'), true)
  })

  it('should return `false` if a string does not end with `target`', function() {
    assert.strictEqual(endsWith(string, 'b'), false)
  })

  it('should work with a `position`', function() {
    assert.strictEqual(endsWith(string, 'b', 2), true)
  })

  it('should work with `position` >= `length`', function() {
    lodashStable.each([3, 5, MAX_SAFE_INTEGER, Infinity], function(position: any) {
      assert.strictEqual(endsWith(string, 'c', position), true)
    })
  })

  it('should treat falsey `position` values, except `undefined`, as `0`', function() {
    var expected = lodashStable.map(falsey, stubTrue)

    var actual = lodashStable.map(falsey, function(position: undefined) {
      return endsWith(string, position === undefined ? 'c' : '', position)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should treat a negative `position` as `0`', function() {
    lodashStable.each([-1, -3, -Infinity], function(position: any) {
      assert.ok(lodashStable.every(string, function(chr: any) {
        return !endsWith(string, chr, position)
      }))
      assert.strictEqual(endsWith(string, '', position), true)
    })
  })

  it('should coerce `position` to an integer', function() {
    assert.strictEqual(endsWith(string, 'ab', 2.2), true)
  })
})

describe('eq', function() {
  const eq = _.eq
  it('should perform a `SameValueZero` comparison of two values', function() {
    assert.strictEqual(eq(), true)
    assert.strictEqual(eq(undefined), true)
    assert.strictEqual(eq(0, -0), true)
    assert.strictEqual(eq(NaN, NaN), true)
    assert.strictEqual(eq(1, 1), true)

    assert.strictEqual(eq(null, undefined), false)
    assert.strictEqual(eq(1, Object(1)), false)
    assert.strictEqual(eq(1, '1'), false)
    assert.strictEqual(eq(1, '1'), false)

    var object = { 'a': 1 }
    assert.strictEqual(eq(object, object), true)
    assert.strictEqual(eq(object, { 'a': 1 }), false)
  })
})

describe('escape', function() {
  const escape = _.escape
  const unescape = _.unescape

  var escaped = '&amp;&lt;&gt;&quot;&#39;/',
    unescaped = '&<>"\'/'

  escaped += escaped
  unescaped += unescaped

  it('should escape values', function() {
    assert.strictEqual(escape(unescaped), escaped)
  })

  it('should handle strings with nothing to escape', function() {
    assert.strictEqual(escape('abc'), 'abc')
  })

  it('should escape the same characters unescaped by `_.unescape`', function() {
    assert.strictEqual(escape(unescape(escaped)), escaped)
  })

  lodashStable.each(['`', '/'], function(chr: string) {
    it('should not escape the "' + chr + '" character', function() {
      assert.strictEqual(escape(chr), chr)
    })
  })
})

describe('escapeRegExp', function() {
  const escapeRegExp = _.escapeRegExp
  var escaped = '\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\\\',
    unescaped = '^$.*+?()[]{}|\\'

  it('should escape values', function() {
    assert.strictEqual(escapeRegExp(unescaped + unescaped), escaped + escaped)
  })

  it('should handle strings with nothing to escape', function() {
    assert.strictEqual(escapeRegExp('abc'), 'abc')
  })

  it('should return an empty string for empty values', function() {
    var values = [, null, undefined, ''],
      expected = lodashStable.map(values, stubString)

    var actual = lodashStable.map(values, function(value: any, index: any) {
      return index ? escapeRegExp(value) : escapeRegExp()
    })

    assert.deepStrictEqual(actual, expected)
  })
})


describe('every', function() {
  const every = _.every
  it('should return `true` if `predicate` returns truthy for all elements', function() {
    assert.strictEqual(lodashStable.every([true, 1, 'a'], identity), true)
  })

  it('should return `true` for empty collections', function() {
    var expected = lodashStable.map(empties, stubTrue)

    var actual = lodashStable.map(empties, function(value: any) {
      try {
        return every(value, identity)
      } catch (e) {}
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should return `false` as soon as `predicate` returns falsey', function() {
    var count = 0

    assert.strictEqual(every([true, null, true], function(value: any) {
      count++
      return value
    }), false)

    assert.strictEqual(count, 2)
  })

  it('should work with collections of `undefined` values (test in IE < 9)', function() {
    assert.strictEqual(every([undefined, undefined, undefined], identity), false)
  })

  it('should use `_.identity` when `predicate` is nullish', function() {
    var values = [, null, undefined],
      expected = lodashStable.map(values, stubFalse)

    var actual = lodashStable.map(values, function(value: any, index: any) {
      var array = [0]
      return index ? every(array, value) : every(array)
    })

    assert.deepStrictEqual(actual, expected)

    expected = lodashStable.map(values, stubTrue)
    actual = lodashStable.map(values, function(value: any, index: any) {
      var array = [1]
      return index ? every(array, value) : every(array)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should work with `_.property` shorthands', function() {
    var objects = [{ 'a': 0, 'b': 1 }, { 'a': 1, 'b': 2 }]
    assert.strictEqual(every(objects, 'a'), false)
    assert.strictEqual(every(objects, 'b'), true)
  })

  it('should work with `_.matches` shorthands', function() {
    var objects = [{ 'a': 0, 'b': 0 }, { 'a': 0, 'b': 1 }]
    assert.strictEqual(every(objects, { 'a': 0 }), true)
    assert.strictEqual(every(objects, { 'b': 1 }), false)
  })

  it('should work as an iteratee for methods like `_.map`', function() {
    var actual = lodashStable.map([[1]], every)
    assert.deepStrictEqual(actual, [true])
  })
})


describe('exit early', function() {
  lodashStable.each(['_baseEach', 'forEach', 'forEachRight', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'transform'], function(methodName: string) {
    var func = _[methodName]

    it('`_.' + methodName + '` can exit early when iterating arrays', function() {
      if (func) {
        var array = [1, 2, 3],
          values: any[] = []

        func(array, function(value: any, other: any) {
          values.push(lodashStable.isArray(value) ? other : value)
          return false
        })

        assert.deepStrictEqual(values, [lodashStable.endsWith(methodName, 'Right') ? 3 : 1])
      }
    })

    it('`_.' + methodName + '` can exit early when iterating objects', function() {
      if (func) {
        var object = { 'a': 1, 'b': 2, 'c': 3 },
          values = []

        func(object, function(value: any, other: any) {
          values.push(lodashStable.isArray(value) ? other : value)
          return false
        })

        assert.strictEqual(values.length, 1)
      }
    })
  })
})

describe('extremum methods', function() {
  lodashStable.each(['max', 'maxBy', 'min', 'minBy'], function(methodName: string) {
    var func = _[methodName],
      isMax = /^max/.test(methodName)

    it('`_.' + methodName + '` should work with Date objects', function() {
      var curr = new Date,
        past = new Date(0)

      assert.strictEqual(func([curr, past]), isMax ? curr : past)
    })

    /** 性能问题要解决 */
    xit('`_.' + methodName + '` should work with extremely large arrays', function() {
      var array = lodashStable.range(0, 5e5)
      assert.strictEqual(func(array), isMax ? 499999 : 0)
    })

    it('`_.' + methodName + '` should work when chaining on an array with only one value', function() {
      var actual = _([40])[methodName]()
      assert.strictEqual(actual, 40)
    })
  })

  lodashStable.each(['maxBy', 'minBy'], function(methodName: string) {
    var array = [1, 2, 3],
      func = _[methodName],
      isMax = methodName == 'maxBy'

    it('`_.' + methodName + '` should work with an `iteratee`', function() {
      var actual = func(array, function(n: number) {
        return -n
      })

      assert.strictEqual(actual, isMax ? 1 : 3)
    })

    it('should work with `_.property` shorthands', function() {
      var objects = [{ 'a': 2 }, { 'a': 3 }, { 'a': 1 }],
        actual = func(objects, 'a')

      assert.deepStrictEqual(actual, objects[isMax ? 1 : 2])

      var arrays = [[2], [3], [1]]
      actual = func(arrays, 0)

      assert.deepStrictEqual(actual, arrays[isMax ? 1 : 2])
    })

    it('`_.' + methodName + '` should work when `iteratee` returns +/-Infinity', function() {
      var value = isMax ? -Infinity : Infinity,
        object = { 'a': value }

      var actual = func([object, { 'a': value }], function(object: { a: any }) {
        return object.a
      })

      assert.strictEqual(actual, object)
    })
  })
})


describe('fill', function() {
  const fill = _.fill
  it('should use a default `start` of `0` and a default `end` of `length`', function() {
    var array = [1, 2, 3]
    assert.deepStrictEqual(fill(array, 'a'), ['a', 'a', 'a'])
  })

  it('should use `undefined` for `value` if not given', function() {
    var array = [1, 2, 3],
      actual = fill(array)

    assert.deepStrictEqual(actual, Array(3))
    assert.ok(lodashStable.every(actual, function(value: any, index: string) {
      return index in actual
    }))
  })

  it('should work with a positive `start`', function() {
    var array = [1, 2, 3]
    assert.deepStrictEqual(fill(array, 'a', 1), [1, 'a', 'a'])
  })

  it('should work with a `start` >= `length`', function() {
    lodashStable.each([3, 4, Math.pow(2, 32), Infinity], function(start: any) {
      var array = [1, 2, 3]
      assert.deepStrictEqual(fill(array, 'a', start), [1, 2, 3])
    })
  })

  it('should treat falsey `start` values as `0`', function() {
    var expected = lodashStable.map(falsey, lodashStable.constant(['a', 'a', 'a']))

    var actual = lodashStable.map(falsey, function(start: any) {
      var array = [1, 2, 3]
      return fill(array, 'a', start)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should work with a negative `start`', function() {
    var array = [1, 2, 3]
    assert.deepStrictEqual(fill(array, 'a', -1), [1, 2, 'a'])
  })

  it('should work with a negative `start` <= negative `length`', function() {
    lodashStable.each([-3, -4, -Infinity], function(start: any) {
      var array = [1, 2, 3]
      assert.deepStrictEqual(fill(array, 'a', start), ['a', 'a', 'a'])
    })
  })

  it('should work with `start` >= `end`', function() {
    lodashStable.each([2, 3], function(start: any) {
      var array = [1, 2, 3]
      assert.deepStrictEqual(fill(array, 'a', start, 2), [1, 2, 3])
    })
  })

  it('should work with a positive `end`', function() {
    var array = [1, 2, 3]
    assert.deepStrictEqual(fill(array, 'a', 0, 1), ['a', 2, 3])
  })

  it('should work with a `end` >= `length`', function() {
    lodashStable.each([3, 4, Math.pow(2, 32), Infinity], function(end: any) {
      var array = [1, 2, 3]
      assert.deepStrictEqual(fill(array, 'a', 0, end), ['a', 'a', 'a'])
    })
  })

  it('should treat falsey `end` values, except `undefined`, as `0`', function() {
    var expected = lodashStable.map(falsey, function(value: undefined) {
      return value === undefined ? ['a', 'a', 'a'] : [1, 2, 3]
    })

    var actual = lodashStable.map(falsey, function(end: any) {
      var array = [1, 2, 3]
      return fill(array, 'a', 0, end)
    })

    assert.deepStrictEqual(actual, expected)
  })

  it('should work with a negative `end`', function() {
    var array = [1, 2, 3]
    assert.deepStrictEqual(fill(array, 'a', 0, -1), ['a', 'a', 3])
  })

  it('should work with a negative `end` <= negative `length`', function() {
    lodashStable.each([-3, -4, -Infinity], function(end: any) {
      var array = [1, 2, 3]
      assert.deepStrictEqual(fill(array, 'a', 0, end), [1, 2, 3])
    })
  })

  it('should coerce `start` and `end` to integers', function() {
    var positions = [[0.1, 1.6], ['0', 1], [0, '1'], ['1'], [NaN, 1], [1, NaN]]

    var actual = lodashStable.map(positions, function(pos: ConcatArray<string | number[]>) {
      var array = [1, 2, 3]
      return fill.apply(_, [array, 'a'].concat(pos))
    })

    assert.deepStrictEqual(actual, [['a', 2, 3], ['a', 2, 3], ['a', 2, 3], [1, 'a', 'a'], ['a', 2, 3], [1, 2, 3]])
  })

  it('should work as an iteratee for methods like `_.map`', function() {
    var array = [[1, 2], [3, 4]],
      actual = lodashStable.map(array, fill)

    assert.deepStrictEqual(actual, [[0, 0], [1, 1]])
  })

  it('should return a wrapped value when chaining', function() {
    var array = [1, 2, 3],
      wrapped = _(array).fill('a'),
      actual = wrapped.value()

    assert.ok(wrapped instanceof _)
    assert.strictEqual(actual, array)
    assert.deepEqual(actual, ['a', 'a', 'a'])
  })
})

describe('filter methods', function() {
  lodashStable.each(['filter', 'reject'], function(methodName: string) {
    var array = [1, 2, 3, 4],
      func = _[methodName],
      isFilter = methodName == 'filter',
      objects = [{ 'a': 0 }, { 'a': 1 }]

    it('`_.' + methodName + '` should not modify the resulting value from within `predicate`', function() {
      var actual = func([0], function(value: any, index: string | number, array: { [x: string]: number }) {
        array[index] = 1
        return isFilter
      })

      assert.deepStrictEqual(actual, [0])
    })

    it('`_.' + methodName + '` should work with `_.property` shorthands', function() {
      assert.deepStrictEqual(func(objects, 'a'), [objects[isFilter ? 1 : 0]])
    })

    it('`_.' + methodName + '` should work with `_.matches` shorthands', function() {
      assert.deepStrictEqual(func(objects, objects[1]), [objects[isFilter ? 1 : 0]])
    })

    it('`_.' + methodName + '` should not modify wrapped values', function() {
      var wrapped = _(array)

      var actual = wrapped[methodName](function(n: number) {
        return n < 3
      })

      assert.deepEqual(actual.value(), isFilter ? [1, 2] : [3, 4])

      actual = wrapped[methodName](function(n: number) {
        return n > 2
      })

      assert.deepEqual(actual.value(), isFilter ? [3, 4] : [1, 2])
    })

    it('`_.' + methodName + '` should work in a lazy sequence', function() {
      var array = lodashStable.range(LARGE_ARRAY_SIZE + 1),
        predicate = function(value: number) { return isFilter ? isEven(value) : !isEven(value) }

      var object = lodashStable.zipObject(lodashStable.times(LARGE_ARRAY_SIZE, function(index: string) {
        return ['key' + index, index]
      }))

      var actual = _(array).slice(1).map(square)[methodName](predicate).value()
      assert.deepEqual(actual, _[methodName](lodashStable.map(array.slice(1), square), predicate))

      actual = _(object).mapValues(square)[methodName](predicate).value()
      assert.deepEqual(actual, _[methodName](lodashStable.mapValues(object, square), predicate))
    })

    it('`_.' + methodName + '` should provide correct `predicate` arguments in a lazy sequence', function() {
      var args: any[] | undefined,
        array = lodashStable.range(LARGE_ARRAY_SIZE + 1),
        expected = [1, 0, lodashStable.map(array.slice(1), square)]

      _(array).slice(1)[methodName](function(value: any, index: any, array: any) {
        args || (args = slice.call(arguments))
      }).value()

      assert.deepEqual(args, [1, 0, array.slice(1)])

      args = undefined
      _(array).slice(1).map(square)[methodName](function(value: any, index: any, array: any) {
        args || (args = slice.call(arguments))
      }).value()

      assert.deepEqual(args, expected)

      args = undefined
      _(array).slice(1).map(square)[methodName](function(value: any, index: any) {
        args || (args = slice.call(arguments))
      }).value()

      assert.deepEqual(args, expected)

      args = undefined
      _(array).slice(1).map(square)[methodName](function(value: any) {
        args || (args = slice.call(arguments))
      }).value()

      assert.deepEqual(args, [1])

      args = undefined
      _(array).slice(1).map(square)[methodName](function() {
        args || (args = slice.call(arguments))
      }).value()

      assert.deepEqual(args, expected)
    })
  })
})

describe('find and findLast', function() {
  lodashStable.each(['find', 'findLast'], function(methodName: string) {
    var isFind = methodName == 'find'

    it('`_.' + methodName + '` should support shortcut fusion', function() {
      var findCount = 0,
        mapCount = 0,
        array = lodashStable.range(1, LARGE_ARRAY_SIZE + 1),
        iteratee = function(value: number) { mapCount++; return square(value) },
        predicate = function(value: number) { findCount++; return isEven(value) },
        actual = _(array).map(iteratee)[methodName](predicate)

      assert.strictEqual(findCount, isFind ? 2 : 1)
      assert.strictEqual(mapCount, isFind ? 2 : 1)
      assert.strictEqual(actual, isFind ? 4 : square(LARGE_ARRAY_SIZE))
    })
  })
})

describe('find and includes', function() {
  lodashStable.each(['includes', 'find'], function(methodName: string) {
    var func = _[methodName],
      isIncludes = methodName == 'includes',
      resolve = methodName == 'find' ? lodashStable.curry(lodashStable.eq) : identity

    lodashStable.each({
      'an `arguments` object': args,
      'an array': [1, 2, 3],
    },
    function(collection: any, key: string) {
      var values = lodashStable.toArray(collection)

      it('`_.' + methodName + '` should work with ' + key + ' and a positive `fromIndex`', function() {
        var expected = [
          isIncludes || values[2],
          isIncludes ? false : undefined,
        ]

        var actual = [
          func(collection, resolve(values[2]), 2),
          func(collection, resolve(values[1]), 2),
        ]

        assert.deepStrictEqual(actual, expected)
      })

      it('`_.' + methodName + '` should work with ' + key + ' and a `fromIndex` >= `length`', function() {
        var indexes = [4, 6, Math.pow(2, 32), Infinity]

        var expected = lodashStable.map(indexes, function() {
          var result = isIncludes ? false : undefined
          return [result, result, result]
        })

        var actual = lodashStable.map(indexes, function(fromIndex: any) {
          return [
            func(collection, resolve(1), fromIndex),
            func(collection, resolve(undefined), fromIndex),
            func(collection, resolve(''), fromIndex),
          ]
        })

        assert.deepStrictEqual(actual, expected)
      })

      it('`_.' + methodName + '` should work with ' + key + ' and treat falsey `fromIndex` values as `0`', function() {
        var expected = lodashStable.map(falsey, lodashStable.constant(isIncludes || values[0]))

        var actual = lodashStable.map(falsey, function(fromIndex: any) {
          return func(collection, resolve(values[0]), fromIndex)
        })

        assert.deepStrictEqual(actual, expected)
      })

      it('`_.' + methodName + '` should work with ' + key + ' and coerce `fromIndex` to an integer', function() {
        var expected = [
          isIncludes || values[0],
          isIncludes || values[0],
          isIncludes ? false : undefined,
        ]

        var actual = [
          func(collection, resolve(values[0]), 0.1),
          func(collection, resolve(values[0]), NaN),
          func(collection, resolve(values[0]), '1'),
        ]

        assert.deepStrictEqual(actual, expected)
      })

      it('`_.' + methodName + '` should work with ' + key + ' and a negative `fromIndex`', function() {
        var expected = [
          isIncludes || values[2],
          isIncludes ? false : undefined,
        ]

        var actual = [
          func(collection, resolve(values[2]), -1),
          func(collection, resolve(values[1]), -1),
        ]

        assert.deepStrictEqual(actual, expected)
      })

      it('`_.' + methodName + '` should work with ' + key + ' and a negative `fromIndex` <= `-length`', function() {
        var indexes = [-4, -6, -Infinity],
          expected = lodashStable.map(indexes, lodashStable.constant(isIncludes || values[0]))

        var actual = lodashStable.map(indexes, function(fromIndex: any) {
          return func(collection, resolve(values[0]), fromIndex)
        })

        assert.deepStrictEqual(actual, expected)
      })
    })
  })
})

describe('find methods', function() {
  lodashStable.each(['find', 'findIndex', 'findKey', 'findLast', 'findLastIndex', 'findLastKey'], function(methodName: string) {
    var array = [1, 2, 3, 4],
      func = _[methodName]

    var objects = [
      { 'a': 0, 'b': 0 },
      { 'a': 1, 'b': 1 },
      { 'a': 2, 'b': 2 },
    ]

    var expected = ({
      'find': [objects[1], undefined, objects[2]],
      'findIndex': [1, -1, 2],
      'findKey': ['1', undefined, '2'],
      'findLast': [objects[2], undefined, objects[2]],
      'findLastIndex': [2, -1, 2],
      'findLastKey': ['2', undefined, '2'],
    })[methodName]

    it('`_.' + methodName + '` should return the found value', function() {
      assert.strictEqual(func(objects, function(object: { a: any }) { return object.a }), expected[0])
    })

    it('`_.' + methodName + '` should return `' + expected[1] + '` if value is not found', function() {
      assert.strictEqual(func(objects, function(object: { a: number }) { return object.a === 3 }), expected[1])
    })

    it('`_.' + methodName + '` should work with `_.matches` shorthands', function() {
      assert.strictEqual(func(objects, { 'b': 2 }), expected[2])
    })

    it('`_.' + methodName + '` should work with `_.matchesProperty` shorthands', function() {
      assert.strictEqual(func(objects, ['b', 2]), expected[2])
    })

    it('`_.' + methodName + '` should work with `_.property` shorthands', function() {
      assert.strictEqual(func(objects, 'b'), expected[0])
    })

    it('`_.' + methodName + '` should return `' + expected[1] + '` for empty collections', function() {
      var emptyValues = lodashStable.endsWith(methodName, 'Index') ? lodashStable.reject(empties, lodashStable.isPlainObject) : empties,
        expecting = lodashStable.map(emptyValues, lodashStable.constant(expected[1]))

      var actual = lodashStable.map(emptyValues, function(value: any) {
        try {
          return func(value, { 'a': 3 })
        } catch (e) {}
      })

      assert.deepStrictEqual(actual, expecting)
    })

    it('`_.' + methodName + '` should return an unwrapped value when implicitly chaining', function() {
      var expected = ({
        'find': 1,
        'findIndex': 0,
        'findKey': '0',
        'findLast': 4,
        'findLastIndex': 3,
        'findLastKey': '3',
      })[methodName]

      assert.strictEqual(_(array)[methodName](), expected)
    })

    it('`_.' + methodName + '` should return a wrapped value when explicitly chaining', function() {
      assert.ok(_(array).chain()[methodName]() instanceof _)
    })

    it('`_.' + methodName + '` should not execute immediately when explicitly chaining', function() {
      var wrapped = _(array).chain()[methodName]()
      assert.strictEqual(wrapped.__wrapped__, array)
    })

    it('`_.' + methodName + '` should work in a lazy sequence', function() {
      var largeArray = lodashStable.range(1, LARGE_ARRAY_SIZE + 1),
        smallArray = array

      lodashStable.times(2, function(index: any) {
        var array = index ? largeArray : smallArray,
          wrapped = _(array).filter(isEven)

        assert.strictEqual(wrapped[methodName](), func(lodashStable.filter(array, isEven)))
      })
    })
  })
})
