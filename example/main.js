// function People(){console.log("THIS IS NOT A GOOD DAY~~~~~~~~~~~");this.a=1;this.b=2}People.prototype.add=function(){return this.a+this.b};console.log(People.prototype,"what?");const people=new People();console.log("====>",people,people.add(),people instanceof People);
let i = 0
while (i < 10) {
  // spy()
  i++
  console.log(i)
}
// expect(spy).to.have.been.called.exactly(10)
