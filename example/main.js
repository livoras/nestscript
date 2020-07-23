// const add = () => {
//   let d = 10
//   let f = 20
//   return (a, b) => {
//     d++
//     f--
//     console.log(d)
//     const g = () => {
//       const c = 'good'
//       d--
//       f++
//       console.log(d, c, f, d + f)
//     }
//     g()
//     return a + b + d 
//   }
// }

// const { expect } = require("chai")

// const min = () => {
//   let d = 10
//   return (c) => {
//     d--
//     return d + c
//   }
// }

// function main() {
//   console.log(page)
//   const a = 'Nice bil bilbil'
//   const b = () => {
//     console.log("no fun")
//     return "NONONO"
//   }
//   const c = add(1, 2)
//   page.handleTapGood = () => {
//     console.log("THis is good + nice", a, b(), Object)
//     console.log(c(3, 4))
//     page.setData({ name: "GOODNIDk ruanyang" + a })
//     page.setData({ motto: "No today. Tomorrow?" })
//     if (page.items && page.items.length > 0) {
//       page.items.push(Math.random())
//       if (page.a && page.b || page.c) {
//         console.log("DOO")
//       }
//     } else {
//       page.items = []
//       page.items.push("RUNYANG")
//     }
//     page.setData({ items: page.items })
//   }
//   page.handleTapBad = () => {
//     const items = page.data.items
//     const i = items.pop()
//     if (i < 0.5) {
//       page.setData({ name: '< 0.5' })
//     } else {
//       page.setData({ name: '> 0.5' })
//     }
//     page.setData({ items })
//   }
// }
// const a = new Date()
// console.log(a instanceof Date)

wrapper.sub = function (a, b) {
  console.log(this, 'this is the result')
  return a - b + this.a
}
expect(wrapper.getResult(100, 50)).equal(150)
expect(wrapper.sub(39, 20)).equal(19)
