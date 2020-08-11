const a = () => {
  const b = (n) => {
    console.log(isObject, '---?')
    return isObject(n) ? 'OK' : 'NO OK'
  }
  console.log(isObject, isObject(), '~~~~~~~~~~~`')
  b()
  function isObject(value) {
    return true
  }
}
a()