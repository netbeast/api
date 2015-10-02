var loadBridge = require('./lights')
var	express = require('express')
var router = express.Router()

loadBridge(function (err, api) {
  if (err) throw err
  else {
    router.get('/hueLights/:id', function (req, res, next) {
      api.lightStatus(req.params.id)
      .then(function (data) {
        if (!req.query.key) res.json(data.state)
        else if (data.state[req.query.key])
          res.json(data.state[req.query.key])
        else
          res.send('That value does not exists on Bulb ' + req.params.id)
      })
    })

    router.post('/hueLights/:id', function (req, res, next) {
      api.lightStatus(req.params.id)
      .then(function (data) {
        Object.keys(req.body).forEach(function (key) {
          if (!data.state[key]) {
            delete data.state[key]
          }
        })
        api.setLightState(req.params.id, data.state)
        .then(function (result) {
          console.log('OK')
          console.log(result)
        })
        .fail(function (err) {
          console.log('ERR')
          console.log(err)
        })
        .done()
      })
    })
  }
})

module.exports = router
