class Variable {
  constructor(public v: any) {
  }

  public get(): any {

  }

  public set(v: any): void {
    this.v = v
  }
}

const f1 = (a: Variable, b: Variable, c: Variable) => {
  console.log(a.get() + b.get())
  return () => {

  }
}
