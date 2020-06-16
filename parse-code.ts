import { IOperant, IOperatantType, I } from "./vm"

const parseCode = (
  cd: string,
  symbols: { [x in string]: number },
  functionTabls: { [x in string]: { index: number } },
// tslint:disable-next-line: no-big-function
): [I, IOperant[]] => {
  const code = cd.trim()
  const operants: IOperant[] = []
  let i = 0
  let val = ""
  let isInString = false
  let oldStringStart: string = ''
  let operator: I = -1

  while (i < code.length) {
    const c = code[i++]
    if ((c === '"' || c === "'") && !isInString) {
      oldStringStart = c
      isInString = true
      val = ""
      continue
    }

    if (isInString && c === oldStringStart) {
      operants.push({ type: IOperatantType.STRING, value: val })
      val = ""
      continue
    }

    if (c !== ' ') {
      val += c
      continue
    }

    if (val === '') {
      continue
    }

    if (operator === -1) {
      operator = I[val]
      val = ''
      continue
    }

    if (symbols[val] !== undefined) {
      operants.push({ type: IOperatantType.REGISTER, value: symbols[val] })
      continue
    }

    if (val === '$RET') {
      operants.push({ type: IOperatantType.RETURN_VALUE, value: 0 })
      continue
    }

    if (operator === I.CALL) {
      if (operants.length === 0) {
        operants.push({ type: IOperatantType.FUNCTION_INDEX, value: functionTabls[val].index })
      } else {
        operants.push({ type: IOperatantType.ARG_COUNT, value: +val })
      }
      continue
    }

    operants.push({ type: IOperatantType.NUMBER, value: +val })
  }

  return [operator, operants]
}
