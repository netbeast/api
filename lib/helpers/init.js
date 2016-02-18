// Similar to url helper
// this is a hack around, let's see if it works better:

module.exports = function () {
  if (typeof window !== 'undefined' && window.document) {
    // this code runs in a browser:
    var arr = window.location.href.split('/')
    console.log(window.location.href)
    console.log(arr[2])
    return arr[2]

  } else if (process.env.NETBEAST) {
    return process.env.NETBEAST

  } else {
    console.error('Netbeast router URL is missing or device cannot be found')
    process.exit(-1)
  }
}
