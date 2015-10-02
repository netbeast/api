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
          console.log(data.state[key])
          if (data.state[key] === undefined) {
            delete req.body[key]
          }
        })
        console.log(req.body)
        api.setLightState(req.params.id, req.body)
        .then(function (result) {
          res.send(true)
        })
        .fail(function (err) {
          res.status(404).send({ error: 'Value not available' })
        })
        .done()
      })
    })
  }
})

module.exports = router
