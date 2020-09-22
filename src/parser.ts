const fs = require('fs')

export const parseCode = (cd: string): string[][] => {
  const code = cd.trim()
  let operants: string[] = []
  let i = 0
  let val = ""
  let isInString = false
  let oldStringStart: string = ''
  const codes: string[][] = []

  while (i < code.length) {
    const c = code[i++]
    if ((c === '"' || c === "'") && !isInString) {
      oldStringStart = c
      isInString = true
      val = c
      continue
    }

    if (isInString) {
      if (c === oldStringStart) {
        val += c
        operants.push(val)
        isInString = false
        val = ''
      } else {
        val += c
      }
      continue
    }

    if (c === ';' || c === ':') {
      if (val !== "") {
        operants.push(val)
        val = ""
      }
      if (operants.length > 0) {
        codes.push(operants)
      }
      operants = []
      continue
    }

    if (c.match(/\s/)) {
      if (val.length === 0) {
        continue
      } else {
        if (val !== "") {
          operants.push(val)
        }
        val = ""
        continue
      }
    }

    val += c
  }

  if (operants.length > 0) {
    codes.push(operants)
  }

  return codes
}

export interface IParsedFunction {
  instructions: string[][],
  params: string[],
  functionName: string,
}

const enum TokenizingState {
  INIT,
  FUNCTION_NAME,
  PARAMING,
  PARAMING_ENCLOSING,
  FUNCTION_BODY,
}

export const parseAssembler = (code: string): IParsedFunction[] => {
  code = code.trim()
  let operants: string[] = []

  let i = 0
  let val = ""
  let isInString = false
  const isInFunction = false
  let oldStringStart: string = ''

  let codes: string[][] = []
  const funcs: IParsedFunction[] = []
  let token = ''
  const oldToken = ''
  let tokenizingState: TokenizingState = TokenizingState.INIT
  let currentFunctionInfo: IParsedFunction | null = null
  const NO_SET_FUNCTION_INFO_ERROR = 'current function info is not set.'

  const isEmpyty = (c: string): boolean => /\s/.test(c)
  let j = 0
  let k = 0
  let isEscape = false

  while (i < code.length) {
    // console.log(tokenizingState, '===>', i, code[i])
    const c = code[i++]

    if (tokenizingState === TokenizingState.INIT) {
      if (isEmpyty(c)) {
        if (!token) { continue }
        if (token !== 'func') {
          throw new Error('INIT Unexpected token ' + token)
        }
        token = ''
        tokenizingState = TokenizingState.FUNCTION_NAME
        k++
        // console.log(k, 'coount ')
        currentFunctionInfo = { functionName: '', params: [], instructions: [] }
        codes = currentFunctionInfo.instructions
      } else {
        token += c
      }
      continue
    }

    if (tokenizingState === TokenizingState.FUNCTION_NAME) {
      if (isEmpyty(c)) { continue }
      if (c === '(') {
        if (!token) {
          throw new Error('Function should have function name')
        } else {
          if (!currentFunctionInfo) { throw new Error(NO_SET_FUNCTION_INFO_ERROR) }
          currentFunctionInfo.functionName = token
          token = ''
          tokenizingState = TokenizingState.PARAMING
          // console.log(tokenizingState, currentFunctionInfo)
        }
      } else {
        token += c
      }
      continue
    }

    if (tokenizingState === TokenizingState.PARAMING) {
      if (isEmpyty(c)) { continue }
      if (c === ',' || c === ')') {
        if (!currentFunctionInfo) { throw new Error(NO_SET_FUNCTION_INFO_ERROR) }
        if (c === ',' && !token) {
          throw new Error('parameter name should not be empty')
        }
        if (token) {
          currentFunctionInfo.params.push(token)
        }
        token = ''
        if (c === ')') {
          tokenizingState = TokenizingState.PARAMING_ENCLOSING
          // console.log('--- paraming..', tokenizingState, currentFunctionInfo)
        }
      } else {
        token += c
      }
      continue
    }

    if (tokenizingState === TokenizingState.PARAMING_ENCLOSING) {
      if (isEmpyty(c)) { continue }
      if (c === '{') {
        tokenizingState = TokenizingState.FUNCTION_BODY
      } else {
        throw new Error("PARAMING_ENCLOSING Unexpected token " + c)
      }
      continue
    }

    // console.log("bodyig --> ", isInString, tokenizingState)

    if ((c === '"' || c === "'") && !isInString) {
      oldStringStart = c
      isInString = true
      val = c
      continue
    }

    if (isInString) {
      if (c === '\\') {
        if (isEscape) {
          isEscape = false
        } else {
          isEscape = true
          val += c
        }
        continue
      }

      if (c === '"' && isEscape) {
        // console.log('--->', val)
        val = val.substring(0, val.length - 1) + '"'
        isEscape = false
        continue
      }

      if (c === oldStringStart) {
        val += c
        operants.push(val)
        // console.log("<-----", val)
        isInString = false
        val = ''
      } else {
        val += c
      }
      isEscape = false
      continue
    }

    if (c === ';' || c === ':') {
      if (val !== "") {
        operants.push(val)
        val = ""
      }
      if (operants.length > 0) {
        codes.push(operants)
      }
      operants = []
      continue
    }

    if (c.match(/\s/)) {
      if (val.length === 0) {
        continue
      } else {
        if (val !== "") {
          operants.push(val)
        }
        val = ""
        continue
      }
    }

    if (c === '}') {
      j++
      if (operants.length > 0) {
        codes.push(operants)
      }
      if (!currentFunctionInfo) { throw new Error(NO_SET_FUNCTION_INFO_ERROR) }
      funcs.push(currentFunctionInfo)
      tokenizingState = TokenizingState.INIT
      currentFunctionInfo = null
      // console.log('functions ====>', funcs)
      continue
    }

    // console.log(operants)
    val += c
  }

  return funcs
}

const test = (): void => {
  const c = fs.readFileSync(__dirname + "/../example/js.nes", 'utf-8')
  const funcs = parseAssembler(c)
  funcs.forEach((f: IParsedFunction): void => {
    console.log(f, '-->')
  })
}

// test()
// console.log(parseCode(`PUSH "DIE WORLD"`))
// console.log(parseCode(`PUSH "HELLO WORLD"`))
// console.log(parseCode('MOV R0 1'))
// console.log(parseCode(testProgram))
