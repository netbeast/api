# nb-resources

Wrapper draft

```javascript


/* Promises */
class Resource  {
	constructor: {}

	get: function(resource) {
		request('/api....')
	}

	set: function(resource) {
		request.post('')
	}

	update: function(resource) {
		
	}

	toggle: function(resource) {
		
	}

	remove: function(resource) {
		
	}

	delete: remove

	at: function(where) {

		if where === '*', 'all' => se aplica en todas las localizaciones

	}

subscribe: function(resource) {

}
}


Resource = require('resources')

Resource.register([{
	where: 'living room',
	method: 'get',
	hook: '/api/aksdgaud'
}, {
	where: 'living room',
	method: 'get',
	hook: '/api/aksdgaud'
}])


```
Events.register()
