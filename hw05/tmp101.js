#!/usr/bin/env node
// Reads the tmp101 temperature sensor.

var i2c     = require('i2c-bus');
var fs      = require('fs');
var request = require('request');
var util    = require('util');

var filename = "/root/ECE497/hw05/Tmp101_keys.json";

var bus = 2;
var tmp101 = [0x48, 0x49];
var time = 1000;    // Time between readings

var sensor = i2c.openSync(bus);

var keys = JSON.parse(fs.readFileSync(filename));
// console.log("Using: " + filename);
console.log("Title: " + keys.title);
console.log(util.inspect(keys));

var urlBase = keys.inputUrl + "/?private_key=" + keys.privateKey 
                + "&temp0=%s&temp1=%s";

var temp = [];

setInterval(getTemp, time);

function getTemp(){
// Read the temp sensors
for(var i=0; i<tmp101.length; i++) {
    temp[i] = sensor.readByteSync(tmp101[i], 0x0);
    // temp[i] = Math.random();
    console.log("temp: %dC, %dF (0x%s)", temp[i], temp[i]*9/5+32, tmp101[i].toString(16));
}


// Substitute in the temperatures
var url = util.format(urlBase, temp[0], temp[1]);
console.log("url: ", url);

// Send to phant
request(url, function (err, res, body) {
    if (!err && res.statusCode == 200) {
        console.log(body); 
    } else {
        console.log("error=" + err + " response=" + JSON.stringify(res));
    }
});
}
