// (window as any).newCount = 0

interface IBindingCell {
  value: any
  mutable: boolean
  initialized: boolean
}

export class Scope {
  constructor(
    public scope: any = {},
    public heap: IBindingCell[] = [],
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

  public new(
    key: any,
    { mutable = true, initialized = true }: { mutable?: boolean, initialized?: boolean } = {},
  ): void {
    const index = this.heap.length
    this.scope[key] = index
    this.heap.push({ value: void 0, mutable, initialized })
  }

  public set(key: any, value: any): void {
    if (!(key in this.scope)) {
      throw new Error('variable is used before decleration')
    }
    const index = this.scope[key]
    const cell = this.heap[index]
    if (!cell.initialized) {
      throw new ReferenceError('Cannot access binding before initialization')
    }
    if (!cell.mutable) {
      throw new TypeError('Assignment to constant variable')
    }
    cell.value = value
  }

  public init(key: any, value: any): void {
    if (!(key in this.scope)) {
      throw new ReferenceError('binding is not declared')
    }
    const cell = this.heap[this.scope[key]]
    if (cell.initialized) {
      throw new ReferenceError('binding is already initialized')
    }
    cell.value = value
    cell.initialized = true
  }

  public get(key: any): any {
    if (!(key in this.scope)) {
      throw new ReferenceError('binding is not declared')
    }
    const index = this.scope[key]
    const cell = this.heap[index]
    if (!cell.initialized) {
      throw new ReferenceError('Cannot access binding before initialization')
    }
    return cell.value
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
