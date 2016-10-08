#!/bin/bash

#sets up TMP101 sensors to produce a highly accurate output and ALERT values
i2cset -y 2 0x48 01 0x64
i2cset -y 2 0x49 01 0x64

temp1=`i2cget -y 2 0x48 00`
temp2=`i2cget -y 2 0x49 00`


t1LOW=$(($temp1+2))
t1HIGH=$(($temp1+3))

t2LOW=$(($temp2+2))
t2HIGH=$(($temp2+3))

echo high limit on 0x48 is $t1HIGH deg C
echo high limit on 0x49 is $t2HIGH deg C

#set limits on both devices
i2cset -y 2 0x48 02 $t1LOW
i2cset -y 2 0x48 03 $t1HIGH

i2cset -y 2 0x49 02 $t2LOW
i2cset -y 2 0x49 03 $t2HIGH







