/**
 *
 * MOV dest src 赋值给变量
 *
 * ADD d s
 * SUB d s
 * DIV d s
 * MOD d s
 * EXP d power
 * NEG
 * INC
 * DEC
 *
 *
 * AND d s
 * OR ..
 * XOR ..
 * NOT d
 * SHL d count
 * SHR d count
 *
 * JMP label
 * JE op1 op1 label
 * JNE op1 op1 label
 * JG op1 op2 label
 * JL op1 op2 label
 * JGE op1 op2 label
 * JLE op1 op2 label
 * PUSH src
 * POP dest
 * CALL function numArgs
 * RET
 *
 * PAUSE ms
 * EXIT code
 */
export enum I {
 MOV, ADD, SUB, DIV, MOD,
 EXP, NEG, INC, DEC, AND,
 OR, XOR, NOT, SHL, SHR,
 JMP, JE, JNE, JG, JL,
 JGE, JLE, PUSH, POP, CALL,
 RET, AUSE, EXIT,
}

export class VirtualMachine {
  /** 指令索引 */
  public ip: number = 0
  /** 当前函数帧基索引 */
  public fp: number = 0
  /** 操作的栈顶 */
  public sp: number = -1

  /** 寄存器 */
  public RET: any // 函数返回寄存器
  public REG: any // 通用寄存器

  /** 函数操作栈 */
  public stack: any[] = []

  constructor (public instructions: any[]) {
  }

  public run(from: number = 0): void {
    let isRunning = true
    let stack = this.stack
    this.ip = from
    while (isRunning) {
      const ins = this.instructions[this.ip++]
      switch (ins) {
      case I.EXIT:
        isRunning = false
        break
      case I.CALL:
        const newIp = this.instructions[this.ip++]
        const numArgs = this.instructions[this.ip++]
        //      sp -> | fp      | # for restoring old fp
        //            | ip      | # for restoring old ip
        //            | numArgs | # for restoring old sp: old sp = current sp - numArgs - 3
        //            | arg1    |
        //            | arg2    |
        //            | arg3    |
        //  old sp -> | ....    |
        stack[++this.sp] = numArgs
        stack[++this.sp] = this.ip
        stack[++this.sp] = this.fp
        // set to new ip and fp
        this.ip = newIp
        this.fp = this.sp
        break
      case I.RET:
        const fp = this.fp
        this.fp = stack[fp]
        this.ip = stack[fp - 1]
        // 减去参数数量，减去三个 fp ip numArgs
        this.sp = fp - stack[fp - 2] - 3
        // 清空上一帧
        this.stack = stack = stack.slice(0, this.sp + 1)
        break
      default:
        throw new Error("Unknow command " + ins)
      }
    }
  }
}
