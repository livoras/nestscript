import { createVMFromArrayBuffer } from "../src/vm"
import { createVMFromJavaScript } from '../src/js'
import { expect } from 'chai'

describe("a + b", (): void => {
  it("OK", (): void => {
    const t = (r: number): void => {
      expect(r).equal(3)
    }
    const vm = createVMFromJavaScript(`
      const main = () => {
        const a = 1
        const b = 2
        t(a + b)
      }
    `, { t })
    vm.run()
  })
})
