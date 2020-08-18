const a = () => {}

Object.defineProperty(a, 'toString', {
  value: () => {
    return 'OJBK'
  },
})

console.log('-----------', a)
