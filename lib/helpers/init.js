// Similar to url helper
// this is a hack around, let's see if it works better:

module.exports = function () {
<<<<<<< HEAD
  if (typeof window !== 'undefined' && window.document) {
    // this code runs in a browser:
    var arr = window.location.href.split('/')
    console.log(window.location.href)
    console.log(arr[2])
    return arr[2]

  } else if (process.env.NETBEAST) {
    return process.env.NETBEAST

=======
  if (process.env.NETBEAST_ROUTER_API) {
    return // nothing to do here
  } else if (process.env.NETBEAST_URL && process.env.NETBEAST_PORT) {
    var url = 'http://' + process.env.NETBEAST_URL + ':' + process.env.NETBEAST_PORT
    process.env.NETBEAST_ROUTER_API = url + '/api'
    process.env.NETBEAST_ROUTER = url
>>>>>>> 092300240bcde52cbdb2b540245e2273a466b3c6
  } else {
    console.error('Netbeast router URL is missing or device cannot be found')
    process.exit(-1)
  }
}
