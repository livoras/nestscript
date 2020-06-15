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

export const enum IOperatantType {
  REGISTER,
  NUMBER,
  FUNCTION_INDEX,
  STRING,
  ARG_COUNT,
  RETURN_VALUE,
}

export interface IOperant {
  type: IOperatantType,
  value: any,
}

export const operantBytesSize: { [x in IOperatantType]: number } = {
  [IOperatantType.FUNCTION_INDEX]: 2,
  [IOperatantType.STRING]: 2,

  [IOperatantType.REGISTER]: 2,
  [IOperatantType.ARG_COUNT]: 2,

  [IOperatantType.NUMBER]: 8,
  [IOperatantType.RETURN_VALUE]: 0,
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

  public run(): void {
    let isRunning = true
    let stack = this.stack
    this.ip = this.functionsTable[this.entryFunctionIndex].ip
    while (isRunning) {
      const op = this.nextOperator()
      console.log(op)
      switch (op) {
      case I.EXIT: {
        console.log('exit')
        isRunning = false
        break
      }
      case I.CALL: {
        const newIp = this.nextOperant()
        const numArgs = this.nextOperant()
        console.log('call', newIp, numArgs)
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
        stack[++this.sp] = numArgs.value
        stack[++this.sp] = this.ip
        stack[++this.sp] = this.fp
        // set to new ip and fp
        this.ip = this.functionsTable[newIp.value].ip
        this.fp = this.sp
        break
      }
      case I.RET: {
        console.log('ret')
        const fp = this.fp
        this.fp = stack[fp]
        this.ip = stack[fp - 1]
        // 减去参数数量，减去三个 fp ip numArgs
        this.sp = fp - stack[fp - 2] - 3
        // 清空上一帧
        this.stack = stack = stack.slice(0, this.sp + 1)
        break
      }
      case I.MOV: {
        console.log('mov`')
        const dst = this.nextOperant()
        const src = this.nextOperant()
        console.log('dest', dst, 'src', src)
        break
      }
      default:
        throw new Error("Unknow command " + op)
      }
    }
  }

  public nextOperator(): I {
    console.log("ip -> ", this.ip)
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(): IOperant {
    const codes = this.codes
    const valueType = readUInt8(codes, this.ip, ++this.ip)
    console.log(valueType)
    let value: any
    switch (valueType) {
    case IOperatantType.REGISTER:
    case IOperatantType.ARG_COUNT:
    case IOperatantType.FUNCTION_INDEX:
    case IOperatantType.STRING:
      let j = this.ip + 2
      value = readInt16(codes, this.ip, j)
      console.log('the value --->', value)
      this.ip = j
      break
    case IOperatantType.NUMBER:
      j = this.ip + 8
      value = readFloat64(codes, this.ip, j)
      this.ip = j
      break
    case IOperatantType.RETURN_VALUE:
      break
    default:
      throw new Error("Unknown operant " + valueType)
    }
    return { type: valueType, value }
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
  console.log(funcsTable)
  console.log('codes length -->', codesBuf.byteLength)
  console.log('main start index', funcsTable[mainFunctionIndex].ip)

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

const readFloat64 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Float64Array(buffer.slice(from, to)))[0]
}

const readUInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  console.log('-> ', from, to, new Uint8Array(buffer.slice(from, to)))
  return (new Uint8Array(buffer.slice(from, to)))[0]
}

const readInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  console.log('-> ', from, to, new Int8Array(buffer.slice(from, to)))
  return (new Int8Array(buffer.slice(from, to)))[0]
}

const readInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  console.log('-> ', from, to, new Int16Array(buffer.slice(from, to)))
  return (new Int16Array(buffer.slice(from, to)))[0]
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

