#!/bin/bash
# Gera o vídeo final: ./build.sh <pasta_de_trabalho>
set -e
cd "$(dirname "$0")"
WORK=${1:-build}; mkdir -p "$WORK"
python3 audio.py audio/narracao.mp3 "$WORK/mix.wav"
node render.cjs "$WORK" 4 30
ffmpeg -loglevel error -y -f concat -safe 0 -i "$WORK/list.txt" -i "$WORK/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-15:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$WORK/nao_olhe_para_o_banco_de_tras.mp4"
echo "$WORK/nao_olhe_para_o_banco_de_tras.mp4"
