#!/bin/sh
# Собирает исходники из src/ в один самодостаточный файл dist/index.html
set -e
cd "$(dirname "$0")"
mkdir -p dist
{
  cat src/head.html
  printf '<script>\n'
  cat src/data.js src/i18n.js src/app1.js src/app2.js src/app3.js src/app4.js src/app5.js
  printf '\n</script>\n</body>\n</html>\n'
} > dist/index.html
wc -c dist/index.html
