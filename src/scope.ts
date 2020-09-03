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
      this.heap.splice(0, len)
    }
    this.scope = Object.getPrototypeOf(this.scope)
  }

  public fork(): Scope {
    return new Scope(this.scope, this.heap, this.isRestoreWhenChange)
  }

  public set(key: any, value: any): void {
    const index = this.heap.length
    this.scope[key] = index
    this.heap.push(value)
  }

  public get(key: any): any {
    const index = this.scope[key]
    return this.heap[index]
  }
}


const s = new Scope()
s.set('name', 'good')

s.front()
s.set('title', 'nice')

const s1 = s.fork()
console.log(s1.get('title') === 'nice')
console.log(s1.get('name') === 'good')

s.front()
s.set('age', 12)

console.log(s.get('age') === 12)
console.log(s.get('title') === 'nice')
console.log(s.get('name') === 'good')
console.log(s1.get('age') === void 0)

console.log(s.heap)
s.back()
console.log(s.heap)
s.back()
console.log(s.heap)
