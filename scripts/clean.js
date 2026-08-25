const fs = require('fs')
const path = require('path')

for (const directory of ['build', 'dist']) {
  const target = path.resolve(__dirname, '..', directory)
  if (fs.existsSync(target)) {
    if (fs.rmSync) {
      fs.rmSync(target, { recursive: true, force: true })
    } else {
      fs.rmdirSync(target, { recursive: true })
    }
  }
}
