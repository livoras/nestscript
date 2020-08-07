const testProgram = `
  GLOBAL G1;
  GLOBAL G2;

  VAR R0;
  PUSH 2;
  PUSH 2;
  CALL foo 2;
  PRINT "======================";
  PRINT $RET;
  PRINT "+++++++++++++++++++++++";
  PUSH 'WORLD';
  PUSH "HELLO ";
  PRINT "HELLO WORL";
  CALL tow 2;
LABEL con1:
  MOV R0 $RET;
  PRINT R0;
  PRINT G1;
`

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

interface IParsedFunction {
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

  while (i < code.length) {
    const c = code[i++]

    if (tokenizingState === TokenizingState.INIT) {
      if (isEmpyty(c)) {
        if (!token) { continue }
        if (token !== 'func') {
          throw new Error('Unexpected token ' + token)
        }
        token = ''
        tokenizingState = TokenizingState.FUNCTION_NAME
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
        }
      } else {
        token += c
      }
      continue
    }

    if (tokenizingState === TokenizingState.PARAMING) {
      if (isEmpyty(c)) { continue }
      if (c === ',' || c === ')') {
        if (!token) { throw new Error('parameter name should not be empty') }
        if (!currentFunctionInfo) { throw new Error(NO_SET_FUNCTION_INFO_ERROR) }
        currentFunctionInfo.params.push(token)
        token = ''
        if (c === ')') {
          tokenizingState = TokenizingState.PARAMING_ENCLOSING
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
        throw new Error("Unexpected token " + c)
      }
      continue
    }

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

    if (c === '}') {
      if (operants.length > 0) {
        codes.push(operants)
      }
      if (!currentFunctionInfo) { throw new Error(NO_SET_FUNCTION_INFO_ERROR) }
      funcs.push(currentFunctionInfo)
      tokenizingState = TokenizingState.INIT
      continue
    }

    val += c
  }

  return funcs
}

const test = (): void => {
  const funcs = parseAssembler(`
  func @@main(a, b, c) {
    MOV a b;
    PUSH "OBJK";
    MOV %r0 "func @main(a, b, c) {}";
  }

  func @@f1(c, d, e) {
    PUSH a;
    PUSH c;
    JMP "OJBK" %r0;
  }
  `)
  funcs.forEach((f: IParsedFunction): void => {
    console.log(f, '-->')
  })
}

test()

// console.log(parseCode(`PUSH "DIE WORLD"`))
// console.log(parseCode(`PUSH "HELLO WORLD"`))
// console.log(parseCode('MOV R0 1'))
// console.log(parseCode(testProgram))
