const a = { name: 'jerry', age: 12, title: 'student' }
const list = []
for (var i in a) {
  list.push(i)
}
console.log(list)

const b = { name2: 'jerry', age2: 12, title2: 'student' }
const list2 = []
for (i in b) {
  if (i === 'name2') { continue }
  list2.push(i)
}
console.log(list2)
