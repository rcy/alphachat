#!/bin/sh

i=$1
echo sending $i messages
while test $i -gt 0; do
    curl -d"$i" http://localhost:8088/publish?id=xyzzy
    i=$(expr $i - 1)
#    sleep .1
done
