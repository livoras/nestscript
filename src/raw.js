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
  return function(...args) {
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
      let op = vm.fetchAndExecute()
      while (op !== I.RET && op !== I.EXIT) {
        op = vm.fetchAndExecute()
      }
      return stack[0]
    }
  }
}

/** 控制权转移回调 */
exports.newCallback = function newCallback(vm, funcInfo) {
  // tslint:disable-next-line: only-arrow-functions
  return function(...args) {
    args.reverse()
    args.forEach((arg) => vm.push(arg))
    vm.callFunction(funcInfo, args.length, this)
    let op = null
    let callCount = 1
    /** 回调函数的实现 */
    while (callCount !== 0) {
      op = vm.fetchAndExecute()
      if(op === I.CALL) {
        callCount++
      } else if (op === I.RET) {
        callCount--
      } else {
        // do nothing..
      }
    }
  }
}
