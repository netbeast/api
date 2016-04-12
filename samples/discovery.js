netbeast = require('..')
netbeast.find().then(function (networkObjects) {
  console.log('network objects available with the following fields')
  console.log(networkObjects)

  /* Select a second netbeast */
  if (networkObjects[1])  {
    netbeast.set(networkObjects[1])
  }

  console.log('Discovering devices within the network')
  netbeast.discoverDevices('all').then(function (devices ) {
    console.log(devices)
  })

}).catch(function (err) {
  console.error(err)
})