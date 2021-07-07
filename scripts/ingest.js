const fs = require('fs')
const { ingest } = require('./utils')

async function main () {
  const template = fs.readFileSync('./src/index.html')
  const builtHtml = await ingest(process.env.INSTA_DEST, template)
  fs.writeFileSync('./.build/index.html', builtHtml.toString())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
