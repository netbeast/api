var loadBridge = require('./lights')
,	request = require('request')

loadBridge(function (err, api) {
	if (err)
		throw err
	else {
		api.lights(function (err, lights) {
			lights.lights.forEach( function (item) {
				//Registra una dos acciones (get y set) por cada bombilla
				request.post({url:'http://localhost/resources', 
					json:{
						app:'PhilipsHue',
						location:'all',
						topic:'lights',
						method:'get',
						hook: '/hueLights/' + item.id
					}}, 
					function (err, resp, body) {
						if (err)
							throw err
					})

				request.post({url:'http://localhost/resources', 
					json:{
						app:'PhilipsHue',
						location:'all',
						topic:'lights',
						method:'set',
						hook: '/hueLights/' + item.id
					}}, 
					function (err, resp, body) {
						if (err)
							throw err
					})

			})

		})
	}
})