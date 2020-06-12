import * as ts from "typescript"

export const exec = (source: string , that?: any, context?: any, callback?: (ret: any) => void): void => {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  console.log(result)
}

enum i {
  RET,
  PUSH,
  ADD,
  GET,
  SUB,
  JUMP,
  CALL,
}

/**
 *
 * @param commandSource
 * @param that
 */
const testProgram = `
func main():
  PUSH 1;
  PUSH 5;
  ADD;
  PUSH 3;
  CALL sub 2;
  RET;
end

func sub(a, b):
  GET a;
  GET b;
  SUB;
  RET;
end
`

class Program {
  constructor(public globals: any, public instructions: any[]) {

  }
}

const parseCodeToProgram = (program: string): Program => {
  const ins: any[] = []
  const funcsTable = {}
  const symbols = {}
  const funcs = program
    .trim()
    .match(/func[\s\S]+?end/g) || []

  funcs.forEach((func: string): void => {
    if (!func) { return }
    const [funcName, args, body] = parseFunction(func)
    funcsTable[funcName] = {
      ip: ins.length,
      args,
    }
    body.forEach((stat: string): void => {
      ins.push(...parseInstruction(stat))
    })
  })

  return new Program({ ...funcsTable }, ins)
}

const parseFunction = (func: string): [string, string[], string[]] => {
  const caps = func.match(/func\s+(\w[\w\d_]+)\s*?\(([\s\S]*)\)\:([\s\S]+?)\nend/)
  const funcName = caps![1]
  const args = caps![2]
    .split(/\s*,\s*/g)
    .filter((s: string): boolean => !!s)
  const body = caps![3]
    .trim()
    .split(';')
    .map((s: string): string => s.trim())
    .filter((s: string): boolean => !!s)
  return [funcName, args, body]
}

const parseInstruction = (stat: string): any[] => {
  const ins: any[] = []
  const cmds = stat.split(/\s+/g)
  const cmd = cmds.shift()
  const cmdEnum = i[cmd as string]
  if (cmdEnum === undefined) {
    throw new Error('Unknow command ' + cmd)
  }
  ins.push(cmdEnum)
  ins.push(...cmds)
  return ins
}

const pg = parseCodeToProgram(testProgram)
console.log(pg)

// /**
//  * PUSH 1
//  * PUSH 2
//  * ADD
//  *
//  * CALL_WITH obj_name func_name var1 var2 var3
//  */
// export const execCommand = (commandSource: string, that?: any): void => {
//   const stack = []
//   const ip = 0
//   const sp = 0
//   while (ip < commandSource.)
// }
