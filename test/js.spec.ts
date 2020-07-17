import { createVMFromJavaScript } from '../src/js'
import { expect } from 'chai'

const t = (codes: string, cb?: () => void): void => {
  const vm = createVMFromJavaScript(codes, { expect, cb })
  vm.run()
}

describe("uinary operators", (): void => {
  it('+a', (): void => {
    t(`
    const main = () => {
      const a = '-1000'
      expect(+a).equal(-1000)
    }
    `)
  })
  it('-a', (): void => {
    t(`
    const main = () => {
      const a = 1
      expect(-a).equal(-1)
    }
    `)
  })
})

describe("binary operators", (): void => {
  it("a + b", (): void => {
    t(`
      const main = () => {
        const a = 1
        const b = 2
        expect(a + b).equal(3)
      }
    `)
  })

  it("a - b", (): void => {
    t(`
      const main = () => {
        const a = 1
        const b = 2
        expect(a - b).equal(-1)
      }
    `)
  })

  it("a * b", (): void => {
    t(`
      const main = () => {
        const a = 5
        const b = 5
        expect(a * b).equal(25)
      }
    `)
  })
})
