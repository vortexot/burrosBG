# NÃO OLHE PARA O BANCO DE TRÁS. E NÃO RESPONDA À SUA MÃE.

Animação 2D de terror, vertical 9:16 (1080×1920, 30 fps), sincronizada com a narração em `audio/narracao.mp3`.

Tudo é desenhado em código (Canvas 2D no Chromium) — personagens, cenários e câmera —
e os quadros são codificados com ffmpeg. A trilha sonora (motor, drones, batimentos, vibrações,
pneu, amanhecer e a notificação final) é sintetizada em `audio.py` e mixada sob a narração.

## Arquivos
- `lib.js` — utilidades, iluminação, câmera, pós (grão + vinheta)
- `chars.js` — pai, menino e mulher (mesma aparência em todas as cenas)
- `env.js` — estrada, interior do carro, retrovisor, celular, papel das regras, velocímetro, vista externa
- `shots.js` — linha do tempo das 7 cenas (tempos alinhados à narração, ver `audio/narracao_timestamps.json`)
- `index.html` — página de render (`index.html?t=12.5` mostra um quadro)
- `render.cjs` — gera os quadros em paralelo e codifica
- `audio.py` — trilha + mixagem
- `build.sh` — gera o MP4 final

## Gerar
```bash
./build.sh /caminho/de/saida     # requer node + playwright, python3 + numpy, ffmpeg
```
Pré-visualizar quadros: `node shot.cjs index.html saida_%.png 10,36.5,141.8`

Duração final: ~2m26s (a narração enviada tem 2m22s; o vídeo acompanha a narração inteira).
