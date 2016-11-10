#!/usr/bin/env node

var util = require("util");
var bs = require("bonescript");
var i2c = require('i2c-bus');
var bus = 2; //'/dev/i2c-2';
var gestureSens = 0x39;

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

wire = i2c.open(bus, function(err){});

wire.writeByte(gestureSens,ENABLE, 0x10, function(err){});
wire.readByte(gestureSens,ENABLE,function(err, id){
    console.log(id);
});
wire.writeByte(gestureSens,CONFIG1, 0x60, function(err){});
wire.writeByte(gestureSens,CONFIG2, 0x31, function(err){});
wire.writeByte(gestureSens,CONFIG3, 0x00, function(err){});

//set up sensor for gesture recognition

wire.writeByte(gestureSens,PPULSE, 0x89, function(err){}); //16us 10 pulses
wire.writeByte(gestureSens,ADC_TIME, 219, function(err){});
wire.writeByte(gestureSens,PULSE_REG, 0xC9, function(err){});
wire.writeByte(gestureSens,GEST_PROX_ENTER, 40, function(err){});
wire.writeByte(gestureSens,GEST_PROX_EXIT, 30, function(err){});
wire.writeByte(gestureSens,GCONFIG1, 0x40, function(err){});
wire.writeByte(gestureSens,GCONFIG2, 0x43, function(err){});
wire.writeByte(gestureSens,GCONFIG3, 0x00, function(err){});
wire.writeByte(gestureSens,WTIME, 246, function(err){});
wire.writeByte(gestureSens,UP_OFFSET, 0x00, function(err){});
wire.writeByte(gestureSens,DOWN_OFFSET, 0x88, function(err){});
wire.writeByte(gestureSens,RIGHT_OFFSET, 0x08, function(err){});
wire.writeByte(gestureSens,LEFT_OFFSET, 0x00, function(err){});
wire.writeByte(gestureSens,GCONFIG4, 0x03, function(err){});
wire.writeByte(gestureSens,0xE7, 0x00, function(err){}); //clears all interrupts

wire.writeByte(gestureSens,ENABLE, 0x45, function(err){});
//console.log(wire.readByte(gestureSens,CONFIG1,1,function(err){}));
var lvl = 0;
var uplvl = 0;
var downlvl = 0;
var rightlvl = 0;
var leftlvl = 0;

timer = setInterval(function(){
    
 var FIFOLVL = wire.readByte(gestureSens, GLEVEL, function(err, data){
        lvl = data;
        //console.log(data);
        //console.log('');
    });
   var upBuffer = wire.readByte(gestureSens, UP_FIFO, function(err,data){
      if(lvl < 6){
      uplvl = uplvl + data;
      }
   });
   
   wire.readByte(gestureSens, DOWN_FIFO, function(err,data){
      if(lvl < 6){
          downlvl = downlvl + data;
      }
   });
   
    wire.readByte(gestureSens, LEFT_FIFO, function(err,data){
      if(lvl < 6){
          leftlvl = leftlvl + data;
      }
   });
   
    wire.readByte(gestureSens, RIGHT_FIFO, function(err,data){
     if(lvl < 6){
         rightlvl = rightlvl + data;
    }
   });
   
   if(lvl == 1){
        // console.log("UP: " + uplvl);
        // console.log("DOWN: " + downlvl);
        // console.log("LEFT: " + leftlvl);
        // console.log("RIGHT: " + rightlvl);
        // console.log('');
        
        var vertdiff = uplvl - downlvl;
        var horizdiff = rightlvl - leftlvl;
        var THRESHOLD = 25;
        
        if(Math.abs(vertdiff) > Math.abs(horizdiff)){
            if(vertdiff > THRESHOLD){
             console.log("UP");
             console.log("");
            }
            else if(vertdiff < -THRESHOLD){
             console.log("DOWN");
             console.log("");
            }
        }
        else{
            if(horizdiff > THRESHOLD){
             console.log("RIGHT");
             console.log("");
            }
            else if(horizdiff < -THRESHOLD){
             console.log("LEFT");
             console.log("");
            }
         
        }
        
        uplvl = 0;
        downlvl = 0;
        rightlvl = 0;
        leftlvl = 0;
   }
   
   
    //console.log('');
   
    
    
    // wire.readByte(gestureSens, 0x9C, function(err, data){
    //     prox = data;
    // });
    //console.log('proximity:');
    //console.log(prox);
}, 200);


