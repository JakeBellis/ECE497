#!/bin/bash

temp1 = i2cget -y 2 0x48 00
temp2 = i2cget -y 2 0x49 00

echo $temp1
echo $temp2

#setup config register

i2cset -y 2 0x48 0x64
i2cset -y 2 0x49 0x64


