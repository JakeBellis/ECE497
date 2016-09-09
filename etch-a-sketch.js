var util = require("util");

var directions = ["left","right","up","down","clear"]

var easHeight = 16;
var easWidth = 16;

var cursorX = 0;
var cursorY = 0;

var easBoard = new Array(easHeight); 
for(var i = 0; i < easHeight; i++){  //set up clear board
    easBoard[i] = new Array(easWidth)
    for(var j = 0; j < easWidth; j++){
        easBoard[i][j] = ' ';  
    }
    
    
}

var readline = require('readline'),
rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('Input Command: ');
rl.prompt();
rl.on('line', function(command) {

switch (command) {
        case directions[0]:
            console.log('up');
            if (cursorY === 0) {}
            else{
                cursorY--;
                easBoard[cursorX][cursorY] = '#';
            }
            break;
            
        case directions[1]:
            console.log('down')
            if (cursorY === easBoard.length - 1) {}
            else{
                cursorY++;
                console.log(cursorY + ' ' + cursorX);
                easBoard[cursorX][cursorY] = '#';
            }
            break;
            
        case directions[2]:
            if (cursorX === 0) {}
            else{
                cursorX--;
                easBoard[cursorX][cursorY] = '#';
            }
            break;
        
        case directions[3]:
            if (cursorX === easBoard[cursorY].length - 1) {}
            else{
                cursorX++;
                easBoard[cursorX][cursorY] = '#';
            }
            break;
        
        case directions[4]:
             
            for(var i = 0; i < easBoard.length; i++){  //set up clear board
                for(var j = 0; j <easBoard[i].length; j++){
                    easBoard[i][j] = ' ';
                }
            }
            break;
            
        default:
            console.log(command);
            break;
    }
    


printGrid(easBoard);
});


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

