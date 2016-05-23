process.env.NETBEAST = 'localhost:8000'
var netbeast = require("..")

var should = require('chai').should()
var expect = require('chai').expect
var mqtt = require('mqtt')
var http = require('http')
var request = require('request')
var net = require('net')
var q = require('q')

describe('Method with set', function () {

  it('set Method', function (done) {
    netbeast('lights').set({color: '#FF0080'})
    .then(function (data) {
      expect('#FF0080').to.eql(data[0].result.color)
      done()
    })
  })
  it('set By Id Method', function (done) {
    netbeast().setById('23f7ed59c6855558f07573e97b1ab3abc3fe1a0c', {power: 'off'})
    .then(function (data) {
      expect('off').to.eql(data.result.power)
      done()
    })
  })
})

describe('Method with get', function () {
  it('get Method', function (done) {
    this.timeout(50000)
    netbeast().get()
    .then(function (data) {
      expect('lights').to.eql(data[0].topic)
      done()
    })
  })

  it('get All Scene Method', function (done) {
    netbeast().getAllScenes()
    .then(function (data) {
      done()
    })
  })

  it('get Scene Method', function (done) {
    netbeast('watchfilm').getScene()
    .then(function (data) {
      done()
    })
  })

  it('get By Id Method', function (done) {
    this.timeout(50000)
    netbeast('lights').getById('23f7ed59c6855558f07573e97b1ab3abc3fe1a0c')
    .then(function (data) {
      expect('lights').to.eql(data.topic)
      expect('23f7ed59c6855558f07573e97b1ab3abc3fe1a0c').to.eql(data.id)
      done()
    })
  })

})
