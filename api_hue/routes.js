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
          res.status(404).send({ error: 'Value not available' })
      })
    })

    router.get('/hueLights/:id/info', function (req, res, next) {
      api.lightStatus(req.params.id)
      .then(function (data) {
        delete data['state']
        delete data['pointsymbol']
        res.json(data)
      })
    })

    router.post('/hueLights/:id', function (req, res, next) {
      api.lightStatus(req.params.id)
      .then(function (data) {
        Object.keys(req.body).forEach(function (key) {
          if (!data.state[key]) {
            delete req.body[key]
          }
        })
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
