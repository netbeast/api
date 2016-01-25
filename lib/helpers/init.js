// Similar to url helper
// this is a hack around, let's see if it works better:

module.exports = function () {
  if (process.env.NETBEAST_ROUTER_API) {
    return // nothing to do here
  } else if (process.env.NETBEAST_URL && process.env.NETBEAST_PORT) {
    var url = 'http://' + process.env.NETBEAST_URL + ':' + process.env.NETBEAST_PORT
    process.env.NETBEAST_ROUTER_API = url
  } else {
    console.error('Netbeast router URL is missing or device cannot be found')
    process.exit(-1)
  }
}
