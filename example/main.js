wrapper.say = function() {
  const a = this.say2()
  return a + 1
}
wrapper.say2 = function() {
  return 2
}
expect(wrapper.run()).equal(3)
