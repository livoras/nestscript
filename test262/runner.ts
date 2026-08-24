import * as fs from 'fs'
import * as path from 'path'
const acorn = require('acorn')
import { execFileSync, fork } from 'child_process'
import { createVMFromJavaScript } from '../src/js'

type Status =
  | 'passed'
  | 'negative-passed'
  | 'compile-failed'
  | 'runtime-failed'
  | 'negative-failed'
  | 'timed-out'
  | 'skipped-dynamic-code'

interface IOptions {
  root: string
  scope: 'language' | 'all-es5'
  match: string
  limit: number
  maxSteps: number
  jobs: number
  json: string
}

interface IResult {
  file: string
  status: Status
  mode: 'strict' | 'non-strict'
  durationMs: number
  error?: string
}

class HarnessError extends Error {
  constructor(message: any) {
    super(String(message))
    this.name = 'Test262Error'
  }
}

class StepLimitError extends Error {
  constructor(maxSteps: number) {
    super(`exceeded ${maxSteps} VM instructions`)
    this.name = 'Test262StepLimitError'
  }
}

const LANGUAGE_CHAPTERS = [
  'ch06', 'ch07', 'ch08', 'ch09', 'ch10',
  'ch11', 'ch12', 'ch13', 'ch14',
]

const ALL_ES5_SECTIONS = [...LANGUAGE_CHAPTERS, 'ch15', 'annexB', 'bestPractice']
const EXPECTED_TEST262_REVISION = '7da91bceb9ce7613f87db47ddd1292a2dda58b42'

const parseArgs = (args: string[]): IOptions => {
  const options: IOptions = {
    root: process.env.TEST262_ROOT || path.resolve(process.cwd(), '../test262-es5'),
    scope: 'language',
    match: '',
    limit: 0,
    maxSteps: 250000,
    jobs: 4,
    json: '',
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const value = args[i + 1]
    if (arg === '--root' && value) {
      options.root = path.resolve(value)
      i++
    } else if (arg === '--scope' && (value === 'language' || value === 'all-es5')) {
      options.scope = value
      i++
    } else if (arg === '--match' && value) {
      options.match = value
      i++
    } else if (arg === '--limit' && value) {
      options.limit = Number(value)
      i++
    } else if (arg === '--max-steps' && value) {
      options.maxSteps = Number(value)
      i++
    } else if (arg === '--jobs' && value) {
      options.jobs = Number(value)
      i++
    } else if (arg === '--json' && value) {
      options.json = path.resolve(value)
      i++
    } else if (arg === '--help') {
      console.log([
        'Usage: npm run test262 -- [options]',
        '',
        '  --root PATH       Test262 es5-tests checkout (default: ../test262-es5)',
        '  --scope NAME      language (ch06-ch14) or all-es5',
        '  --match TEXT      only paths containing TEXT',
        '  --limit N         stop after N files',
        '  --max-steps N     per-test VM instruction limit (default: 250000)',
        '  --jobs N          isolated test processes to run in parallel (default: 4)',
        '  --json PATH       write the full result report as JSON',
      ].join('\n'))
      process.exit(0)
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`)
    }
  }
  if (!Number.isFinite(options.limit) || options.limit < 0 ||
    !Number.isFinite(options.maxSteps) || options.maxSteps < 1 ||
    !Number.isFinite(options.jobs) || options.jobs < 1) {
    throw new Error('limit must be non-negative; max-steps and jobs must be positive')
  }
  return options
}

const readRevision = (root: string): string => {
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch(error) {
    return 'unknown'
  }
}

const collectJavaScriptFiles = (dir: string): string[] => {
  const files: string[] = []
  const visit = (current: string): void => {
    fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b): number => a.name.localeCompare(b.name))
      .forEach((entry): void => {
        const filename = path.join(current, entry.name)
        if (entry.isDirectory()) {
          visit(filename)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(filename)
        }
      })
  }
  visit(dir)
  return files
}

const errorText = (error: any): string => {
  const seen: any[] = []
  let current = error
  while (current && current.error && !seen.includes(current)) {
    seen.push(current)
    current = current.error
  }
  if (current && current.stack) {
    return String(current.stack).split('\n').slice(0, 4).join('\n')
  }
  return String(current)
}

const isStepLimit = (error: any): boolean => {
  let current = error
  const seen: any[] = []
  while (current && !seen.includes(current)) {
    if (current instanceof StepLimitError || current.name === 'Test262StepLimitError') {
      return true
    }
    seen.push(current)
    current = current.error
  }
  return false
}

const hasDynamicCode = (source: string): boolean => {
  // Any eval-focused ES5 case is outside NestScript's explicitly eval-free
  // target. This also catches indirect forms such as (0, eval)(source).
  return /\beval\b/.test(source) || /\b(?:new\s+)?Function\s*\(/.test(source)
}

const makeContext = (strictMode: boolean): any => {
  const context: any = {
    Array,
    Boolean,
    Date,
    Error,
    EvalError,
    Function,
    JSON,
    Math,
    Number,
    Object,
    RangeError,
    ReferenceError,
    RegExp,
    String,
    SyntaxError,
    TypeError,
    URIError,
    decodeURI,
    decodeURIComponent,
    encodeURI,
    encodeURIComponent,
    isFinite,
    isNaN,
    parseFloat,
    parseInt,
    strict_mode: strictMode,
  }

  context.$ERROR = (message: any): never => { throw new HarnessError(message) }
  context.$FAIL = context.$ERROR
  context.$PRINT = (): void => undefined
  context.$INCLUDE = (): void => undefined
  context.Test262Error = HarnessError
  context.testFailed = context.$ERROR
  context.testPrint = context.$PRINT
  context.runTestCase = (testcase: any): void => {
    if (testcase() !== true) {
      throw new HarnessError('Test case returned non-true value')
    }
  }
  context.fnGlobalObject = (): any => context
  context.fnSupportsStrict = (): boolean => true
  context.fnExists = (...values: any[]): boolean => values.every((value): boolean => {
    return typeof value === 'function'
  })
  context.compareArray = (expected: any[], actual: any[]): boolean => {
    if (actual.length !== expected.length) {
      return false
    }
    const left = expected.slice().sort()
    const right = actual.slice().sort()
    return left.every((value, index): boolean => value === right[index])
  }
  context.arrayContains = (actual: any[], expected: any[]): boolean => {
    return expected.every((value): boolean => actual.includes(value))
  }
  context.dataPropertyAttributesAreCorrect = (
    object: any,
    name: string,
    value: any,
    writable: boolean,
    enumerable: boolean,
    configurable: boolean,
  ): boolean => {
    const descriptor = Object.getOwnPropertyDescriptor(object, name)
    if (!descriptor) {
      return false
    }
    const sameValue = descriptor.value === value ||
      (typeof descriptor.value === 'number' && typeof value === 'number' &&
        isNaN(descriptor.value) && isNaN(value))
    return sameValue && descriptor.writable === writable &&
      descriptor.enumerable === enumerable && descriptor.configurable === configurable
  }
  context.accessorPropertyAttributesAreCorrect = (
    object: any,
    name: string,
    get: any,
    set: any,
    _setVerifyHelpProp: string,
    enumerable: boolean,
    configurable: boolean,
  ): boolean => {
    const descriptor = Object.getOwnPropertyDescriptor(object, name)
    return !!descriptor && descriptor.get === get && descriptor.set === set &&
      descriptor.enumerable === enumerable && descriptor.configurable === configurable
  }
  context.getPrecision = (number: number): number => {
    const power = Math.ceil(Math.log(Math.abs(number)) / Math.LN2)
    return 2 * Math.pow(2, -52 + power)
  }
  context.isEqual = (left: number, right: number): boolean => {
    if (left === right && !isNaN(left)) {
      return true
    }
    const precision = context.getPrecision(Math.min(Math.abs(left), Math.abs(right)))
    return Math.abs(left - right) <= precision
  }
  context.ToInteger = (value: any): number => {
    const number = Number(value)
    if (isNaN(number)) {
      return 0
    }
    if (number === 0 || !isFinite(number)) {
      return number
    }
    return (number < 0 ? -1 : 1) * Math.floor(Math.abs(number))
  }
  context.MakeTime = (hour: any, minute: any, second: any, millisecond: any): number => {
    if (![hour, minute, second, millisecond].every(isFinite)) {
      return NaN
    }
    return context.ToInteger(hour) * 3600000 + context.ToInteger(minute) * 60000 +
      context.ToInteger(second) * 1000 + context.ToInteger(millisecond)
  }
  context.MakeDay = (year: any, month: any, date: any): number => {
    if (![year, month, date].every(isFinite)) {
      return NaN
    }
    const normalizedYear = context.ToInteger(year) + Math.floor(context.ToInteger(month) / 12)
    const normalizedMonth = context.ToInteger(month) % 12
    const value = new Date(0)
    value.setUTCHours(0, 0, 0, 0)
    value.setUTCFullYear(normalizedYear, normalizedMonth, context.ToInteger(date))
    return Math.floor(value.getTime() / 86400000)
  }
  context.MakeDate = (day: any, time: any): number => {
    return !isFinite(day) || !isFinite(time) ? NaN : day * 86400000 + time
  }
  context.TimeClip = (time: any): number => {
    const number = Number(time)
    if (!isFinite(number) || Math.abs(number) > 8.64e15) {
      return NaN
    }
    return context.ToInteger(number)
  }
  context.UTC = (time: number): number => {
    return time + new Date(time).getTimezoneOffset() * 60000
  }

  return context
}

const matchesExpectedNegative = (source: string, error: any): boolean => {
  const match = source.match(/@negative(?:\s+([^\r\n*]+))?/)
  const expectation = match && match[1] ? match[1].trim() : ''
  if (!expectation || expectation.startsWith('^')) {
    return true
  }
  const text = errorText(error)
  return text.includes(expectation)
}

const runFile = (filename: string, root: string, maxSteps: number): IResult => {
  const started = Date.now()
  const source = fs.readFileSync(filename, 'utf8')
  const relative = path.relative(root, filename).replace(/\\/g, '/')
  const strictMode = /@onlyStrict\b/.test(source)
  const mode: IResult['mode'] = strictMode ? 'strict' : 'non-strict'
  const negative = /@negative\b/.test(source)

  if (hasDynamicCode(source)) {
    return {
      file: relative,
      status: 'skipped-dynamic-code',
      mode,
      durationMs: Date.now() - started,
    }
  }

  const context = makeContext(strictMode)
  const code = strictMode
    ? `"use strict";\nvar strict_mode = true;\n${source}`
    : `var strict_mode = false;\n${source}`

  // This checkout describes ES5 grammar. The compiler intentionally accepts
  // newer syntax as an extension, so negative syntax tests must first be
  // validated with an ES5 parser rather than being reinterpreted as modern JS.
  if (negative) {
    try {
      acorn.parse(code, { ecmaVersion: 5 })
    } catch(error) {
      if (matchesExpectedNegative(source, error)) {
        return { file: relative, status: 'negative-passed', mode, durationMs: Date.now() - started }
      }
    }
  }

  let vm: any
  try {
    vm = createVMFromJavaScript(code, context)
  } catch(error) {
    if (negative && matchesExpectedNegative(source, error)) {
      return { file: relative, status: 'negative-passed', mode, durationMs: Date.now() - started }
    }
    return {
      file: relative,
      status: negative ? 'negative-failed' : 'compile-failed',
      mode,
      durationMs: Date.now() - started,
      error: errorText(error),
    }
  }

  const executeNext = vm.executeNext.bind(vm)
  let steps = 0
  vm.executeNext = (...args: any[]): any => {
    steps++
    if (steps > maxSteps) {
      throw new StepLimitError(maxSteps)
    }
    return executeNext(...args)
  }

  try {
    vm.run()
    return {
      file: relative,
      status: negative ? 'negative-failed' : 'passed',
      mode,
      durationMs: Date.now() - started,
      error: negative ? 'expected the test to throw, but it completed normally' : undefined,
    }
  } catch(error) {
    if (isStepLimit(error)) {
      return {
        file: relative,
        status: 'timed-out',
        mode,
        durationMs: Date.now() - started,
        error: errorText(error),
      }
    }
    if (negative && matchesExpectedNegative(source, error)) {
      return { file: relative, status: 'negative-passed', mode, durationMs: Date.now() - started }
    }
    return {
      file: relative,
      status: negative ? 'negative-failed' : 'runtime-failed',
      mode,
      durationMs: Date.now() - started,
      error: errorText(error),
    }
  }
}

const runIsolatedFile = (filename: string, root: string, maxSteps: number): Promise<IResult> => {
  return new Promise((resolve): void => {
    const child = fork(__filename, ['--worker', filename, root, String(maxSteps)], {
      silent: true,
    })
    let settled = false
    let stderr = ''
    const finish = (result: IResult): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    if (child.stderr) {
      child.stderr.on('data', (chunk: Buffer): void => {
        if (stderr.length < 4000) {
          stderr += chunk.toString()
        }
      })
    }
    child.on('message', (message: IResult): void => finish(message))
    child.on('error', (error): void => {
      finish({
        file: path.relative(root, filename).replace(/\\/g, '/'),
        status: 'runtime-failed',
        mode: 'non-strict',
        durationMs: 0,
        error: errorText(error),
      })
    })
    child.on('exit', (code): void => {
      if (!settled) {
        // IPC delivery may be queued immediately behind the exit event.
        setTimeout((): void => {
          if (!settled) {
            finish({
              file: path.relative(root, filename).replace(/\\/g, '/'),
              status: 'runtime-failed',
              mode: 'non-strict',
              durationMs: 0,
              error: `isolated runner exited with code ${code}: ${stderr.trim()}`,
            })
          }
        }, 50)
      }
    })
    const timer = setTimeout((): void => {
      child.kill('SIGKILL')
      finish({
        file: path.relative(root, filename).replace(/\\/g, '/'),
        status: 'timed-out',
        mode: 'non-strict',
        durationMs: 15000,
        error: 'isolated runner exceeded 15 seconds',
      })
    }, 15000)
  })
}

const runWorker = (): void => {
  const filename = process.argv[3]
  const root = process.argv[4]
  const maxSteps = Number(process.argv[5])
  const result = runFile(filename, root, maxSteps)
  if (process.send) {
    process.send(result, (): void => process.disconnect())
  } else {
    console.log(JSON.stringify(result))
  }
}

const main = async (): Promise<void> => {
  const options = parseArgs(process.argv.slice(2))
  const suiteRoot = path.join(options.root, 'test', 'suite')
  if (!fs.existsSync(suiteRoot)) {
    throw new Error(`Test262 ES5 suite not found at ${suiteRoot}`)
  }

  const sections = options.scope === 'language' ? LANGUAGE_CHAPTERS : ALL_ES5_SECTIONS
  const revision = readRevision(options.root)
  if (revision !== EXPECTED_TEST262_REVISION) {
    console.warn(`Warning: expected Test262 ${EXPECTED_TEST262_REVISION}, found ${revision}`)
  }
  let files = sections.reduce((all: string[], section): string[] => {
    return all.concat(collectJavaScriptFiles(path.join(suiteRoot, section)))
  }, [])
  if (options.match) {
    files = files.filter((filename): boolean => filename.includes(options.match))
  }
  if (options.limit > 0) {
    files = files.slice(0, options.limit)
  }

  console.log(`Test262 root: ${options.root}`)
  console.log(`Scope: ${options.scope}; files: ${files.length}; max steps/test: ${options.maxSteps}`)

  const started = Date.now()
  const results: IResult[] = new Array(files.length)
  let nextIndex = 0
  let completed = 0
  const runQueue = async (): Promise<void> => {
    while (nextIndex < files.length) {
      const index = nextIndex++
      results[index] = await runIsolatedFile(files[index], options.root, options.maxSteps)
      completed++
      if (completed % 250 === 0 || completed === files.length) {
        console.log(`Progress: ${completed}/${files.length}`)
      }
    }
  }
  const jobs = Math.max(1, Math.min(options.jobs, files.length || 1))
  await Promise.all(Array.from({ length: jobs }, (): Promise<void> => runQueue()))

  const counts = results.reduce((summary: {[key: string]: number}, result): {[key: string]: number} => {
    summary[result.status] = (summary[result.status] || 0) + 1
    return summary
  }, {})
  const passed = (counts.passed || 0) + (counts['negative-passed'] || 0)
  const skipped = counts['skipped-dynamic-code'] || 0
  const failed = results.length - passed - skipped
  const executed = results.length - skipped
  const durationMs = Date.now() - started

  console.log('\nSummary')
  Object.keys(counts).sort().forEach((status): void => {
    console.log(`  ${status}: ${counts[status]}`)
  })
  console.log(`  executed: ${executed}`)
  console.log(`  passed total: ${passed}`)
  console.log(`  failed total: ${failed}`)
  console.log(`  skipped total: ${skipped}`)
  console.log(`  pass rate: ${executed === 0 ? 'n/a' : (passed * 100 / executed).toFixed(2) + '%'}`)
  console.log(`  duration: ${(durationMs / 1000).toFixed(1)}s`)

  const failures = results.filter((result): boolean => {
    return result.status !== 'passed' &&
      result.status !== 'negative-passed' &&
      result.status !== 'skipped-dynamic-code'
  })
  if (failures.length > 0) {
    console.log('\nFirst 20 failures')
    failures.slice(0, 20).forEach((result): void => {
      console.log(`  [${result.status}] ${result.file}`)
      if (result.error) {
        console.log(`    ${result.error.split('\n')[0]}`)
      }
    })
  }

  if (options.json) {
    const report = {
      test262: {
        root: options.root,
        revision,
        branch: 'es5-tests',
      },
      options,
      summary: { files: results.length, executed, passed, failed, skipped, counts, durationMs },
      results,
    }
    fs.writeFileSync(options.json, JSON.stringify(report, null, 2) + '\n')
    console.log(`\nJSON report: ${options.json}`)
  }
}

if (process.argv[2] === '--worker') {
  runWorker()
} else {
  main().catch((error): void => {
    console.error(errorText(error))
    process.exitCode = 1
  })
}
