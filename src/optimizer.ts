// tslint:disable: max-classes-per-file

import { parseAssembler, IParsedFunction } from './parser'
import { I, IOperatantType } from './vm/vm'
const fs = require('fs')

class CodeBlock {
  public toCodeBlocks = new Set<number>()
  constructor(
    public codes: string[][] = [],
    public index: number = 0,
  ) {}
}

class CodeBlockGraph {
  public blockMap: Map<number, CodeBlock> = new Map()
  public codes: string[][] = []
  public functionName: string = ''
  public params: string[] = []

  constructor(public func: IParsedFunction) {
    this.functionName = func.functionName
    this.codes = func.instructions
    this.params = func.params
    this.parse()
  }

  public parse(): void {
    let codeBlock = new CodeBlock([], 0)
    let oldCodeBlock = codeBlock
    const labelsMap = new Map<string, number>()
    this.codes.forEach((code: string[], i): void => {
      if (code[0].match(/LABEL/i)) {
        labelsMap.set(code[1], i)
      }
    })
    this.blockMap.set(0, codeBlock)

    this.codes.forEach((code: string[], i): void => {
      const op = code[0]
      const isJumpCode: boolean = ['JMP', 'JE', 'JNE', 'JG', 'JL', 'JGE', 'JLE', 'JF', 'JIF'].includes(op)
      const isLabelCode: boolean = !!op.match(/LABEL/i)
      if (isLabelCode) {
        if (codeBlock.codes.length !== 0) {
          oldCodeBlock = codeBlock
          codeBlock = new CodeBlock([], i)
          this.blockMap.set(codeBlock.index, codeBlock)
        } else {
          codeBlock.index = i
        }
        oldCodeBlock.toCodeBlocks.add(i)
        codeBlock.codes.push(code)
      } else if (isJumpCode) {
        codeBlock.codes.push(code)
        const label = code[code.length - 1]
        if (!labelsMap.has(label)) {
          throw new Error(`cannot find label ${label}`)
        }
        codeBlock.toCodeBlocks.add(labelsMap.get(label)!)
        codeBlock.toCodeBlocks.add(i + 1)
        oldCodeBlock = codeBlock
        codeBlock = new CodeBlock([], i + 1)
        this.blockMap.set(codeBlock.index, codeBlock)
      } else {
        codeBlock.codes.push(code)
      }
    })
  }

  public print(): void {
    for (const [_, cb] of this.blockMap.entries()) {
      console.log('--->', cb.index, cb.codes, cb.toCodeBlocks)
    }
  }

  public optimize(): void {
    [...this.blockMap.entries()].forEach(([i, codeBlock]): void => {
      codeBlock.codes = optimizeCodes(codeBlock.codes)
    })
  }

  public output(): any {
    const codeString = [...this.blockMap.entries()]
      .sort(([i]: any, [j]: any): any => i - j)
      .reduce<string[][]>((ret: string[][], [i, codeBlock]): string[][] => {
        return [...ret, ...codeBlock.codes]
      }, [])
      .filter((c): boolean => !!c)
      .map((c: string[]): string => {
        if (c[0] === 'LABEL') {
          return c.join(' ') + ':\n'
        }
        return '  ' + c.join(' ') + ';\n'
      }).join('')
    return `func ${this.functionName} (${this.params.join(', ')}) {
${codeString.trimRight()}\n}`
  }
}

export const optimizeCode = (code: string): string => {
  // return code
  const ret = parseAssembler(code, true).reduce((r: string, func: IParsedFunction): string => {
    const cb = new CodeBlockGraph(func)
    cb.optimize()
    return r + '\n' + cb.output()
  }, '').trim()
  fs.writeFileSync('opt.nes', ret, 'utf-8')
  return ret
  // console.log(funcs)
  // console.log(func.instructions.join('\n'))
}

const enum OU {
  SET,
  GET,
  BOTH,
}

/**
 * 'code string'.split(',').map((s) => s.trim()).filter((s) => !!s).map((s) => `[I.${s}]: []`).join(',\n')
 */
const SET_GET = [OU.SET, OU.GET]
const BOTH_GET = [OU.BOTH, OU.GET]
const THREE_GET = [OU.GET, OU.GET, OU.GET]
const TWO_GET = [OU.GET, OU.GET]
const codeToUseAge: { [x in any]: OU[] } = {
  [I.MOV]: SET_GET,
  [I.ADD]: BOTH_GET,
  [I.SUB]: BOTH_GET,
  [I.MUL]: BOTH_GET,
  [I.DIV]: BOTH_GET,
  [I.MOD]: BOTH_GET,
  [I.EXP]: BOTH_GET,
  [I.INC]: [OU.BOTH],
  [I.DEC]: [OU.BOTH],
  [I.LT]: BOTH_GET,
  [I.GT]: BOTH_GET,
  [I.EQ]: BOTH_GET,
  [I.LE]: BOTH_GET,
  [I.GE]: BOTH_GET,
  [I.NE]: BOTH_GET,
  [I.WEQ]: BOTH_GET,
  [I.WNE]: BOTH_GET,
  [I.LG_AND]: BOTH_GET,
  [I.LG_OR]: BOTH_GET,
  [I.AND]: BOTH_GET,
  [I.OR]: BOTH_GET,
  [I.XOR]: BOTH_GET,
  [I.SHL]: BOTH_GET,
  [I.SHR]: BOTH_GET,
  [I.ZSHR]: BOTH_GET,
  [I.JMP]: [OU.GET],
  [I.JE]: THREE_GET,
  [I.JNE]: THREE_GET,
  [I.JG]: THREE_GET,
  [I.JL]: THREE_GET,
  [I.JIF]: TWO_GET,
  [I.JF]: TWO_GET,
  [I.JGE]: THREE_GET,
  [I.JLE]: THREE_GET,
  [I.PUSH]: [OU.GET],
  [I.POP]: [],
  [I.CALL]: [], // ignore
  [I.PRINT]: [OU.GET],
  [I.RET]: [],
  [I.PAUSE]: [],
  [I.EXIT]: [],
  [I.CALL_CTX]: THREE_GET,
  [I.CALL_VAR]: [...THREE_GET, OU.GET],
  [I.CALL_REG]: THREE_GET,
  [I.MOV_CTX]: SET_GET,
  [I.MOV_PROP]: [OU.SET, OU.GET, OU.GET],
  [I.SET_CTX]: [OU.GET, OU.GET],
  [I.NEW_OBJ]: [OU.SET],
  [I.NEW_ARR]: [OU.SET],
  [I.SET_KEY]: [OU.GET, OU.GET, OU.GET],
  [I.FUNC]: SET_GET,
  [I.ALLOC]: [OU.GET],
  [I.PLUS]: [OU.BOTH],
  [I.MINUS]: [OU.BOTH],
  [I.NOT]: [OU.BOTH],
  [I.VOID]: [OU.BOTH],
  [I.DEL]: [OU.BOTH],
  [I.NEG]: [OU.BOTH],
  [I.TYPE_OF]: [OU.BOTH],
  [I.INST_OF]: BOTH_GET,
  [I.IN]: BOTH_GET,
  [I.MOV_THIS]: [OU.SET],
  [I.NEW_REG]: [OU.SET, OU.GET, OU.GET],
  [I.TRY]: [OU.GET],
  [I.TRY_END]: [],
  [I.THROW]: [OU.GET],
  [I.FORIN]: [OU.BOTH, OU.GET],
  [I.FORIN_END]: [],
  [I.BREAK_FORIN]: [],
  [I.CONT_FORIN]: [],
  [I.MOV_ARGS]: [OU.SET],
}

const IGNORE_INS = [
  I.NEW_ARR,
  I.NEW_OBJ,
]

const enum ValueType {
  NUMBER,
  REGISTESR,
  STRING,
  OTHER,
}

interface ICandidate {
  codeIndex: number,
  operator: string,
  value: string,
  valueType: ValueType,
  usages: { codeIndex: number, position: number }[],
}

const optimizeCodes = (codes: any[]): any[] => {
  const candidates: Map<string, ICandidate> = new Map()
  const isInCandidates = (reg: string): boolean => candidates.has(reg)
  const isReg = (s: string): boolean => s.startsWith('%')

  const getValueType = (val: string): ValueType => {
    if (isReg(val)) {
      return ValueType.REGISTESR
    } else if (val.match(/^['"]/)) {
      return ValueType.STRING
    } else if (!isNaN(Number(val))) {
      return ValueType.NUMBER
    } else {
      return ValueType.OTHER
    }
  }

  const processReg = (reg: string): void => {
    const candidate = candidates.get(reg)!
    if (candidate.valueType === ValueType.NUMBER && candidate.usages.length > 1) { return }
    const { codeIndex, value, usages } = candidate
    codes[codeIndex] = null
    for (const usage of usages) {
      try {
        codes[usage.codeIndex][usage.position] = value
      } catch(e) {
        throw new Error(e)
      }
    }
    candidates.delete(reg)
  }

  const isIgnoreOperator = (op: string): boolean => {
    return ['VAR', 'REG'].includes(op)
  }

  codes.forEach((code: string[], i: number): void => {
    const operator = code[0]
    if (I[operator] === I.MOV) {
      const dst = code[1]
      const value = code[2]
      if (dst === value) {
        codes[i] = null
        return
      }
      if (isReg(value) && isInCandidates(value)) {
        const candidate = candidates.get(value)!
        candidate.usages.push({
          codeIndex: i,
          position: 2,
        })
      }
      if (!isReg(dst)) { return }
      if (isInCandidates(dst)) {
        processReg(dst)
      }
      if (isReg(value)) { return }
      candidates.set(dst, {
        codeIndex: i,
        operator,
        value,
        valueType: getValueType(value),
        usages: [],
      })
    } else {
      code.forEach((operant: string, j: number): void => {
        if (j === 0) { return }
        if (isIgnoreOperator(operator)) { return }
        if (!isReg(operant)) { return }
        let useType
        let isGetOperant
        try {
          useType = codeToUseAge[I[operator]][j - 1]
          isGetOperant = useType === OU.GET
        } catch(e) {
          console.log('ERROR operator --> ', operator)
          throw new Error(e)
        }
        if (!isInCandidates(operant)) { return }
        if (isGetOperant) {
          const candidate = candidates.get(operant)!
          candidate.usages.push({
            codeIndex: i,
            position: j,
          })
        } else {
          if (useType === OU.SET) {
            processReg(operant)
          }
          candidates.delete(operant)
        }
      })
    }
  })

  // for (const [reg] of candidates.entries()) {
  //   processReg(reg)
  // }

  return codes
}
