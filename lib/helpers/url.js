
var LOCAL_URL = 'http://localhost'

module.exports = function () {
  if (process.env.NETBEAST_URL && process.env.NETBEAST_PORT) {
    var url = 'http://' + process.env.NETBEAST_URL + ':' + process.env.NETBEAST_PORT
    return url
  } else {
    return LOCAL_URL
  }
}
