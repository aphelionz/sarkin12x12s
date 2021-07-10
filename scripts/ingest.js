const fs = require('fs')
const { ingest } = require('./utils')

const {
  CONTRACT_ADDRESS
} = process.env

async function main () {
  const template = fs.readFileSync('./src/index.html')
  const builtHtml = await ingest('.instaloader', template, CONTRACT_ADDRESS)
  fs.writeFileSync('./.build/index.html', builtHtml.toString())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
