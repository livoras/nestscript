// https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1
class Callable extends Function {
  constructor() {
    super()
  }
}

exports.Callable = Callable

let I
exports.setInstructionsCode = (_I) => {
  I = _I
}

class NumArgs {
  constructor(numArgs) {
    this.numArgs = numArgs
  }
}

exports.NumArgs = NumArgs

exports.parseVmFunctionToJsFunction = function parseVmFunctionToJsFunction (funcInfo, vm) {
  const func = function (...args) {
    const n = args[0]
    const isCalledFromJs = !(n instanceof NumArgs)
    let numArgs = 0
    if (isCalledFromJs) {
      args.reverse()
      args.forEach((arg) => vm.push(arg))
      numArgs = args.length
    } else {
      numArgs = n.numArgs
    }
    // console.log("CALLING ---->", funcInfo)
    vm.closureTable = funcInfo.closureTable
    vm.closureTables.push(funcInfo.closureTable)
    vm.currentThis = this
    vm.allThis.push(this)
    const stack = vm.stack
    if (isCalledFromJs) {
      stack[0] = undefined
    }
    // console.log('call', funcInfo, numArgs)
    //            | R3      |
    //            | R2      |
    //            | R1      |
    //            | R0      |
    //      sp -> | fp      | # for restoring old fp
    //            | ip      | # for restoring old ip
    //            | numArgs | # for restoring old sp: old sp = current sp - numArgs - 3
    //            | arg1    |
    //            | arg2    |
    //            | arg3    |
    //  old sp -> | ....    |
    stack[++vm.sp] = numArgs
    stack[++vm.sp] = vm.ip
    stack[++vm.sp] = vm.fp
    // set to new ip and fp
    vm.ip = funcInfo.ip
    vm.fp = vm.sp
    vm.sp += funcInfo.localSize
    if (isCalledFromJs) {
      /** 嵌套 vm 函数调 vm 函数，需要知道嵌套多少层，等到当前层完结再返回 */
      let callCount = 1
      while (callCount > 0) {
        const [op, isCallVMFunction] = vm.fetchAndExecute()
        if (isCallVMFunction) {
          callCount++
        } else if (op === I.RET) {
          callCount--
        }
      }
      return stack[0]
    }
  }
  Object.setPrototypeOf(func, Callable.prototype)
  func.__ip__ = funcInfo.ip
  return func
}
