export function truncateAddress (address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function weiToEth (wei) {
  return (wei / (10 ** 18)).toFixed(4)
}
