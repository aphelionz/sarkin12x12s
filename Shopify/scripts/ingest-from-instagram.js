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

    try {
      const instagramMetadata = JSON.parse(
        fs.readFileSync(instaloaderFolder + `/${file.replace('.jpg', '.json')}`).toString()
      )

      const existingProduct = await shopify.product.list({ handle: instagramMetadata.node.id })
      if (existingProduct.length > 0) return

      const postTxt = fs.readFileSync(instaloaderFolder + `/${file.replace('.jpg', '.txt')}`)
      const tags = extractTags(postTxt.toString())

      // create product
      const product = await shopify.product.create({
        title: 'Untitled',
        handle: instagramMetadata.node.id,
        tags: tags ? tags.join(',') : [],
        product_type: '12x12',
        variants: [{
          fulfillment_service: 'manual',
          inventory_management: 'shopify',
          inventory_quantity: 1,
          requires_shipping: true,
          sku: instagramMetadata.node.id,
          price: 120.00
        }],
        vendor: 'Jon Sarkin',
        body_html: 'Hand-drawn art by Jon Sarkin, sized 12″x12″ (or close).'
      })

      const image = fs.readFileSync(instaloaderFolder + '/' + file)
      const base64 = Buffer.from(image).toString('base64')

      await shopify.productImage.create(product.id, {
        attachment: base64,
        filename: file
      })

      console.log(product.id)
    } catch (err) {
      console.log(err, err.response?.body)
    }
  }))
})()
