export class Scope {
  constructor(
    public scope: any = {},
    public heap: any[] = [],
    public isRestoreWhenChange: boolean = true) {
  }

  public front(): void {
    this.scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope)
  }

  public back(): void {
    if (this.isRestoreWhenChange) {
      const len = this.scope.len
      this.heap.splice(len)
    }
    this.scope = Object.getPrototypeOf(this.scope)
  }

  public fork(): Scope {
    const scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope)
    return new Scope(scope, this.heap, this.isRestoreWhenChange)
  }

  public new(key: any): void {
    const index = this.heap.length
    this.scope[key] = index
    this.heap.push(void 0)
    // console.log('pushing .....', this.heap)
  }

  public set(key: any, value: any): void {
    if (!(key in this.scope)) {
      throw new Error('variable is used before decleration')
    }
    const index = this.scope[key]
    this.heap[index] = value
  }

  public get(key: any): any {
    const index = this.scope[key]
    return this.heap[index]
  }

  public printScope(): string {
    let scope = this.scope
    const scopes = []
    while (scope.len !== undefined) {
      scopes.push(JSON.stringify(scope))
      scope = Object.getPrototypeOf(scope)
    }
    return `len ${scopes.length}: ` + scopes.join(' <- ')
  }
}


// const s = new Scope()
// s.isRestoreWhenChange = true
// s.set('name', 'good')

// s.front()
// s.set('title', 'nice')

// const s1 = s.fork()
// console.log(s1.get('title') === 'nice')
// console.log(s1.get('name') === 'good')

// s.front()
// s.set('age', 12)

// console.log(s.get('age') === 12)
// console.log(s.get('title') === 'nice')
// console.log(s.get('name') === 'good')
// console.log(s1.get('age') === void 0)

// console.log(s.heap)
// s.back()
// console.log(s.heap)
// s.back()
// console.log(s.heap)
