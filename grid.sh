#!/bin/bash
# usage: grid.sh out.jpg img1 ... img6  -> 2x3 contact sheet
o=$1; shift; args=(); n=0
for i in "$@"; do args+=(-i "$i"); n=$((n+1)); done
while [ $n -lt 6 ]; do args+=(-f lavfi -i color=black:s=960x540:d=1); n=$((n+1)); done
ffmpeg -loglevel error -y "${args[@]}" -filter_complex "xstack=inputs=6:layout=0_0|w0_0|0_h0|w0_h0|0_h0+h0|w0_h0+h0" -frames:v 1 "$o"
