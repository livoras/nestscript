function People(){console.log("THIS IS NOT A GOOD DAY~~~~~~~~~~~");this.a=1;this.b=2}People.prototype.add=function(){return this.a+this.b};console.log(People.prototype,"what?");const people=new People();console.log("====>",people,people.add(),people instanceof People);
for (let i = 0; i < 10; i++) {
  console.log('i --> ', i)
}
kk.a()
// let i = 0
// if (i > 1) {
//   i++
// }
