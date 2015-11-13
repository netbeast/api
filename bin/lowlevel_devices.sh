#!/bin/bash
#Number of devices connected to usb
NUM_DEVICES=$(ls /sys/bus/usb/devices/*/product | wc -l)
#Array of devices directory
DEVICES=[]
j=1

#Save devices directory
# $(ls /sys/bus/usb/devices/*/product)
for i in $(ls /sys/bus/usb/devices/*/product)
do
        DEVICES[j]=$i
        ((j++))
done

#List Devices
aux=1
while [ $aux -le $NUM_DEVICES ]
do
        echo $(cat ${DEVICES[$aux]})
        ((aux++))
done
