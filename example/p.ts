const fs = require('fs')

const mainContent: string = fs.readFileSync(__dirname + "/main.js", "utf-8")
const codeIndex = 79676
const GAP = 100
console.log(mainContent.substring(codeIndex - GAP * 2, codeIndex + GAP))
