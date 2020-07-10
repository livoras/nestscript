const main = () => {
  for (let i = 0; i < 100; i++) {
    console.log(" --> ", i)
    if (i / 13 === 1){
      console.log("this is the outer test", i)
      for (let j = 0; j < i; j++) {
        console.log("INNER TEST", i, j, i + j)
        sayHi(i, j)
      }
      break
    }
  }
}

const sayHi = (a, b) => {
  console.log('GOOD -> ', a + b)
  const j = 100
  for (let i = 30; i < j; i++) {
    j--
    console.log('youth', i, j)
  }
}
