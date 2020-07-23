function People() {
  console.log("THIS IS NOT A GOOD DAY~~~~~~~~~~~")
  this.a = 1
  this.b = 2
  // fuck()
}
People.prototype.add = function () {
  return this.a + this.b
}
console.log(People.prototype, 'what?')
// People.prototype.add = function() {
//   return this.a + this.b
// }
const people = new People()
console.log('====>', people, people.add(), people instanceof People)
// expect(people.a).equal(1)
// expect(people.b).equal(2)
// expect(people.add()).equal(3)