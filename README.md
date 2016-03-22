# API Reference

Welcome to the Netbeast API Documentation!

The main goal of this documentation is to explain how the Netbeast API works. All the information that you need to start building your Apps has been gathered here.

## How to use it?

First of all, you need to install the npm package in your netbeast app
````
npm install netbeast --save
````
 Once the package is in the node_modules folder, you can require it from the code.

```javascript
var beast = require('netbeast')

beast('lights').get()

beast('music').at('living-room').set({status: 'play', volume: 100})

beast('video').get('status')
```

Control your smart devices with Netbeast is as simple as that. Lets go deeper! :rocket:

###Arguments

Each device support specific parameters.
If you try to set an unsupported parameter to a switch (for example the brightness, `beast('switch').set({brightness: 80})`) you will return a soft error. The process keep working but send you a warning.

Here is a list of supported arguments for each device.
* switch & bridge
    * power:  `true || false`
* lights
    * power:    `true || false`
    * hue:           `0..360`
    * saturation:    `0..100`
    * brightness:    `0..100`
    * color: `{r: 0, g: 0, b: 0} || #FF13AA`
* music & video
    * volume:       `0..100`
    * status:       `play || pause || stop || mute || unmute || info`
    * track:        `must be the url of the song/video`
* temperature       `ºC`
* humidity          `0..100`
* luminosity        `photons per square meter`
* battery           `0..100`

A example of use:
````javascript
var beast = require('netbeast')
beast('lights').set({power: true, brightness: 100, hue: 0, saturation: 100})
````
 If you have white and color bulbs, the first ones are going to switch on and change the brightness. The color bulbs will also change their color to red and the execution continues without problems.

###Output

All the methods acts as a promise and they always return a Javascript object if successful or an error object else.
````javascript
var beast = require('netbeast')

beast('temperature').at('kitchen').get()
.then(function (data) {
  console.log('The temperature in the kitchen is ' + data + 'ºC')
}).catch(function (err) {
  console.log('Error: ' + err)
})
````
You will find all the documentation and how to use the different methods [here](http://docs.netbeast.co/chapters/api_reference/index.html)!
