import { Certificate, createDecipher } from 'crypto'
import { parseCode } from './parser'
import { I } from './vm'

export const optimizeCode = (code: string): string => {
  return (code.trim().match(/func[\s\S]+?\}/g) || [])
    .map(optimizeFunction)
    .join('\n')
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
const codeToUseAge: { [x in I]: OU[] } = {
  [I.MOV]: BOTH_GET,
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
  [I.MOV_PROP]: [],
  [I.SET_CTX]: [],
  [I.NEW_OBJ]: [],
  [I.NEW_ARR]: [],
  [I.SET_KEY]: [],
  [I.FUNC]: [],
  [I.ALLOC]: [],
  [I.PLUS]: [],
  [I.MINUS]: [],
  [I.NOT]: [],
  [I.VOID]: [],
  [I.DEL]: [],
  [I.NEG]: [],
  [I.INST_OF]: [],
  [I.MOV_THIS]: [],
}

const optimizeFunction = (code: string): string => {
  code = code.trim()
  const cap = code.match(/^(func[\s\S]+?\{)([\s\S]+?)\}$/)
  const head = cap![1]
  const codes = parseCode(cap![2])
  // console.log(codes)
  // // console.log(cap![1])
  // // console.log(cap![2])
  // // console.log(cap![2])
  return code
}
