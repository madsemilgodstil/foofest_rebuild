const fs = require('fs')
const path = require('path')

function generateTree (dir, depth = 0) {
  const files = fs.readdirSync(dir)
  let tree = ''

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    tree += '  '.repeat(depth) + `- ${file}\n`

    if (stats.isDirectory()) {
      tree += generateTree(filePath, depth + 1)
    }
  })

  return tree
}

const tree = generateTree('.')
fs.writeFileSync('structure.txt', tree)
console.log('Mappestrukturen er gemt i structure.txt')
