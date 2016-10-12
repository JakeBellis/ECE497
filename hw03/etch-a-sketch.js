#!/usr/bin/env node

var util = require("util");
var bs = require("bonescript");
var i2c = require('i2c');
var bus = '/dev/i2c-2';
var matrix = 0x70;

var blank = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var wire = new i2c(matrix, {
    device: bus
});
 
wire.writeByte(0x21, function(err) {            // Start oscillator (p10)
    wire.writeByte(0x81, function(err) {        // Disp on, blink off (p11)
        wire.writeByte(0xe7, function(err) {    // Full brightness (page 15)
        });
    });
});

wire.writeBytes(0x00, blank, function(err) {});

var easHeight = 8;
var easWidth = 8;

cursorX = 0;
cursorY = 0;

hexRow = 0x00;
hexColumns = new Array(easWidth);
for(var i = 0; i < hexColumns.length; i++){  //set up clear board
    hexColumns[i] = 0x00;
}

var upButton = 'P9_13', downButton = 'P9_15', leftButton = 'P9_17',
    rightButton = 'P9_23', clearButton = 'P9_27';

var buttons = [upButton, downButton, leftButton, rightButton, clearButton];

for(var i = 0; i < buttons.length; i++){
    bs.pinMode(buttons[i], bs.INPUT, 7, 'pullup');
}

bs.attachInterrupt(downButton, true, bs.RISING, downInterrupt);
bs.attachInterrupt(upButton, true, bs.RISING, upInterrupt);
bs.attachInterrupt(leftButton, true, bs.RISING, leftInterrupt);
bs.attachInterrupt(rightButton, true, bs.RISING, rightInterrupt);
bs.attachInterrupt(clearButton, true, bs.RISING, clearInterrupt);



//var directions = ["left","right","up","down","clear"] directions for keyboard input



console.log('Press Button to draw');

function downInterrupt(){
     if (cursorY === easHeight - 1) {}
     else{
        cursorY++;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] || (0x01 << cursorX);
        // console.log(hexRow);
        // console.log(hexColumns[cursorY]);
        // console.log(cursorY);
        // console.log(cursorX);
        
    }
    // console.log('printing');
    // console.log(hexRow);
    printGrid(hexRow,hexColumns[cursorY]);
}

function upInterrupt(){
     if (cursorY === 0) {}
     else{
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] || (0x01 << cursorX);
    }
    printGrid(hexRow,hexColumns[cursorY]);
}

function rightInterrupt(){
     if (cursorX === easWidth - 1) {}
     else{
        cursorX++;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] || (0x01 << cursorX);
    }
    printGrid(hexRow,hexColumns[cursorY]);
}

function leftInterrupt(){
     if (cursorX === 0) {}
     else{
        cursorX--;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] || (0x01 << cursorX);
    }
    printGrid(hexRow,hexColumns[cursorY]);
}

function clearInterrupt(){

   wire.writeBytes(0x00, blank, function(err){});
}



function printGrid(hexRow,HexColumn) {
    wire.writeBytes(hexRow,[HexColumn], function(err){});
}

