#!/usr/bin/env node

//set up gpio
var bs = require('bonescript');
tempAlarm1 = 'P9_41'; tempAlarm2 = 'P9_42';
bs.pinMode(tempAlarm1, bs.INPUT, 7, 'pullup');
bs.pinMode(tempAlarm2, bs.INPUT, 7, 'pullup');



var i2c = require('i2c');
var bus = '/dev/i2c-2';
var tmpSens1 = 0x48;
var tmpSens2 = 0x49;

var TEMP_ADDRESS = 0; //useful addresses for TMP101 Sensors
var CONFIG_REG = 1;
var TMP_ALARM_HIGH = 2;
var TMP_ALARM_HIGH = 3;


var tmp1wire = new i2c(tmpSens1, {
    device: bus
});

var tmp2wire = new i2c(tmpSens2, {
    device: bus
});

bs.attachInterrupt(tempAlarm1, true, bs.FALLING, outputTemp);
bs.attachInterrupt(tempAlarm2, true, bs.FALLING, outputTemp);


function outputTemp(){
    
    var tmpOut1 = tmp1wire.readBytes(TEMP_ADDRESS, 2, function(err){});
    var tmpOut2 = tmp2wire.readBytes(TEMP_ADDRESS, 2, function(err){});
    
    console.log("Temp Sensor at Address 0x48:");
    convertTemp(tmpOut1);
    console.log("Temp Sensor at Address 0x49:");
    convertTemp(tmpOut2);
    console.log("\n");
}

function convertTemp(tempBuffer){
    var fracTemp = ((tempBuffer[1] >> 7) & 0x01)*0.5 + 
                   ((tempBuffer[1] >> 6) & 0x01)*0.25 +
                   ((tempBuffer[1] >> 5) & 0x01)*0.125 +
                   ((tempBuffer[1] >> 4) & 0x01)*0.0625;
                   
    var tempC = tempBuffer[0] + fracTemp;
    var tempF = (tempC*1.8)+32;
    
    console.log("%d degrees Fahrenheit", tempF.toFixed(1));
}

