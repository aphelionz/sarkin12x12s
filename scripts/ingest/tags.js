function extractTags(str) {
  const tags = str.split(' ')
    .map(t => t.trim())
    .filter(t => t !== '#12x12')
    .filter(t => t.startsWith('#'))
    .map(t => t.substr(1))

  return tags
}

module.exports = { extractTags }
