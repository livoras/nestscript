function test(a, b) {
  if (a) {
    if (b) {
      console.log("ok")
    } else {
      console.log('not ok')
    }

    console.log('------------>')

    if (!b) {
      console.log("not ok")
    } else {
      console.log('ok')
    }
  }
}

test(true, true)
