#!/usr/bin/env node

var util = require("util");
var bs = require("bonescript");
var i2c = require('i2c-bus');
var bus = 2; //'/dev/i2c-2';
var gestureSens = 0x39;
var matrix = 0x70;

//define gesture register addresses
var ENABLE = 0x80;
var CONFIG1 = 0x8D;
var CONFIG2 = 0x90;
var CONFIG3 = 0x9F;
var ADC_TIME = 0x81;
var WTIME = 0x83;
var PPULSE = 0x8E;
var GAIN_CONTROL = 0x8F;

var GEST_PROX_ENTER = 0xA0;
var GEST_PROX_EXIT = 0xA1;
var GCONFIG1 = 0xA2;
var GCONFIG2 = 0xA3;
var UP_OFFSET = 0xA4;
var DOWN_OFFSET = 0xA5;
var LEFT_OFFSET = 0xA7;
var RIGHT_OFFSET = 0xA9;
var PULSE_REG = 0xA6
var GCONFIG3 = 0xAA;
var GCONFIG4 = 0xAB;
var GLEVEL = 0xAE;
var GSTATUS = 0xAF;


//buffer addresses
var UP_FIFO = 0xFC;
var DOWN_FIFO = 0xFD;
var LEFT_FIFO = 0xFE;
var RIGHT_FIFO = 0xFF;

wire = i2c.openSync(bus);

wire.writeByteSync(gestureSens,ENABLE, 0x01);

wire.writeByteSync(gestureSens,CONFIG1, 0x60);
wire.writeByteSync(gestureSens,CONFIG2, 0x31);
wire.writeByteSync(gestureSens,CONFIG3, 0x00);

//set up sensor for gesture recognition

wire.writeByteSync(gestureSens,PPULSE, 0x89); //16us 10 pulses
wire.writeByteSync(gestureSens,ADC_TIME, 219);
wire.writeByteSync(gestureSens,PULSE_REG, 0xC9);
wire.writeByteSync(gestureSens,GEST_PROX_ENTER, 40); //40
wire.writeByteSync(gestureSens,GEST_PROX_EXIT, 30); //30
wire.writeByteSync(gestureSens,GCONFIG1, 0x40);
wire.writeByteSync(gestureSens,GCONFIG2, 0x53);
wire.writeByteSync(gestureSens,GCONFIG3, 0x00);
wire.writeByteSync(gestureSens,WTIME, 246);
wire.writeByteSync(gestureSens,UP_OFFSET, 0x00);
wire.writeByteSync(gestureSens,DOWN_OFFSET, 0x00);
wire.writeByteSync(gestureSens,RIGHT_OFFSET, 0x00);
wire.writeByteSync(gestureSens,LEFT_OFFSET, 0x00);
wire.writeByteSync(gestureSens,GCONFIG4, 0x03);
wire.writeByteSync(gestureSens,0xE7, 0x00); //clears all interrupts

wire.writeByteSync(gestureSens,ENABLE, 0x45);

var gestIntPin = 'P9_14';
bs.pinMode(gestIntPin, bs.INPUT, 7, 'pullup');
console.log("program start");

bs.attachInterrupt(gestIntPin, true,  bs.FALLING, detectGesture);

var lastGest;
var currentGest;
var newGestFlag = 0;

var smile = new Buffer([0x00, 0x3c, 0x00, 0x42, 0x28, 0x89, 0x04, 0x85,
    0x04, 0x85, 0x28, 0x89, 0x00, 0x42, 0x00, 0x3c
]);

var blank = new Buffer ([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

var easHeight = 8;
var easWidth = 8;

cursorX = 0;
cursorY = 0;

hexRow = 0x00;
hexColumns = new Array(easWidth);
for(var i = 0; i < hexColumns.length; i++){  //set up clear board
    hexColumns[i] = 0x00;
}
//set up matrix LED board

wire.writeByteSync(matrix, 0x21, 0x01);   
wire.writeByteSync(matrix, 0x81, 0x01);   
wire.writeByteSync(matrix, 0xe7, 0x01);


wire.writeI2cBlockSync(matrix, 0x00, blank.length, blank);



function leftGesture(){
    //console.log("down interrupt");
     if (cursorY === easHeight - 1) {}
     else{
        cursorY++;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] | (0x01 << cursorX);

    }
    newGestFlag = 0;
    printGrid(hexRow,hexColumns[cursorY]);
}

function rightGesture(){
     if (cursorY === 0) {}
     else{
        cursorY--; 
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] | (0x01 << cursorX);
    }
    newGestFlag = 0;
    printGrid(hexRow,hexColumns[cursorY]);
}

function downGesture(){
     if (cursorX === easWidth - 1) {}
     else{
        cursorX++;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] | (0x01 << cursorX);
    }
    newGestFlag = 0;
    printGrid(hexRow,hexColumns[cursorY]);
}

function upGesture(){
     if (cursorX === 0) {}
     else{
        cursorX--;
        hexRow = 2*cursorY;
        hexColumns[cursorY] = hexColumns[cursorY] | (0x01 << cursorX);
        console.log(0x01 << cursorY);
    }
    newGestFlag = 0;
    printGrid(hexRow,hexColumns[cursorY]);
}

function printGrid(hexRow,HexColumn) {
    console.log("X: " + cursorX);
    console.log("Y:" + cursorY);
    console.log(hexRow + " " + HexColumn);
    wire.writeI2cBlockSync(matrix, hexRow, 2, new Buffer([0x00, HexColumn]));
}

function detectGesture(){
    
    var lvl = 0;
    var updata = new Array(32);
    var downdata = new Array(32);
    var rightdata = new Array(32);
    var leftdata = new Array(32);
    var upFirst,downFirst,rightFirst,leftFirst;
    var upLast, downLast, rightLast, leftLast;
    var GESTURE_THRESHOLD = 25;
    
    
    setTimeout(function(){
    var FIFOLVL = wire.readByteSync(gestureSens, GLEVEL);
    //console.log(FIFOLVL);
    var i = 0;
    while(FIFOLVL >= 1){
    updata[i] = wire.readByteSync(gestureSens, UP_FIFO);
    //console.log(updata[i]);
    downdata[i] = wire.readByteSync(gestureSens, DOWN_FIFO);
    rightdata[i] = wire.readByteSync(gestureSens, RIGHT_FIFO);
    leftdata[i] = wire.readByteSync(gestureSens, LEFT_FIFO);
    
    i++;
    //console.log("i = " + i);
    
    var FIFOLVL = wire.readByteSync(gestureSens, GLEVEL);
    //console.log(FIFOLVL);

    }
    
    for(i = 0; i < 32; i++){
        if((updata[i] > GESTURE_THRESHOLD) &&
            (downdata[i] > GESTURE_THRESHOLD) &&
            (rightdata[i] > GESTURE_THRESHOLD) &&
            (leftdata[i] > GESTURE_THRESHOLD)){
                upFirst = updata[i];
                downFirst = downdata[i];
                rightFirst = rightdata[i];
                leftFirst = leftdata[i];
                break;
            }
    }
    
    for(i = 31; i >= 0 ; i--){
        if((updata[i] > GESTURE_THRESHOLD) &&
            (downdata[i] > GESTURE_THRESHOLD) &&
            (rightdata[i] > GESTURE_THRESHOLD) &&
            (leftdata[i] > GESTURE_THRESHOLD)){
                upLast = updata[i];
                downLast = downdata[i];
                rightLast = rightdata[i];
                leftLast = leftdata[i];
                break;
            }
    }
    
    // console.log("UP " + upFirst + " " + upLast);
    // console.log("DOWN " + downFirst + " " + downLast);
    // console.log("RIGHT " + rightFirst + " " + rightLast);
    // console.log("LEFT " + leftFirst + " " + leftLast);
    
    var ud_ratio_first = ((upFirst - downFirst)*100)/(upFirst + downFirst);
    var lr_ratio_first = ((leftFirst - rightFirst)*100)/(leftFirst + rightFirst);
    var ud_ratio_last = ((upLast - downLast)*100)/(upLast + downLast);
    var lr_ratio_last = ((leftLast - rightLast)*100)/(leftLast + rightLast);
    
    //console.log(ud_ratio_first - ud_ratio_last);
    //console.log(lr_ratio_first - lr_ratio_last);
    
    var ud_ratio = ud_ratio_first - ud_ratio_last;
    var lr_ratio = lr_ratio_first - ud_ratio_last;
    
    if(Math.abs(ud_ratio) > Math.abs(lr_ratio)){
        if(ud_ratio > 10){
            console.log("down");
            currentGest = "d";
            newGestFlag = 1;
        }
        else if(ud_ratio < -10){
            console.log("up");
            currentGest = "u";
            newGestFlag = 1;
        }
        else{
            //console.log("unrecognizable")
        }
    }
    else{
        if(lr_ratio > 10){
            console.log("right");
            currentGest = "r";
            newGestFlag = 1;
        }
        else if(lr_ratio < -10){
            console.log("left");
            currentGest = "l";
            newGestFlag = 1;
        }
        else{
            //console.log("unrecognizable")
        }
    }
    
    if(newGestFlag = 1){
    if(currentGest == "u"){
        upGesture();
        console.log("upGesture");
        console.log("Flag: " + newGestFlag);
    }
    else if(currentGest == "d"){
        downGesture();
        console.log("downGesture");
        console.log("Flag: " + newGestFlag);
    }
    else if(currentGest == "r"){
        rightGesture();
        console.log("rightGesture");
        console.log("Flag: " + newGestFlag);
    }
    else if(currentGest == "l"){
        leftGesture();
        console.log("leftGesture");
        console.log("Flag: " + newGestFlag);
    }
}
    },200);

}
    


