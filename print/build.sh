#!/usr/bin/env bash
# Build print-ready PDFs from chapter Markdown.
#   ./print/build.sh            → all written chapters
#   ./print/build.sh <ch-dir>   → one chapter
set -euo pipefail
cd "$(dirname "$0")"

TYPST="${TYPST:-$HOME/.local/bin/typst}"
BOOK="../app/accounting/book"
OUT="out"; mkdir -p "$OUT"

build() {
  local dir="$1" name; name="$(basename "$dir")"
  echo "→ $name"
  python3 md2typ.py "$dir/page.md" "$OUT/$name.typ" \
    "Accounting for Software Development" \
    "Volume 1 · Part 1 — Fundamentals" "নমুনা অধ্যায়"
  cp book.typ "$OUT/"
  "$TYPST" compile "$OUT/$name.typ" "$OUT/$name.pdf"
  echo "  $OUT/$name.pdf"
}

if [ $# -gt 0 ]; then build "$BOOK/$1"; else
  for d in "$BOOK"/*/; do [ -f "$d/page.md" ] && build "${d%/}"; done
fi
