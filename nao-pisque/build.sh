#!/usr/bin/env bash
# Gera o vídeo "Você está no banco de trás — Não pisque" (1080x1920, 30 fps).
# Requisitos: node + playwright (Chromium), ffmpeg, python3 + numpy.
set -euo pipefail
cd "$(dirname "$0")"
B=${BUILD_DIR:-build}; mkdir -p "$B" output
python3 tools/make_captions.py
node tools/render.cjs "$B" "${WORKERS:-4}"
ffmpeg -y -loglevel error -i audio/narracao.mp3 -ac 1 -ar 44100 -f s16le "$B/vo.raw"
python3 tools/sfx.py "$B/vo.raw" "$B/mix.wav"
J=$(ffmpeg -hide_banner -i "$B/mix.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
M=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -y -loglevel error -i "$B/mix.wav" -af "loudnorm=I=-14:TP=-1.5:LRA=11:$M" -ar 48000 "$B/mix_norm.wav"
for v in caps clean; do
  name=$([ $v = caps ] && echo "nao-pisque_legendado" || echo "nao-pisque_sem-legenda")
  ffmpeg -y -loglevel error -f concat -safe 0 -i "$B/$v.txt" -i "$B/mix_norm.wav" \
    -map 0:v -map 1:a -c:v libx264 -preset slow -crf ${CRF:-21} -pix_fmt yuv420p -profile:v high -level 4.2 \
    -c:a aac -b:a 192k -shortest -movflags +faststart "output/$name.mp4"
done
ls -la output
