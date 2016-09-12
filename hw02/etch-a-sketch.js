#!/usr/bin/env node

var util = require("util");
var bs = require("bonescript");

var easHeight = 16;
var easWidth = 16;

cursorX = 0;
cursorY = 0;

var easBoard = new Array(easHeight); 
for(var i = 0; i < easBoard.length; i++){  //set up clear board
    easBoard[i] = new Array(easWidth)
    for(var j = 0; j < easWidth; j++){
        easBoard[i][j] = ' ';  
    }
}

var upButton = 'P9_13', downButton = 'P9_15', leftButton = 'P9_17',
    rightButton = 'P9_23',clearButton = 'P9_31';

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
     if (cursorY === easBoard[cursorY].length - 1) {}
     else{
        cursorY++;
        easBoard[cursorY][cursorX] = '#';
    }
    printGrid(easBoard);
}

function upInterrupt(){
     if (cursorY === 0) {}
     else{
        cursorY--;
        easBoard[cursorY][cursorX] = '#';
    }
    printGrid(easBoard);
}

function rightInterrupt(){
     if (cursorX === easBoard[cursorX].length - 1) {}
     else{
        cursorX++;
        easBoard[cursorY][cursorX] = '#';
    }
    printGrid(easBoard);
}

function leftInterrupt(){
     if (cursorX === 0) {}
     else{
        cursorX--;
        easBoard[cursorY][cursorX] = '#';
    }
    printGrid(easBoard);
}

function clearInterrupt(){
    for(var i = 0; i < easBoard.length; i++){  //set up clear board
                for(var j = 0; j <easBoard[i].length; j++){
                    easBoard[i][j] = ' ';
                }
    }
    printGrid(easBoard);
}

// var readline = require('readline'),
// rl = readline.createInterface(process.stdin, process.stdout);

// rl.setPrompt('Input Command: ');
// rl.prompt();
// rl.on('line', function(command) {

// switch (command) {
//         case directions[0]:
//             console.log('up');
//             if (cursorY === 0) {}
//             else{
//                 cursorY--;
//                 easBoard[cursorX][cursorY] = '#';
//             }
//             break;
            
//         case directions[1]:
//             if (cursorY === easBoard.length - 1) {}
//             else{
//                 cursorY++;
//                 console.log(cursorY + ' ' + cursorX);
//                 easBoard[cursorX][cursorY] = '#';
//             }
//             break;
            
//         case directions[2]:
//             if (cursorX === 0) {}
//             else{
//                 cursorX--;
//                 easBoard[cursorX][cursorY] = '#';
//             }
//             break;
        
//         case directions[3]:
//             if (cursorX === easBoard[cursorX].length - 1) {}
//             else{
//                 cursorX++;
//                 easBoard[cursorX][cursorY] = '#';
//             }
//             break;
        
//         case directions[4]:
             
//             for(var i = 0; i < easBoard.length; i++){  //set up clear board
//                 for(var j = 0; j <easBoard[i].length; j++){
//                     easBoard[i][j] = ' ';
//                 }
//             }
//             break;
            
//         default:
//             console.log(command);
//             break;
//     }
    


// printGrid(easBoard);
// });


function printGrid(grid) {
  var topString = '   0';
  for(var i = 1; i<grid.length; i++){
      topString = topString + ' ' + i.toString();
  }
  process.stdout.write(topString + '\n');
  for(var i=0; i<grid.length; i++) {
    process.stdout.write(util.format("%d: ",i));
    for(var j=0; j<grid[i].length; j++) {
      process.stdout.write(util.format("%s ", grid[i][j]));
    }
  process.stdout.write("\n");
  }
}

