// const main = () => {
//   const a = { a: 'b', 'k': 'm', c: { d: 'good' } }
//   const b = [1, 2, 3, { c: a }]
//   const c = { a, b, i: 0 }
//   let ppp = 0
//   for (i = 0; c.i < b.length; c.i++) {
//     console.log(b[c.i], c.i, b)
//   }
//   for (let i = 0; i < 100; i++) {
//     console.log(" --> ", i)
//     if (i / 13 === 1){
//       console.log("this is the outer test", i)
//       for (let j = 0; j < i; j++) {
//         console.log("INNER TEST", i, j, i + j)
//         ppp++
//       }
//       break
//       sayHi(i, j)
//     }
//   }
  // b.forEach((val) => {
  //   console.log("THIS IS THE VALUE- >", val)
  // })
//   console.log(ppp)
//   setTimeout(() => {
//     wx.showToast({ title: "GOodNigh."  })
//   }, 3)
// }

// const sayHi = (a, b) => {
//   console.log('GOOD -> ', a + b)
//   const j = 100
//   for (let i = 30; i < j; i++) {
//     j--
//     console.log('youth', i, j)
//   }
// }

// const add = () => {
//   return () => {
//     console.log("HELLO WORLD!++++++++++++++++=")
//     return "GOT IT!"
//   }
// }

const add = () => {
  let d = 10
  let f = 20
  return (a, b) => {
    d++
    f--
    console.log(d)
    setTimeout(() => {
      const c = 'good'
      d--
      f++
      console.log(d, c, f, d + f)
    }, 10)
    return a + b + d 
  }
}

const min = () => {
  let d = 10
  return (c) => {
    d--
    return d + c
  }
}

function main() {
  const k = add()
  const k2 = min()
  console.log(k(1, 2), k2(1), 'good')
  // const b = () => {
  //   console.log("WHAT KKKKKKK")
  //   return "OK"
  // }
  // const c = b
  // const d = add()
  // for (let i = 0; i < 10; i++) {
  //   console.log("GOOD", b(), c(), d())
  // }
}
