import fs = require("fs")
import { arrayBufferToString } from './utils'
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

  constructor (
    public codes: ArrayBuffer,
    public functionsTable: IFuncInfo[],
    public stringsTable: string[],
    public entryFunctionIndex: number,
  ) {
  }

  public run(from: number = 0): void {
    let isRunning = true
    let stack = this.stack
    this.ip = from
    while (isRunning) {
      const ins = this.codes[this.ip++]
      switch (ins) {
      case I.EXIT:
        isRunning = false
        break
      case I.CALL:
        const newIp = this.codes[this.ip++]
        const numArgs = this.codes[this.ip++]
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
      case I.MOV:
        // TODO
      default:
        throw new Error("Unknow command " + ins)
      }
    }
  }
}

interface IFuncInfo {
  ip: number,
  numArgs: number,
}

/**
 * Header:
 *
 * mainFunctionIndex: 1
 * funcionTableBasicIndex: 1
 * stringTableBasicIndex: 1
 * globalsSize: 2
 */
const BYTE = 8
export const createVMFromFile = (fileName: string): VirtualMachine => {
  const buffer = new Uint8Array(fs.readFileSync(fileName)).buffer
  const mainFunctionIndex = readUInt8(buffer, 0, 1)
  const funcionTableBasicIndex = readUInt8(buffer, 1, 2)
  const stringTableBasicIndex = readUInt8(buffer, 2, 3)
  const globalsSize = readUInt8(buffer, 3, 5)

  const stringsTable: string[] = parseStringsArray(buffer.slice(stringTableBasicIndex))
  const codesBuf = buffer.slice(5, funcionTableBasicIndex)
  const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex)
  const funcsTable: IFuncInfo[] = parseFunctionTable(funcsBuf)

  return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex)
}

const parseFunctionTable = (buffer: ArrayBuffer): IFuncInfo[] => {
  const funcs: IFuncInfo[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ip = readUInt8(buffer, i, i + 1)
    const numArgs = readUInt16(buffer, i + 1, i + 3)
    funcs.push({ ip, numArgs })
    i += 3
  }
  return funcs
}

const parseStringsArray = (buffer: ArrayBuffer): string[] => {
  const strings: string[] = []
  let i = 0
  while(i < buffer.byteLength) {
    const len = readUInt32(buffer, 0, 4)
    const start = i + 4
    const end = i + 4 + len * 2
    const str = readString(buffer, start, end)
    strings.push(str)
    i = end
  }
  return strings
}

const readUInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint8Array(buffer.slice(from, to)))[0]
}

const readUInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint16Array(buffer.slice(from, to)))[0]
}

const readUInt32 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint32Array(buffer.slice(from, to)))[0]
}

const readString = (buffer: ArrayBuffer, from: number, to: number): string => {
  return arrayBufferToString(buffer.slice(from, to))
}

