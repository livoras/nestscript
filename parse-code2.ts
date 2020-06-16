export const parseCode = (cd: string): string[] => {
  const code = cd.trim()
  const operants: string[] = []
  let i = 0
  let val = ""
  let isInString = false
  let oldStringStart: string = ''

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

    if (c !== ' ') {
      val += c
      continue
    }

    if (val === '') {
      continue
    }

    operants.push(val)
    val = ""
  }

  if (val !== '') {
    operants.push(val)
  }

  return operants
}

// console.log(parseCode(`PUSH "DIE WORLD"`))
// console.log(parseCode(`PUSH "HELLO WORLD"`))
// console.log(parseCode('MOV R0 1'))
// console.log(parseCode('CALL name 1'))
