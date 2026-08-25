#!/usr/bin/env python3
"""Convert this project's chapter Markdown into Typst markup for print."""
import re, sys, pathlib

SPECIAL = "\\#$@*_`<>~"

def esc(s):
    return "".join("\\" + c if c in SPECIAL else c for c in s)

def inline(s):
    """Markdown inline -> Typst, protecting code spans."""
    spans, out = [], []
    i = 0
    while i < len(s):
        if s[i] == "`":
            j = s.find("`", i + 1)
            if j != -1:
                spans.append(s[i + 1:j])
                out.append(f"\x00{len(spans)-1}\x00")
                i = j + 1
                continue
        out.append(s[i]); i += 1
    s = "".join(out)

    s = esc(s)
    # links -> plain text (page numbers matter in print, not URLs)
    s = re.sub(r"\\\[([^\]]*)\\\]\(([^)]*)\)", r"\1", s)
    s = re.sub(r"\\\*\\\*(.+?)\\\*\\\*", r"*\1*", s)      # bold
    s = re.sub(r"\\\*(.+?)\\\*", r"_\1_", s)                # italic *x*
    s = re.sub(r"(?<!\\)\\_(.+?)\\_", r"_\1_", s)          # italic _x_

    for n, code in enumerate(spans):
        s = s.replace(f"\x00{n}\x00", "`" + code.replace("`", "") + "`")
    return s

def split_row(line):
    line = line.strip()
    if line.startswith("|"): line = line[1:]
    if line.endswith("|"): line = line[:-1]
    return [c.strip() for c in line.split("|")]

def convert(md):
    lines = md.split("\n")
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]

        # fenced code
        if ln.lstrip().startswith("```"):
            i += 1
            buf = []
            while i < len(lines) and not lines[i].lstrip().startswith("```"):
                buf.append(lines[i]); i += 1
            i += 1
            body = "\n".join(buf)
            fence = "`" * max(3, (max((len(m) for m in re.findall(r"`+", body)), default=0) + 1))
            out.append(f"{fence}\n{body}\n{fence}\n")
            continue

        # table
        if ln.strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            header = split_row(ln)
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i])); i += 1
            n = len(header)
            cells = ["  " + ", ".join(f"[{inline(c)}]" for c in header)]
            for r in rows:
                r = (r + [""] * n)[:n]
                cells.append("  " + ", ".join(f"[{inline(c)}]" for c in r))
            out.append(
                "#table(\n  columns: " + str(n) + ",\n" + ",\n".join(cells) + ",\n)\n"
            )
            continue

        # headings
        m = re.match(r"^(#{1,4})\s+(.*)$", ln)
        if m:
            out.append("=" * len(m.group(1)) + " " + inline(m.group(2)) + "\n")
            i += 1
            continue

        # blockquote (possibly multi-line)
        if ln.startswith(">"):
            buf = []
            while i < len(lines) and (lines[i].startswith(">") or (buf and lines[i].strip() == "" and i + 1 < len(lines) and lines[i + 1].startswith(">"))):
                buf.append(re.sub(r"^>\s?", "", lines[i])); i += 1
            out.append("#callout[\n" + convert("\n".join(buf)) + "]\n")
            continue

        # horizontal rule
        if re.match(r"^\s*---+\s*$", ln):
            out.append("#v(0.4em) #line(length: 100%, stroke: 0.4pt + luma(170)) #v(0.4em)\n")
            i += 1
            continue

        # lists
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", ln)
        if m:
            indent, marker, text = m.groups()
            bullet = "+" if marker[0].isdigit() else "-"
            out.append(f"{indent}{bullet} {inline(text)}")
            i += 1
            continue

        out.append(inline(ln) if ln.strip() else "")
        i += 1

    return "\n".join(out)

def main():
    src, dst, title, subtitle, volume = sys.argv[1:6]
    md = pathlib.Path(src).read_text(encoding="utf-8")
    body = convert(md)
    header = (
        '#import "book.typ": book, callout\n'
        f'#show: book.with(title: "{title}", subtitle: "{subtitle}", volume: "{volume}")\n\n'
    )
    pathlib.Path(dst).write_text(header + body, encoding="utf-8")

if __name__ == "__main__":
    main()
