(() => {
    var n = 1
    const a = () => {
      var n = 2
      return b = () => {
        console.log('b', n)
      }
    }
    const c = () => {
      console.log('c', n)
    }
    a()()
    c()
})()