let I

exports.setInstructionsCode = (_I) => {
  I = _I
}

exports.parseVmFunctionToJsFunction = function parseVmFunctionToJsFunction (funcInfo, vm) {
  return function(numArgs) {
    vm.closureTable = funcInfo.closureTable
    vm.closureTables.push(funcInfo.closureTable)
    vm.currentThis = this
    vm.allThis.push(this)
    const stack = vm.stack
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
