var request = require('request')
var express = require('express')
var router = express.Router()

router.get('/Lockitron/:id', function (req, res, next) {
  if (!req.query.key && req.query.key === 'locks') {
    request.get({
      url: 'https://api.lockitron.com/v2/locks/' + req.params.id,
      qs: {access_token: req.query.access_token}
    }, function (err, response, body) {
      if (err) res.status(404).send({ error: 'Not found' })
      else {
        res.json(body)
      }
    })
  } else if (req.query.key === 'keys' || req.query.key === 'activity') {
    request.get({
      url: 'https://api.lockitron.com/v2/locks/' + req.params.id + '/' + req.query.key,
      qs: {access_token: req.query.access_token}
    }, function (err, response, body) {
      if (err) res.status(404).send({ error: 'Not found' })
      else {
        res.json(body)
      }
    })
  } else if (req.query.key === 'users') {
    request.get({
      url: 'https://api.lockitron.com/v2/users/me',
      qs: {access_token: req.query.access_token}
    }, function (err, response, body) {
      if (err) res.status(404).send({ error: 'Not found' })
      else {
        res.json(body)
      }
    })
  } else {
    res.status(404).send({ error: 'Value not available' })
  }
})

router.get('/Lockitron/:id/info', function (req, res, next) {
  request.get({
    url: 'https://api.lockitron.com/v2/locks/' + req.params.id,
    qs: {access_token: req.query.access_token}
  }, function (err, response, body) {
    if (err) res.status(404).send({ error: 'Not found' })
    else {
      body = JSON.parse(body)
      if (!req.query.key) res.json(body)
      else if (!body[req.query.key]) res.status(404).send({ error: 'Value not available' })
      else {
        res.json(body[req.query.key])
      }
    }
  })
})

router.post('/Lockitron/:id', function (req, res, next) { //  FALTAN COSITAS A LA ESPERA DE TENER UN APARATEJO
  var validate = []
  if (req.body.access_token) {
    if (req.body.state || req.body.noblock || req.body.sleep_period) {
      validate = ['access_token', 'state', 'noblock', 'sleep_period']
      Object.keys(req.body).forEach(function (key) {
        if (validate.indexOf(key) < 0) delete req.body[key]
      })
      console.log(req.body)
      request.put({
        url: 'https://api.lockitron.com/v2/locks/' + req.params.id,
        json: req.body
      }, function (err, response, body) {
        if (err) res.status(404).send({ error: 'Value not available' })
        else res.send(true)
      })
    } else if ((req.body.email || req.body.phone) && req.body.name && req.body.start_date && req.body.expiration_date && req.body.role) {
      validate = ['access_token', 'email', 'phone', 'name', 'start_date', 'expiration_date', 'role']
      if (Object.keys(req.body).length > 6) {
        Object.keys(req.body).forEach(function (key) {
          if (validate.indexOf(key) < 0) delete req.body[key]
        })
      }
      console.log(req.body)
      request.put({
        url: 'https://api.lockitron.com/v2/locks/' + req.params.id + '/keys',
        json: req.body
      }, function (err, response, body) {
        if (err) res.status(404).send({ error: 'Value not available' })
        else res.send(true)
      })
    }
  } else res.status(404).send({ error: 'Access token missing' })
})

module.exports = router
