var dispg = [];
var dispr = [];
var socket;
var firstconnect = true,
i2cNum  = "0x70";

// Create a matrix of LEDs inside the <table> tags.
var matrixDataG;
for(var j=7; j>=0; j--) {
	matrixDataG += '<tr>';
	for(var i=0; i<8; i++) {
	    matrixDataG += '<td><div class="LED" id="gid'+i+'_'+j+
		'" onclick="GLEDclick('+i+','+j+')">'+
		i+','+j+'</div></td>';
	    }
	matrixDataG += '</tr>';
}
$('#matrixLEDGreen').append(matrixDataG);

var matrixDataR;
for(var j=7; j>=0; j--) {
	matrixDataR += '<tr>';
	for(var i=0; i<8; i++) {
	    matrixDataR += '<td><div class="LED" id="rid'+i+'_'+j+
		'" onclick="RLEDclick('+i+','+j+')">'+
		i+','+j+'</div></td>';
	    }
	matrixDataR += '</tr>';
}
$('#matrixLEDRed').append(matrixDataR);



// The slider controls the overall brightness
$("#slider1").slider({min:0, max:15, slide: function(event, ui) {
	socket.emit("i2cset",  {i2cNum: i2cNum, i: ui.value+0xe0, disp: 1});
    }});

// Send one column when LED is clicked.
function GLEDclick(i, j) {
//	alert(i+","+j+" clicked");
    console.log('0x'+dispg[i].toString(16));

    dispg[i] ^= 0x1<<j;
    console.log({i,j});
    socket.emit('i2cset', {i2cNum: i2cNum, i: 2*i,
			     disp: '0x'+dispg[i].toString(16)});
    console.log('0x'+dispg[i].toString(16));
//	socket.emit('i2c', i2cNum);
// Toggle bit on display
    if(dispg[i]>>j&0x1 === 1) {
        $('#gid'+i+'_'+j).addClass('green');
    } else {
        $('#gid'+i+'_'+j).removeClass('green');
    }
}
5,4
function RLEDclick(i, j) {
//	alert(i+","+j+" clicked");
    dispr[i] ^= 0x1<<j;
    socket.emit('i2cset', {i2cNum: i2cNum, i: 2*i+1,
			     disp: '0x'+dispr[i].toString(16)});
    console.log({i2cNum: i2cNum, i: 2*i+1,
		 disp: '0x'+dispr[i].toString(16)});
//	socket.emit('i2c', i2cNum);
    // Toggle bit on display
    if(dispr[i]>>j&0x1 === 1) {
        $('#rid'+i+'_'+j).addClass('red');
    } else {
        $('#rid'+i+'_'+j).removeClass('red');
    }
}

    function connect() {
      if(firstconnect) {
        socket = io.connect(null);

        // See https://github.com/LearnBoost/socket.io/wiki/Exposed-events
        // for Exposed events
        socket.on('message', function(data)

            { status_update("Received: message " + data);});
        socket.on('connect', function()
            { status_update("Connected to Server"); });
        socket.on('disconnect', function()
            { status_update("Disconnected from Server"); });
        socket.on('reconnect', function()
            { status_update("Reconnected to Server"); });
        socket.on('reconnecting', function( nextRetry )
            { status_update("Reconnecting in " + nextRetry/1000 + " s"); });
        socket.on('reconnect_failed', function()
            { message("Reconnect Failed"); });

        socket.on('matrixg',  matrixg);
        socket.on('matrixr',  matrixr);

    socket.emit('i2cset', {i2cNum: i2cNum, i: 0x21, disp: 1}); // Start oscillator (p10)
    socket.emit('i2cset', {i2cNum: i2cNum, i: 0x81, disp: 1}); // Disp on, blink off (p11)
    socket.emit('i2cset', {i2cNum: i2cNum, i: 0xe7, disp: 1}); // Full brightness (page 15)
    /*
	i2c_smbus_write_byte(file, 0x21);
	i2c_smbus_write_byte(file, 0x81);
	i2c_smbus_write_byte(file, 0xe7);
    */
        // Read display for initial image.  Store in disp[]
        socket.emit("matrix", i2cNum);


        firstconnect = false;
      }
      else {
        socket.socket.reconnect();
      }
    }

    function disconnect() {
      socket.disconnect();
    }

    // When new data arrives, convert it and display it.
    // data is a string of 16 values, each a pair of hex digits.
    function matrixg(data) {
        var i, j;
        //        status_update("i2c: " + data);
        // Make data an array, each entry is a pair of digits
        data = data.split(" ");
        //        status_update("data: " + data);
        // Every other pair of digits are Green. The others are red.
        // Ignore the red.
        // Convert from hex.
        for (i = 0; i < data.length; i += 2) {
            dispg[i / 2] = parseInt(data[i], 16);
        }
	console.log(dispg)
        //        status_update("disp: " + disp);
        // i cycles through each column
        for (i = 0; i < dispg.length; i++) {
            // j cycles through each bit
            for (j = 0; j < 8; j++) {
                if (((dispg[i] >> j) & 0x1) === 1) {
                    $('#gid' + i + '_' + j).addClass('green'); }
		else {
                    $('#gid' + i + '_' + j).removeClass('green');
                }
            }
        }
    }

    function matrixr(data) {
        var i, j;
        //        status_update("i2c: " + data);
        // Make data an array, each entry is a pair of digits
        data = data.split(" ");
        //        status_update("data: " + data);
        // Every other pair of digits are Green. The others are red.
        // Ignore the red.
        // Convert from hex.
        for (i = 0; i < data.length; i += 2) {
            dispr[i / 2] = parseInt(data[i+1], 16);
        }
	console.log(dispr)
        //        status_update("disp: " + disp);
        // i cycles through each column
        for (i = 0; i < dispg.length; i++) {
            // j cycles through each bit
            for (j = 0; j < 8; j++) {
                if (((dispr[i] >> j) & 0x1) === 1) {
                    $('#rid' + i + '_' + j).addClass('red');
                } else {
                    $('#rid' + i + '_' + j).removeClass('red');
                }
            }
        }
    }

    function status_update(txt){
	$('#status').html(txt);
    }

    function updateFromLED(){
      socket.emit("matrix", i2cNum);
    }

connect();

$(function () {
    // setup control widget
    $("#i2cNum").val(i2cNum).change(function () {
        i2cNum = $(this).val();
    });
});