// ── Print template: A4, binding-friendly mirrored margins, Bangla-first ──

#let bn-serif = ("Noto Serif Bengali", "Noto Serif", "DejaVu Serif")
#let bn-sans  = ("Noto Sans Bengali", "Noto Sans", "DejaVu Sans")
#let mono     = ("DejaVu Sans Mono", "Noto Mono", "Liberation Mono")

#let book(title: "", subtitle: "", volume: "", body) = {
  set document(title: title)

  set page(
    paper: "a4",
    // binding side gets the wider margin; mirrored on double-sided print
    margin: (inside: 1.25in, outside: 0.75in, top: 0.85in, bottom: 0.85in),
    numbering: "1",
    number-align: center,
    binding: left,
  )

  set text(font: bn-serif, size: 11.5pt, lang: "bn")
  set par(justify: false, leading: 0.78em, spacing: 1.05em)

  // Headings
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    block(above: 0em, below: 1.1em)[
      #set text(font: bn-sans, size: 21pt, weight: "bold")
      #it.body
    ]
    line(length: 100%, stroke: 0.8pt + luma(40))
    v(0.6em)
  }
  show heading.where(level: 2): it => block(above: 1.6em, below: 0.85em)[
    #set text(font: bn-sans, size: 15pt, weight: "bold")
    #it.body
  ]
  show heading.where(level: 3): it => block(above: 1.3em, below: 0.7em)[
    #set text(font: bn-sans, size: 12.5pt, weight: "bold")
    #it.body
  ]

  // Code / journal blocks — light box, B&W friendly
  show raw.where(block: true): it => block(
    width: 100%,
    fill: luma(246),
    stroke: 0.5pt + luma(190),
    inset: 9pt,
    radius: 2pt,
    breakable: true,
  )[#set text(font: mono, size: 8.6pt); #set par(leading: 0.62em); #it]

  show raw.where(block: false): it => box(
    fill: luma(240), inset: (x: 2.5pt, y: 0pt), outset: (y: 2.5pt), radius: 2pt,
  )[#set text(font: mono, size: 9.2pt); #it]

  // Tables — clean borders for print
  set table(stroke: 0.5pt + luma(140), inset: 6pt)
  show table.cell.where(y: 0): set text(weight: "bold")

  // Title page
  align(center + horizon)[
    #set text(font: bn-sans)
    #if volume != "" [#text(size: 13pt, fill: luma(90))[#volume] #v(0.6em)]
    #text(size: 30pt, weight: "bold")[#title]
    #if subtitle != "" [#v(0.8em) #text(size: 14pt, fill: luma(70))[#subtitle]]
  ]
  pagebreak()

  outline(title: [সূচিপত্র], depth: 2, indent: 1.2em)

  body
}

#let callout(body) = block(
  width: 100%, inset: 9pt, radius: 2pt,
  fill: luma(248), stroke: (left: 2.5pt + luma(90)),
)[#body]
