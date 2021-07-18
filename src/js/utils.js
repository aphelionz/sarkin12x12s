export function truncateAddress (address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function onWindowEthereum (callback) {
  if (window.ethereum) {
    callback()
  } else {
    window.addEventListener('ethereum#initialized', callback, {
      once: true
    })

    setTimeout(callback, 3000) // 3 seconds
  }
}
