var netbeast = require('..')

netbeast.find().then(function () {
   netbeast('lights').set({power: 0})
})

