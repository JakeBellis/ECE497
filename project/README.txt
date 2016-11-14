This is a project for Gesture Based Control.  The gesture control is based on the Sparkfun Breakout Board for the Avago APDS-9960.  
The gestures implemented include the four basic directions: left, right, up, and down.
The i2c setup for this setup was done using the npm package i2c-bus after Bonescript and i2c failed to properly set the command registers.
Once the gestures were detected, they were used to control an etch-a-sketch game on an 8x8 LED matrix.

Instructions:
Run the file with node.js
Swipe your hand over the sensor in any direction to draw in that direction.
Restart the program to clear the matrix.
