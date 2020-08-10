const fs = require('fs')

const mainContent: string = fs.readFileSync(__dirname + "/main.js", "utf-8")
const codeIndex = 79676
const GAP = 100
const start = 18870
const end = 18959
console.log(mainContent.substring(start, end))
