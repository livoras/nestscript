import { tm } from './utils'

describe('compile and running third part libraries', (): void => {
  const fs = require('fs')

  const read = (filename: string): string => {
    return fs.readFileSync(__dirname + '/textures/' + filename, 'utf-8')
  }

  const readAndRun = (filename: string): void => {
    const content = read(filename)
    tm(content, {})
  }

  it('moment.js', (): void => {
    readAndRun('moment.js')
  })

  it('moment.min.js', (): void => {
    readAndRun('moment.min.js')
  })

  it('lodash.js', (): void => {
    readAndRun('lodash.js')
  })

  it('lodash.min.js', (): void => {
    readAndRun('lodash.min.js')
  })
})
