const b = new ArrayBuffer(16)
const a = new Float64Array(b)
a[0] = -0.001
a[1] = -0.002
const c = new Float64Array(b)
console.log(a, b, c[0])

const d = new Float64Array(b.slice(8))
a[1] = 0.03
console.log(c, d[0])
