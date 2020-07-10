const main = () => {
  const a = { a: 'b', 'k': 'm', c: { d: 'good' } }
  const b = [1, 2, 3, { c: a }]
  const c = { a, b, i: 0 }
  for (i = 0; c.i < b.length; c.i++) {
    console.log(b[c.i], c.i, b)
  }
  for (let i = 0; i < 100; i++) {
    console.log(" --> ", i)
    if (i / 13 === 1){
      console.log("this is the outer test", i)
      for (let j = 0; j < i; j++) {
        console.log("INNER TEST", i, j, i + j)
      }
      break
      sayHi(i, j)
    }
  }
  b.forEach((val) => {
    console.log("THIS IS THE VALUE- >", val)
  })
}

const sayHi = (a, b) => {
  console.log('GOOD -> ', a + b)
  const j = 100
  for (let i = 30; i < j; i++) {
    j--
    console.log('youth', i, j)
  }
}
