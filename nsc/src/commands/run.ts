// tslint:disable: typedef
// tslint:disable: only-arrow-functions
// tslint:disable: typedef
import { Command, flags } from '@oclif/command'
import path = require("path")
import fs = require("fs")
import { parseCodeToProgram } from "nestscript"
import { VirtualMachine, createVMFromArrayBuffer } from "nestscript/src/vm/vm"

export default class Run extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ nsc compile eg.asm target`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Run)
    if (!args.file) {
      console.log("Please specify executable file.")
      return
    }
    const exe = this.getAbsPath(args.file)
    const g = {
      Array,
      Function,
      RegExp,
      Object,
      String,
      TypeError,
      ArrayBuffer,
      DataView,
      Uint8Array,
      Error,
      Set,
      Map,
      Boolean,
      Infinity,
      Math,
      console,
      Buffer,
      Number,
      process,
      Date,
    } as any
    const vm = createVMFromArrayBuffer((new Uint8Array(fs.readFileSync(exe)).buffer), g)
    vm.run()
    // console.log(g)
    // console.log('-------->', _.isEqual(1, 1))
    // const array = [0, 1, 2, 3, 4, 5]
    // const actual = _.chunk(array, 3)
    // console.log(actual)
    // const lodashStable = _
    // console.log(_(lodashStable.constant('x')).attempt())
    // console.log('the fucking result is ->', _(lodashStable.constant('x')).chain().attempt() instanceof _)
    // console.log('isRunning ...', vm.isRunning)
    // let emojiVar = '\ufe0f'
    const slice = Array.prototype.slice
    const falsey = [, null, undefined, false, 0, NaN, '']

    // /** Used to provide empty values to methods. */
    // const empties = [[], {}].concat(falsey.slice(1))

    // const values = lodashStable.reject(empties, function(value: number) {
    //   return (value === 0) || lodashStable.isArray(value)
    // }).concat(-1, 1.1)

    // const array = lodashStable.transform(values, function(result: { [x: string]: number }, value: string | number) {
    //   result[value] = 1
    // }, [])
    // const expected = lodashStable.map(values, () => 1)
    // console.log(expected, '....')
    // let actual = lodashStable.at(array, values)
    // console.log(expected, actual)

    // const object = { 'a': [{ 'b': { 'c': 3 } }, 4] }
    // actual = _.at(object, ['a[0].b.c', 'a[1]'])
    // console.log(actual, [3, 4])

    // console.log(_(_.range(20)).map((v: number) => v * v).at(4).value())
    // _.attempt(function() { throw new Error('x') })

    // function fn(a: any, b: any, c: any, d: any) {
    //   return slice.call(arguments)
    // }
    // const curried = _.curry(fn)
    // const ph = curried.placeholder
    // let placeholder
    // const curried = _.curry(fn),
    //   _ph = placeholder = {},
    //   ph = curried.placeholder

    // const ret = curried(1)(_ph, 3)(ph, 4)
    // console.log('-------------------->', ret, [1, ph, 3, 4])
    // console.log(ret.length)
    // console.log(curried(1)(ph, 3)(ph, 4)(2), [1, 2, 3, 4])
    // console.log(curried(ph, 2)(1)(ph, 4)(3), [1, 2, 3, 4])
    // console.log(curried(ph, ph, 3)(ph, 2)(ph, 4)(1), [1, 2, 3, 4])
    // console.log(curried(ph, ph, ph, 4)(ph, ph, 3)(ph, 2)(1), [1, 2, 3, 4])
    // console.log(actual)
    // function fn(a, b, c, d) {
    //   return slice.call(arguments)
    // }
    // const curried = _.curryRight(fn),
    //   expected = [1, 2, 3, 4],
    //   ph = curried.placeholder
    // console.log(curried(4)(2, ph)(1, ph)(3), expected)
    const burredLetters = [
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

    let deburredLetters = [
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

    // console.log(_.escape('`'))
    // console.log(_.escape('/'))
    // const a = new Date()
    // console.log(_.max(_.range(0, 5e5)))
    // console.log(new Date() - a)
  }

  public getAbsPath(p: string): string {
    return path.resolve(path.join(process.cwd(), p))
  }
}
