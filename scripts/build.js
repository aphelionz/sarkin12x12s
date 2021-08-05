const fs = require('fs')
const { ingest } = require('./ingest/index')

async function main () {
  const template = fs.readFileSync('./src/index.html')
  const builtHtml = await ingest('.instaloader', template)
  fs.writeFileSync('./.build/index.html', builtHtml.toString())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
