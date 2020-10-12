// (window as any).newCount = 0

export class Scope {
  constructor(
    public scope: any = {},
    public heap: any[] = [],
    public isRestoreWhenChange: boolean = true) {
    // (window as any).newCount++
    this.scope.blockNameMap = new Map<string, any>()
  }

  public front(blockName: any): void {
    this.scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope)
    this.scope.blockName = blockName // 用来销毁用
    this.scope.blockNameMap.set(blockName, this.scope)
  }

  public back(blockName: any): void {
    const targetScope = this.scope.blockNameMap.get(blockName)
    // 这里可能有内存泄漏问题，map 里面还存在着中间的 scope 对象
    // 但是函数的执行结束以后就会回收掉，似乎不需要考虑太多？
    if (this.isRestoreWhenChange) {
      const len = targetScope.len
      this.heap.splice(len)
    }
    this.scope = Object.getPrototypeOf(targetScope)
  }

  public fork(): Scope {
    const scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope)
    return new Scope(scope, this.heap, this.isRestoreWhenChange)
  }

  public new(key: any): void {
    const index = this.heap.length
    this.scope[key] = index
    this.heap.push(void 0)
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
