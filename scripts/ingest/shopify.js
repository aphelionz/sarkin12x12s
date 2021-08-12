const fs = require('fs')
const path = require('path')

const Shopify = require('shopify-api-node')

const { extractTags } = require('./tags')

const instaloaderFolder = './.instaloader'

;(async function () {
  const shopify = new Shopify({
    shopName: 'jonsarkin.myshopify.com',
    apiKey: process.env.SHOPIFY_API_PK,
    password: process.env.SHOPIFY_API_SK,
    autoLimit: true
  })

  const files = fs.readdirSync(instaloaderFolder)

  await Promise.all(files.map(async (file) => {
    if (path.extname(file) !== '.jpg') return

    const image = fs.readFileSync(instaloaderFolder + '/' + file)
    const base64 = Buffer.from(image).toString('base64')

    const instagramMetadata = JSON.parse(
      fs.readFileSync(instaloaderFolder + `/${file.replace('.jpg', '.json')}`).toString()
    )

    const postTxt = fs.readFileSync(instaloaderFolder + `/${file.replace('.jpg', '.txt')}`)
    const tags = extractTags(postTxt.toString())

    try {
      // create product
      const product = await shopify.product.create({
        title: instagramMetadata.node.id,
        handle: instagramMetadata.node.id,
        tags: tags ? tags.join(',') : [],
        product_type: '12x12',
        variants: [{
          barcode: instagramMetadata.node.id,
          fulfillment_service: 'manual',
          inventory_management: 'shopify',
          inventory_quantity: 1,
          requires_shipping: true,
          sku: instagramMetadata.node.id,
          price: 120.00
        }],
        body_html: 'A 12x12 by Jon Sarkin'
      })

      const image = await shopify.productImage.create(product.id, {
        attachment: base64,
        filename: file,
      })

      console.log(product.id)
    } catch (err) {
      console.log(err, err.response.body)
    }
  }))
})()

// shopify.product.list({ limit: 5 }).then(console.log)
