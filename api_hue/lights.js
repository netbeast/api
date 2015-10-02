
var fs = require('fs')
,	async = require('async')
,	request = require('request')
,	hue = require('node-hue-api')
,	HueApi = require('node-hue-api').HueApi
,	hueapi = new HueApi()
,	huelights = []


var ipbridge = undefined
var userbridge = undefined
var api = undefined

module.exports = function(callback) {

	async.waterfall([
		hue.nupnpSearch,
		function (result, callback) {
			ipbridge = JSON.stringify(result[0].ipaddress)
			ipbridge = ipbridge.split("\"")[1]
			console.log("Hue Bridges Found: " + ipbridge)
			callback.call(this, null)
		},

		async.apply(fs.readFile, 'username.txt'),

		function createUser(user, callback) {
			if (user)
				callback(null, user.toString()) 
			else
				hueapi.createUser(ipbridge, null, null, callback)
		},

		function (user, callback) {
			if (user === null && ipbridge !== null) {
				//io.sockets.emit("syncBridge")
				createUser()
			} else {
				fs.writeFile("username.txt", user)
				callback(null, user)
			}
		},

		function FindLights(user, callback) {
			api = new HueApi(ipbridge, user)
			//api.lights(callback)
			callback(null, api)
		}

		], callback)
}