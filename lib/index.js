
if (!process.env.NETBEAST_URL || !process.env.NETBEAST_PORT) {
  process.env.NETBEAST_URL = process.env.NETBEAST_URL || 'localhost'
  process.env.NETBEAST_PORT = process.env.NETBEAST_PORT || 8000
}

module.exports = require('./netbeast')
