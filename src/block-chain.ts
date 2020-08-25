import { VariableType } from './codegen'

interface IBlock {
  variables: Map<string, any>
  closures: Map<string, any>
}

interface IFuncBlock extends IBlock {
  params: Map<string, any>
}

export class BlockChain {
  public closureCounter: number = 0

  constructor(
    public chain: (IBlock | IFuncBlock)[],
    public currentFuncBlock?: IFuncBlock,
  ) {
    if (this.chain.length === 0) {
      this.closureCounter = 0
    }
  }

  public newBlock(): BlockChain {
    const block = { variables: new Map<string, any>(), closures: new Map<string, any>() }
    return new BlockChain([ ...this.chain, block], this.currentFuncBlock)
  }

  public newFuncBlock(params: Map<string, any>): BlockChain {
    const funcBlock = { variables: new Map<string, any>(), closures: new Map<string, any>(), params }
    return new BlockChain([...this.chain, funcBlock], funcBlock)
  }

  public accessName(name: string): void {
    let i = this.chain.length
    while (i-- > 0) {
      const block = this.chain[i]

      if (i === this.chain.length - 1) {
        if (block.variables.has(name)) {
          return
        }
        if (this.isFuncBlock(block) && block.params.has(name)) {
          return
        }
      }

      const makeClosure = (n: string): void => {
        block.closures.set(n, `@c${this.closureCounter++}`)
      }

      if (block.variables.has(name)) {
        block.variables.set(name, VariableType.CLOSURE)
        makeClosure(name)
        return
      }

      if (this.isFuncBlock(block) && block.params.has(name)) {
        block.params.set(name, VariableType.CLOSURE)
        makeClosure(name)
        return
      }
    }
  }

  public isFuncBlock(block: IFuncBlock | IBlock): block is IFuncBlock {
    return !!(block as IFuncBlock).params
  }

  public newName(name: string, kind: 'var' | 'const' | 'let'): void {
    const block = this.chain.length === 1
      ? this.chain[0]
      : kind === 'var'
        ? this.currentFuncBlock
        : this.chain[this.chain.length - 1]

    block?.variables.set(name, VariableType.VARIABLE)
  }

  public getName(name: string): string {
    let i = this.chain.length
    while (i-- > 0) {
      const block = this.chain[i]
      let varType = block.variables.get(name)
      if (!varType && this.isFuncBlock(block)) {
        varType = block.params.get(name)
      }
      if (!varType) { continue }
      if (varType === VariableType.VARIABLE) {
        return name
      }
      if (varType === VariableType.CLOSURE) {
        return block.closures.get(name)
      }
    }
    return ''
  }
}
