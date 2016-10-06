#!/usr/bin/env node

var i2c = require('i2c');
var bus = '/dev/i2c-2';
var tmpSens1 = 0x48;
var tmpSens2 = 0x49;

var TEMP_ADDRESS = 0; //useful addresses for TMP101 Sensors
var CONFIG_REG = 1;
var TMP_ALARM_HIGH = 2;
var TMP_ALARM_LOW = 3;


var tmp1wire = new i2c(tmpSens1, {
    device: bus
});

var tmp2wire = new i2c(tmpSens2, {
    device: bus
});

var tmpOut1 = tmp1wire.readBytes(TEMP_ADDRESS, 2, function(err){});
var tmpOut2 = tmp2wire.readBytes(TEMP_ADDRESS, 2, function(err){});


console.log((tmpOut1[0]*1.8)+32);
console.log((tmpOut2[0]*1.8)+32);

