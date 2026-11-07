#!/usr/bin/env bash
# Headless screenshots of aesthetic boards and the UI kit, light and dark.
# usage: dev/move-lab/shoot.sh <port> <outdir> <key> [<key>...]
# env:   LG_QUERY='?movelab=1'  query string appended to the URL (loads lab-only styles)
#        LG_VIEWS='board kit'   views to shoot (board, deck = cover slide, or any SeeBuilt kind: kit dashboard mobile landing settings)
#        LG_PIN=1               like-for-like pairs: after switching to the FIRST key, capture the brand state that
#                               drives appearance (colours, scheme, hue, heading/body fonts, typography settings,
#                               content/brand name, pureBg) and re-apply it to every later key after its switch.
#                               The browser session is shared by all keys, so run an original and its rebuild together.
# out:   <outdir>/<key>-<view>-<light|dark>.png  (element shots of #previewCard / #builtView, 1440x1000 viewport)
# Needs a server already running on <port> from the repo root. Headless, in-memory, localhost only.
set -u
[ $# -ge 3 ] || { echo "usage: $0 <port> <outdir> <key> [<key>...]" >&2; exit 2; }
PORT=$1; OUT=$2; shift 2
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
VIEWS=${LG_VIEWS:-"board kit"}
S="-s=lg-shoot-$$"
WORK=$(mktemp -d)            # playwright-cli drops .playwright-cli/ in its cwd
cd "$WORK" || exit 1
cleanup() { playwright-cli "$S" close >/dev/null 2>&1; rm -rf "$WORK"; }
trap cleanup EXIT INT TERM

pw() { playwright-cli "$S" "$@"; }
ev() { playwright-cli "$S" --raw eval "$1" 2>&1 | tail -1; }

# --browser=chromium: the default 'chrome' channel is not installed here; the cached Chromium is headless.
playwright-cli "$S" open --browser=chromium "http://localhost:$PORT/${LG_QUERY:-}" >/dev/null 2>&1 || { echo "open failed" >&2; exit 1; }
pw resize 1440 1000 >/dev/null
# the app opens on the Library; the editor view hosts #previewCard and #builtView
# showToast is silenced so the "Fonts: ... Lock Type" toast never lands in one shot of a pair only
ev "(()=>{document.body.dataset.view='editor';window.showToast=()=>{};return 'ok'})()" >/dev/null

# Pin: capture on first use, re-apply afterwards. Runs after the style switch, before render().
PINJS="if('${LG_PIN:-}'){if(!window.__pin){window.__pin={colors:JSON.parse(JSON.stringify(state.colors)),scheme:state.scheme,hue:state.hue,hf:state.headingFont.name,bf:state.bodyFont.name,typography:JSON.parse(JSON.stringify(state.typography)),content:JSON.parse(JSON.stringify(state.content||{})),pureBg:state.pureBg}}else{const P=window.__pin;state.colors=JSON.parse(JSON.stringify(P.colors));state.scheme=P.scheme;state.hue=P.hue;state.headingFont=fontByName(P.hf);state.bodyFont=fontByName(P.bf);state.typography=JSON.parse(JSON.stringify(P.typography));state.content=JSON.parse(JSON.stringify(P.content));state.pureBg=P.pureBg}}"

rc=0
for key in "$@"; do
  has=$(ev "AESTHETICS.some(a=>a.key==='$key')")
  if [ "$has" != "true" ]; then echo "SKIP $key: not registered" >&2; rc=1; continue; fi
  for mode in light dark; do
    for view in $VIEWS; do
      if [ "$view" = board ]; then
        js="(()=>{if(state.aesthetic!=='$key')chooseAesthetic('$key');state.aesthetic='$key';$PINJS;state.bgMode='$mode';setBoardView('board');render();return document.querySelector('#previewCard .ab').dataset.mode})()"
        sel='#previewCard'
      elif [ "$view" = deck ]; then
        js="(()=>{if(state.aesthetic!=='$key')chooseAesthetic('$key');state.aesthetic='$key';$PINJS;state.bgMode='$mode';setBoardView('deck');render();return 'ok'})()"
        sel='#deckGrid .deck-card:nth-child(1)'
      else
        js="(()=>{if(state.aesthetic!=='$key')chooseAesthetic('$key');state.aesthetic='$key';$PINJS;state.bgMode='$mode';Show.built('$view');render();return document.querySelector('#builtView .ab').dataset.mode})()"
        sel='#builtView'
      fi
      got=$(ev "$js" | tr -d '"')
      ev "document.fonts.ready.then(()=>1)" >/dev/null
      if [ "$view" = deck ]; then sleep 2; got=$mode; ev "document.querySelector('#deckGrid .deck-card:nth-child(1) .ab').dataset.mode" >/dev/null; else sleep 0.5; fi
      f="$OUT/$key-$view-$mode.png"
      pw screenshot "$sel" --filename="$f" >/dev/null 2>&1 || { echo "FAIL $f" >&2; rc=1; continue; }
      note=""; [ "$got" != "$mode" ] && note="  (style forces $got mode)"
      echo "$f$note"
    done
  done
done
exit $rc
