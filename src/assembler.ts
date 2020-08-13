import { I, IOperatantType } from './vm'
import { getByteLengthFromInt32, concatBuffer, stringToArrayBuffer, createOperantBuffer, getOperatantByBuffer, getOperantName } from './utils'
import { parseCode, parseAssembler, IParsedFunction } from './parser'
import { optimizeCode } from './optimizer'

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

 /**
  * Func Add {
  *   PARAM Y
  *   PARAM X
  *   VAR SUM
  *   MOV SUM, X
  *   ADD SUM, Y
  *   MOV _RET_VAL, SUM
  * }
  * VAR
  * PUSH
  * POP
  * LABEL
  */

/**
 *
 *
 */

/** 函数调用的堆栈结构
 * X
 * Y
 * Z
 * ARRAY...
 * - old frame pointer
 * - return instruction pointer
 * - num args
 * PARAM1
 * PARAM2
 */
interface IFuncInfo {
  name: string,
  symbols: any,
  codes: string[][],
  numArgs: number,
  localSize: number,
  globals: any,
  ip?: number,
  index?: number,
  bytecodes?: ArrayBuffer,
  labels?: any,
}


// tslint:disable-next-line: no-big-function
export const parseCodeToProgram = (program: string): Buffer => {
  const funcsTable = {}
  const globalSymbols = {}
  const stringTable: string[] = []
  const stringIndex: any = {}
  // const funcs = parseAssembler(optimizeCode(program))
  const funcs = parseAssembler(program) // program
    // .trim()
    // .match(/func\s[\s\S]+?\}/g) || []

  // console.log(funcs, '--->')
  // 1 pass
  const funcsInfo: any[] = []
  let globalSize: number = 0
  funcs.forEach((func: IParsedFunction): void => {
    if (!func) { return }
    const funcInfo = parseFunction(func)
    funcInfo.index = funcsInfo.length
    funcsInfo.push(funcInfo)
    funcsTable[funcInfo.name] = funcInfo
    funcInfo.globals.forEach((g: string): void => {
      globalSymbols[g] = globalSize++
    })
  })

  // 2 pass
  funcsInfo.forEach((funcInfo: IFuncInfo): void => {
    const symbols = funcInfo.symbols
    funcInfo.codes.forEach((code: any[]): void => {
      const op = code[0]
      code[0] = I[op]
      if (op === 'CALL' && op) {
        code[1] = {
          type: IOperatantType.FUNCTION_INDEX,
          value: funcsTable[code[1]].index,
        }
        code[2] = {
          type: IOperatantType.ARG_COUNT,
          value: +code[2],
        }
      } else {
        code.forEach((o: any, i: number): void => {
          if (i === 0) { return }

          if (
            (op === 'TRY' && (i === 1 || i === 2)) ||
            ['JMP'].includes(op) ||
            (['JE', 'JNE', 'JG', 'JL', 'JGE', 'JLE'].includes(op) && i === 3) ||
            (['JF', 'JIF'].includes(op) && i === 2)
          ) {
            code[i] = {
              type: IOperatantType.ADDRESS,
              value: funcInfo.labels[code[i]],
            }
            return
          }

          if (['FUNC'].includes(op) && i === 2) {
            code[i] = {
              type: IOperatantType.FUNCTION_INDEX,
              value: funcsTable[code[i]].index,
            }
            return
          }

          if (o.startsWith('@c')) {
            code[i] = {
              type: IOperatantType.CLOSURE_REGISTER,
              value: Number(o.replace('@c', '')),
            }
            return
          }

          /** 寄存器 */
          let regIndex = symbols[o]
          if (regIndex !== undefined) {
            code[i] = {
              type: IOperatantType.REGISTER,
              value: regIndex,
            }
            return
          }

          /** 全局 */
          regIndex = globalSymbols[o]
          if (regIndex !== undefined) {
            code[i] = {
              type: IOperatantType.GLOBAL,
              value: regIndex + 1, // 留一位给 RET
            }
            return
          }

          if (o === 'true' || o === 'false') {
            code[i] = {
              type: IOperatantType.BOOLEAN,
              value: o === 'true' ? 1: 0,
            }
            return
          }

          if (o === 'null') {
            code[i] = {
              type: IOperatantType.NULL,
            }
            return
          }

          if (o === 'undefined') {
            code[i] = {
              type: IOperatantType.UNDEFINED,
            }
            return
          }

          /** 返回类型 */
          if (o === '$RET') {
            code[i] = {
              type: IOperatantType.RETURN_VALUE,
            }
            return
          }

          /** 字符串 */
          if (o.match(/^\"[\s\S]*\"$/) || o.match(/^\'[\s\S]*\'$/)) {
            const str = o.replace(/^[\'\"]|[\'\"]$/g, '')
            let index = stringIndex[str]
            index = typeof index === 'number' ? index : void 0 // 'toString' 不就挂了？
            code[i] = {
              type: IOperatantType.STRING,
              value: index === undefined
                ? stringTable.length
                : index,
            }
            if (index === undefined) {
              stringIndex[str] = stringTable.length
              stringTable.push(str)
            }
            return
          }

          /** Number */
          code[i] = {
            type: IOperatantType.NUMBER,
            value: +o,
          }
        })
      }
    })
  })

  // console.log('\n\n====================================')
  // funcsInfo[0].codes.forEach((c: any): void => {
  //   console.log(I[c[0]], c.slice(1))
  // })
  // console.log('====================================\n\n')
  const stream = parseToStream(funcsInfo, stringTable, globalSize)
  return Buffer.from(stream)
}

/**
 * header
 * codes (op(1) operantType(1) value(??) oprantType value | ...)
 * functionTable (ip(1) | numArgs(2))
 * stringTable (len(4) str | len(4) str)
 */
// tslint:disable-next-line: no-big-function
const parseToStream = (funcsInfo: IFuncInfo[], strings: string[], globalsSize: number): ArrayBuffer => {
  const stringTable = parseStringTableToBuffer(strings)

  let buffer = new ArrayBuffer(0)
  let mainFunctionIndex: number = 0
  // tslint:disable-next-line: no-big-function
  funcsInfo.forEach((funcInfo: IFuncInfo): void => {
    const currentFunctionAddress = funcInfo.ip = buffer.byteLength

    if (funcInfo.name === '@@main') {
      mainFunctionIndex = funcInfo.index!
    }

    let isAddressCodeByteChanged = true
    const DEFAULT_ADDRESS_LEN = 0
    let codeAddress: number[] = []
    let addressCandidates: { codeIndex: number, bufferIndex: number, addressByteLen: number }[] = []
    let currentFuncBuffer: ArrayBuffer = new ArrayBuffer(0)
    const addressCodeByteMap: any = {}
    while(isAddressCodeByteChanged) {
      // console.log("////??/")
      isAddressCodeByteChanged = false
      currentFuncBuffer = funcInfo.bytecodes = new ArrayBuffer(0)
      codeAddress = []
      addressCandidates = []
      const appendBuffer = (buf: ArrayBuffer): void => {
        // buffer = concatBuffer(buffer, buf)
        currentFuncBuffer = funcInfo.bytecodes = concatBuffer(funcInfo.bytecodes!, buf)
      }

      funcInfo.codes.forEach((code: any, i): void => {
        const codeOffset = currentFunctionAddress + currentFuncBuffer.byteLength
        const addressByteLength: number = getByteLengthFromInt32(codeOffset)
        codeAddress.push(codeOffset)

        /* if byte length change should generate again */
        if ((addressCodeByteMap[i] || DEFAULT_ADDRESS_LEN) !== addressByteLength){
          isAddressCodeByteChanged = true
          addressCodeByteMap[i] = addressByteLength
        }

        /* append operator buffer */
        const operator = code[0]
        appendBuffer(Uint8Array.from([operator]).buffer)

        /* loop operant */
        code.forEach((o: { type: IOperatantType, value: any }, j: number): void => {
          if (j === 0) { return }
          if (o.type !== IOperatantType.ADDRESS) {
            const buf = createOperantBuffer(o.type, o.value)
            appendBuffer(buf)
          } else {
            const byteLength = addressCodeByteMap[o.value] || DEFAULT_ADDRESS_LEN
            const buf = createOperantBuffer(o.type, 0, byteLength)
            appendBuffer(buf)
            addressCandidates.push({
              codeIndex: o.value,
              bufferIndex: currentFuncBuffer.byteLength - byteLength,
              addressByteLen: byteLength,
            })
          }
        })
      })
    }

    addressCandidates.forEach(({ codeIndex, bufferIndex, addressByteLen }, i): void => {
      const address = codeAddress[codeIndex]
      const buf = new Uint8Array(Int32Array.from([address]).buffer)
      console.log(i, '=====================================')
      console.log('codeIndex -> ', codeIndex)
      console.log('address -> ', address)
      console.log('bufferIndex -> ', bufferIndex)
      console.log('addressBytenLen -> ', addressByteLen)
      const functionBuffer = new Uint8Array(currentFuncBuffer)
      functionBuffer.set(buf.slice(0, addressByteLen), bufferIndex)
    })

    buffer = concatBuffer(buffer, currentFuncBuffer)
  })

  /**
   * Header:
   *
   * mainFunctionIndex: 4
   * funcionTableBasicIndex: 4
   * stringTableBasicIndex: 4
   * globalsSize: 4
   */
  const FUNC_SIZE = 4 + 2 + 2 // ip + numArgs + localSize
  const funcionTableBasicIndex = 4 * 4 + buffer.byteLength
  const stringTableBasicIndex = funcionTableBasicIndex + FUNC_SIZE * funcsInfo.length
  const headerView = new Uint32Array(4)
  headerView[0] = mainFunctionIndex
  headerView[1] = funcionTableBasicIndex
  headerView[2] = stringTableBasicIndex
  headerView[3] = globalsSize
  buffer = concatBuffer(headerView.buffer, buffer)

  /** Function Table */
  funcsInfo.forEach((funcInfo: IFuncInfo, i: number): void => {
    const ipBuf = new Uint32Array(1)
    const numArgsAndLocal = new Uint16Array(2)
    ipBuf[0] = funcInfo.ip!
    numArgsAndLocal[0] = funcInfo.numArgs
    numArgsAndLocal[1] = funcInfo.localSize
    const funcBuf = concatBuffer(ipBuf.buffer, numArgsAndLocal.buffer)
    buffer = concatBuffer(buffer, funcBuf)
  })

  /** append string buffer */
  buffer = concatBuffer(buffer, stringTable.buffer)
  return buffer
}

const parseStringTableToBuffer = (stringTable: string[]): {
  buffer: ArrayBuffer,
  indexes: { [x in number]: number },
} => {
  /** String Table */
  let strBuf = new ArrayBuffer(0)
  const indexes: any = {}
  stringTable.forEach((str: string, i: number): void => {
    indexes[i] = strBuf.byteLength
    const lenBuf = new Uint32Array(1)
    lenBuf[0] = str.length
    strBuf = concatBuffer(strBuf, lenBuf.buffer)
    strBuf = concatBuffer(strBuf, stringToArrayBuffer(str))
  })
  return {
    buffer: strBuf,
    indexes,
  }
}

const parseFunction = (func: IParsedFunction): IFuncInfo => {
  const funcName = func.functionName
  const args = func.params
  const body = func.instructions

  const vars = body.filter((stat: string[]): boolean => stat[0] === 'VAR')
  const globals = body
    .filter((stat: string[]): boolean => stat[0] === 'GLOBAL')
    .map((stat: string[]): string => stat[1])
  const codes = body.filter((stat: string[]): boolean => stat[0] !== 'VAR' && stat[0] !== 'GLOBAL')
  const symbols: any = {}
  args.forEach((arg: string, i: number): void => {
    symbols[arg] = -3 - i
  })
  let j = 0
  vars.forEach((v: string[], i: number): void => {
    const reg = v[1]
    if (reg.startsWith('@c')) {
      symbols[reg] = -1
    } else {
      symbols[reg] = j + 1
      j++
    }
  })

  if (funcName === '@@main') {
    codes.push(['EXIT'])
  } else if (codes.length === 0 || codes[codes.length - 1][0] !== 'RET') {
    codes.push(['RET'])
  }

  const labels: any = {}
  const codesWithoutLabel: string[][] = []
  codes.forEach((code: string[]): void => {
    if (code[0] === 'LABEL') {
      labels[code[1]] = codesWithoutLabel.length
    } else {
      codesWithoutLabel.push(code)
    }
  })
  console.log('===>', funcName, codesWithoutLabel, labels)

  return {
    name: funcName,
    numArgs: args.length,
    symbols,
    codes: codesWithoutLabel,
    localSize: vars.length,
    globals,
    labels,
  }
}
