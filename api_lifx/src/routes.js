var express = require('express')
var router = express.Router()
var LifxClient = require('../lib/lifx').client
var client = new LifxClient()

client.init()

router.get('/Lifx/:id', function (req, res, next) {
  client.light(req.params.id).getState(function (err, data) {
    if (err) res.status(404).send({ error: 'Not found' })
    else { // PARSEAR req.query.key ALL FORMATO DE LIFX (POR DEFINIR)
      if (!req.query.key) res.json(data)
      else if (data[req.query.key])
        res.json(data[req.query.key])
      else
        res.status(404).send({ error: 'Value not available' })
    }
  })
})

router.get('/Lifx/:id/info', function (req, res, next) { // ESTO DEPENDE DEL FORMATO DE DATOS DE LIFX HABRÁ QUE CAMBIARLO O NO
  client.light(req.params.id).getState(function (err, data) {
    if (err) res.status(404).send({ error: 'Not found' })
    else { // PARSEAR req.query.key ALL FORMATO DE LIFX (POR DEFINIR)
      if (!req.query.key) res.json(data)
      else if (data[req.query.key])
        res.json(data[req.query.key])
      else
        res.status(404).send({ error: 'Value not available' })
    }
  })
})

router.post('/Lifx/:id', function (req, res, next) { //  FALTAN COSITAS A LA ESPERA DE TENER UN APARATEJO
  Object.keys(req.body).forEach(function (key) {
    if (key === 'on') {
      if (req.body[key]) client.light(req.params.id).on()
      else client.light(req.params.id).off()
    } else if (key === 'bri') {
      client.light(req.params.id).getState(function (err, data) {
        if (err) res.status(404).send({ error: 'Not found' })
        else {
          client.light(req.params.id).color(data.color.hue, data.color.saturation, req.body[key])
        }
      })
    } else if (key === 'color') {
      // IMPLEMENTAR COLOR
      // DEFINIR FORMATO GENÉRICO A USAR EN TODAS LAS APIS
    }
  })
})

module.exports = router
