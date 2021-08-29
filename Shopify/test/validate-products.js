require('dotenv').config()

const { expect } = require('chai')
const Shopify = require('shopify-api-node')

const FIX = process.env.FIX === 'true'
const TIMEOUT = FIX ? 0 : 30000
const URL_BASE = 'https://jonsarkin.myshopify.com/admin/products/'

describe('Shopify Product Validator', function () {
  this.timeout(TIMEOUT)

  const shopify = new Shopify({
    shopName: 'jonsarkin.myshopify.com',
    apiKey: process.env.SHOPIFY_API_PK,
    password: process.env.SHOPIFY_API_SK,
    autoLimit: true
  })

  let products = []

  before(async () => {
    process.stdout.write('\tFetching product list.')
    let params = { limit: 100 }

    do {
      const productPage = await shopify.product.list(params)

      products = [].concat(products, productPage)

      params = productPage.nextPageParameters
      process.stdout.write('.')
    } while (params !== undefined)
    process.stdout.write('\n')
  })

  it('matches the reported product count from Shopify', async () => {
    const productCount = await shopify.product.count()
    expect(products.length).to.equal(productCount)
  })

  it('has valid titles', () => {
    let invalidTitleCount = 0

    for (const product of products) {
      if (product.title === 'Untitled') {
        console.log(URL_BASE + product.id)
        invalidTitleCount++
      }
    }

    expect(invalidTitleCount).to.equal(0, `${invalidTitleCount} products are still 'Untitled'`)
  })

  it('has valid descriptions', async () => {
    let invalidDescriptionCount = 0
    const expectedDescription = 'Hand-drawn art by Jon Sarkin, sized 12″x12″ (or close).'

    for (const product of products) {
      if (product.body_html !== expectedDescription) {
        if (FIX) {
          console.log(`Fixing ${product.id}`)
          await shopify.product.update(product.id, { body_html: expectedDescription })
        } else {
          console.log(URL_BASE + product.id)
          invalidDescriptionCount++
        }
      }
    }

    const errorMsg = `${invalidDescriptionCount} products have invalid descriptions`
    expect(invalidDescriptionCount).to.equal(0, errorMsg)
  })

  it('only has one variant for each product', async () => {
    let invalidVariantCount = 0

    for (const product of products) {
      if (product.variants.length > 1) {
        console.log(URL_BASE + product.id)
        invalidVariantCount++
      }
    }

    expect(invalidVariantCount).to.equal(0, `${invalidVariantCount} products have >1 variant`)
  })

  it('has a unique SKU for each product', async () => {
    let invalidSKUCount = 0

    for (const product of products) {
      const uniqueSku = products.filter(p => p.variants[0].sku === product.variants[0].sku)
      if (uniqueSku.length > 1) {
        console.log(URL_BASE + product.id)
        invalidSKUCount++
      }
    }

    expect(invalidSKUCount).to.equal(0, `${invalidSKUCount} SKUs appear twice`)
  })

  it('has a blank barcode', async () => {
    let invalidBarcodeCount = 0

    for (const product of products) {
      if (product.variants[0].barcode) {
        if (FIX) {
          console.log(`Fixing ${product.id}`)
          await shopify.productVariant.update(product.variants[0].id, { barcode: null })
        } else {
          console.log(URL_BASE + product.id)
          invalidBarcodeCount++
        }
      }
    }

    expect(invalidBarcodeCount).to.equal(0, `${invalidBarcodeCount} barcodes are not blank`)
  })

  it('has a product type of 12x12', async () => {
    let invalidTypeCount = 0

    for (const product of products) {
      if (product.product_type !== '12x12') {
        console.log(URL_BASE + product.id)
        invalidTypeCount++
      }
    }

    expect(invalidTypeCount).to.equal(0, `${invalidTypeCount} product types are not 12x12`)
  })

  it('has a price of $120 for 12x12s', async () => {
    let invalidPriceCount = 0

    for (const product of products) {
      if (product.product_type !== '12x12' && product.variant[0].price !== 120) {
        console.log(URL_BASE + product.id)
        invalidPriceCount++
      }
    }

    expect(invalidPriceCount).to.equal(0, `${invalidPriceCount} products are not priced correctly`)
  })

  it('has a blank "compare at" price', async () => {
    let invalidCompareAtPriceCount = 0

    for (const product of products) {
      if (product.variants[0].compare_at_price) {
        console.log(URL_BASE + product.id)
        invalidCompareAtPriceCount++
      }
    }

    const errorMsg = `${invalidCompareAtPriceCount} products have compare at prices`
    expect(invalidCompareAtPriceCount).to.equal(0, errorMsg)
  })

  it('is taxable', async () => {
    let invalidTaxableCount = 0

    for (const product of products) {
      if (!product.variants[0].taxable) {
        console.log(URL_BASE + product.id)
        invalidTaxableCount++
      }
    }

    const errorMsg = `${invalidTaxableCount} products are not taxable`
    expect(invalidTaxableCount).to.equal(0, errorMsg)
  })

  it('has a product vendor of Jon Sarkin', async () => {
    let invalidVendorCount = 0

    for (const product of products) {
      if (product.vendor !== 'Jon Sarkin') {
        console.log(URL_BASE + product.id)
        invalidVendorCount++
      }
    }

    const errorMsg = `${invalidVendorCount} product vendors are not Jon Sarkin`
    expect(invalidVendorCount).to.equal(0, errorMsg)
  })

  it('is taxable', async () => {
    let invalidTaxableCount = 0

    for (const product of products) {
      if (!product.variants[0].taxable) {
        console.log(URL_BASE + product.id)
        invalidTaxableCount++
      }
    }

    const errorMsg = `${invalidTaxableCount} products are not taxable`
    expect(invalidTaxableCount).to.equal(0, errorMsg)
  })

  it('has an inventory_policy of "deny"', async () => {
    let invalidPolicyCount = 0

    for (const product of products) {
      if (product.variants[0].inventory_policy !== 'deny') {
        console.log(URL_BASE + product.id)
        invalidPolicyCount++
      }
    }

    const errorMsg = `${invalidPolicyCount} products have an invalid policy`
    expect(invalidPolicyCount).to.equal(0, errorMsg)
  })

  it('has an inventory managed by Shopify', async () => {
    let invalidMgmtCount = 0

    for (const product of products) {
      if (product.variants[0].inventory_management !== 'shopify') {
        console.log(URL_BASE + product.id)
        invalidMgmtCount++
      }
    }

    const errorMsg = `${invalidMgmtCount} products have an invalid inventory management setting`
    expect(invalidMgmtCount).to.equal(0, errorMsg)
  })

  it('has an manual fulfillment service', async () => {
    let invalidServiceCount = 0

    for (const product of products) {
      if (product.variants[0].fulfillment_service !== 'manual') {
        console.log(URL_BASE + product.id)
        invalidServiceCount++
      }
    }

    const errorMsg = `${invalidServiceCount} products have an invalid fulfillment service`
    expect(invalidServiceCount).to.equal(0, errorMsg)
  })

  it('has an inventory quantity of 1 or 0', async () => {
    let invalidQuantityCount = 0

    for (const product of products) {
      if (product.variants[0].inventory_quantity > 1) {
        console.log(URL_BASE + product.id)
        invalidQuantityCount++
      }
    }

    const errorMsg = `${invalidQuantityCount} products have an invalid inventory quantity`
    expect(invalidQuantityCount).to.equal(0, errorMsg)
  })

  it('requires shipping for all products', async () => {
    let invalidShippingCount = 0

    for (const product of products) {
      if (!product.variants[0].requires_shipping) {
        console.log(URL_BASE + product.id)
        invalidShippingCount++
      }
    }

    const errorMsg = `${invalidShippingCount} products do not require shipping`
    expect(invalidShippingCount).to.equal(0, errorMsg)
  })

  it('has a weight of zero', async () => {
    let invalidWeightCount = 0

    for (const product of products) {
      if (!product.variants[0].weight === 0) {
        console.log(URL_BASE + product.id)
        invalidWeightCount++
      }
    }

    const errorMsg = `${invalidWeightCount} products do not have a zero weight`
    expect(invalidWeightCount).to.equal(0, errorMsg)
  })
})
