const add = () => {
  let d = 10
  let f = 20
  return (a, b) => {
    d++
    f--
    console.log(d)
    const g = () => {
      const c = 'good'
      d--
      f++
      console.log(d, c, f, d + f)
    }
    g()
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
  console.log(page)
  const a = 'Nice bil bilbil'
  const b = () => {
    console.log("no fun")
    return "NONONO"
  }
  const c = add(1, 2)
  page.handleTapGood = () => {
    console.log("THis is good + nice", a, b(), Object)
    console.log(c(3, 4))
    page.setData({ name: "TOO YOUNG!~~~?" + a })
    page.setData({ motto: "NNNN" })
  }
}
