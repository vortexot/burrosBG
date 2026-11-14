# Você está no banco de trás — NÃO PISQUE

Curta de terror em animação 2D, vertical 9:16 (1080×1920, 30 fps), em primeira pessoa.
Tudo é desenhado proceduralmente em Canvas 2D (sem imagens externas) e renderizado
quadro a quadro no Chromium headless. A narração é o arquivo da ElevenLabs em `audio/narracao.mp3`.

## Arquivos finais
- `output/nao-pisque_legendado.mp4` — com legendas dinâmicas (palavra ativa em vermelho)
- `output/nao-pisque_sem-legenda.mp4` — limpo, só os textos de cena

Duração: 2:35 (a narração enviada tem 2:34; as cenas foram sincronizadas com ela palavra por palavra).
Áudio: narração + desenho de som procedural (motor, drone, batimentos, vibração do celular,
papel, impactos, rachaduras, amanhecer), normalizado em −14 LUFS.

## Estrutura
- `render/` — página que desenha cada quadro (`core.js`, `front.js`, `woman.js`, `props.js`, `timeline.js`)
- `tools/render.cjs` — render paralelo (Playwright → ffmpeg)
- `tools/stills.cjs` — gera quadros soltos para revisão: `node tools/stills.cjs pasta 12.5 30c`
- `tools/sfx.py` — desenho de som e mixagem
- `tools/make_captions.py` — legendas a partir de `audio/transcript.json` (timestamps por palavra, Whisper)
- `build.sh` — gera tudo do zero (~15 min com 4 núcleos)

Fontes (SIL OFL): Caveat, Oswald, Inter, Share Tech Mono, Special Elite (via @fontsource).
