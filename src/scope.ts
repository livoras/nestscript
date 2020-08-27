export class Scope {
  constructor(public scope: any = {}) {
  }

  public front(): void {
    this.scope = Object.setPrototypeOf({}, this.scope)
  }

  public back(): void {
    this.scope = Object.getPrototypeOf(this.scope)
  }

  public fork(): Scope {
    return new Scope(this.scope)
  }

  public set(key: any, value: any): void {
    this.scope[key] = value
  }

  public get(key: any): any {
    return this.scope[key]
  }
}

//
// const s = new Scope()
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
