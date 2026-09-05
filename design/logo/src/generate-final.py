#!/usr/bin/env python3
"""Final: all-white mark, no red, plus a macOS-native app icon.

The icon follows Apple's Big Sur template -- the shape is a superellipse
(not a rounded rectangle) at 824/1024 with the canvas padding Apple leaves
for shadow, so it sits correctly beside every other icon in the dock.
"""
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))
C = 256.0
WHITE = "#FFFFFF"
INK = "#121212"


def pol(r, deg, cx=C, cy=C):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def radial(n, r0, r1, w, col, start=-90.0, cap="round"):
    o = []
    for i in range(n):
        d = start + i * 360.0 / n
        x0, y0 = pol(r0, d); x1, y1 = pol(r1, d)
        o.append(f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" '
                 f'stroke="{col}" stroke-width="{w}" stroke-linecap="{cap}"/>')
    return "\n    ".join(o)


def mark(col, n=8, rim_r=138.0, rim_w=22.0, spoke_w=13.0, handle_w=18.0,
         handle_out=58.0, hub=36.0):
    """One colour throughout. Rim heaviest, handles medium, spokes lightest."""
    return f"""<g>
    {radial(n, rim_r, rim_r + handle_out, handle_w, col)}
    <circle cx="{C}" cy="{C}" r="{rim_r}" fill="none" stroke="{col}" stroke-width="{rim_w}"/>
    {radial(n, hub - 4, rim_r, spoke_w, col, cap="butt")}
    <circle cx="{C}" cy="{C}" r="{hub}" fill="{col}"/>
  </g>"""


# ------------------------------------------------------------- wordmark ----
CAP, S, TRACK, MIDY = 120.0, 26.0, 26.0, 47.0


def _H(x): return (f'<rect x="{x}" y="0" width="{S}" height="{CAP}"/>'
                   f'<rect x="{x+70}" y="0" width="{S}" height="{CAP}"/>'
                   f'<rect x="{x}" y="{MIDY}" width="96" height="{S}"/>'), 96.0


def _E(x): return (f'<rect x="{x}" y="0" width="{S}" height="{CAP}"/>'
                   f'<rect x="{x}" y="0" width="84" height="{S}"/>'
                   f'<rect x="{x}" y="{MIDY}" width="72" height="{S}"/>'
                   f'<rect x="{x}" y="{CAP-S}" width="84" height="{S}"/>'), 84.0


def _L(x): return (f'<rect x="{x}" y="0" width="{S}" height="{CAP}"/>'
                   f'<rect x="{x}" y="{CAP-S}" width="78" height="{S}"/>'), 78.0


def _M(x):
    p = (f"M {x} {CAP} L {x} 0 L {x+32} 0 L {x+62} 74 L {x+92} 0 L {x+124} 0 "
         f"L {x+124} {CAP} L {x+98} {CAP} L {x+98} 58 L {x+74} 102 L {x+50} 102 "
         f"L {x+26} 58 L {x+26} {CAP} Z")
    return f'<path d="{p}"/>', 124.0


def wordmark(col):
    parts, x = [], 0.0
    for fn in (_H, _E, _L, _M):
        b, w = fn(x); parts.append(b); x += w + TRACK
    return f'<g fill="{col}">' + "".join(parts) + "</g>", x - TRACK


def svg(body, w, h, extra=""):
    return ('<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{extra}\n  {body}\n</svg>\n')


def lockup_h(col):
    ms = 0.62; mh = 512 * ms; gap = 44.0
    wm, wmw = wordmark(col)
    return svg(f'<g transform="scale({ms})">{mark(col)}</g>'
               f'<g transform="translate({mh+gap:.2f},{(mh-CAP)/2:.2f})">{wm}</g>',
               mh + gap + wmw, mh)


def lockup_stack(col):
    ms = 0.72; mh = 512 * ms; gap = 40.0
    wm, wmw = wordmark(col)
    return svg(f'<g transform="translate({(wmw-mh)/2:.2f},0) scale({ms})">{mark(col)}</g>'
               f'<g transform="translate(0,{mh+gap:.2f})">{wm}</g>', wmw, mh + gap + CAP)


# ------------------------------------------------------- macOS app icon ----
def superellipse(cx, cy, a, b, n=5.0, steps=240):
    """Apple's squircle is a superellipse, not a rounded rect."""
    pts = []
    e = 2.0 / n
    for i in range(steps):
        t = 2 * math.pi * i / steps
        ct, st = math.cos(t), math.sin(t)
        x = cx + a * math.copysign(abs(ct) ** e, ct)
        y = cy + b * math.copysign(abs(st) ** e, st)
        pts.append(f"{x:.2f} {y:.2f}")
    return "M " + " L ".join(pts) + " Z"


def app_icon(top, bottom, mark_col, name, tint_edge=None):
    """1024 canvas, 824 squircle -- Apple's Big Sur proportions."""
    body = superellipse(512, 512, 412, 412)
    scale = 824 * 0.70 / 512
    tx = 512 - (512 * scale) / 2
    edge = tint_edge or top
    defs = f"""
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{top}"/>
      <stop offset="1" stop-color="{bottom}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.10"/>
      <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>"""
    inner = f"""
  <path d="{body}" fill="url(#bg)"/>
  <path d="{body}" fill="url(#sheen)"/>
  <path d="{superellipse(512, 512, 410, 410)}" fill="none" stroke="{edge}" stroke-opacity="0.55" stroke-width="2"/>
  <g transform="translate({tx:.2f},{tx:.2f}) scale({scale:.4f})">{mark(mark_col, rim_w=30, spoke_w=19, handle_w=25, hub=44, handle_out=56)}</g>"""
    open(os.path.join(OUT, name), "w").write(svg(inner, 1024, 1024, defs))


# white mark, dark ground -- the release icon
app_icon("#3A3A40", "#141417", WHITE, "icon-release.svg", tint_edge="#5A5A62")
# debug build: same shape, cooler slate so it is obvious which is which
app_icon("#2E4A63", "#101C26", WHITE, "icon-debug.svg", tint_edge="#4E7A9E")
# flat black alternative, no gradient
app_icon("#141417", "#141417", WHITE, "icon-flat.svg", tint_edge="#2E2E34")
# light alternative: ink mark on near-white
app_icon("#FFFFFF", "#EDEBE7", INK, "icon-light.svg", tint_edge="#D8D4CE")

for tone, col in (("white", WHITE), ("ink", INK)):
    open(os.path.join(OUT, f"m6-mark-{tone}.svg"), "w").write(svg(mark(col), 512, 512))
    wm, w = wordmark(col)
    open(os.path.join(OUT, f"m6-word-{tone}.svg"), "w").write(svg(wm, w, CAP))
    open(os.path.join(OUT, f"m6-lockup-{tone}.svg"), "w").write(lockup_h(col))
    open(os.path.join(OUT, f"m6-stack-{tone}.svg"), "w").write(lockup_stack(col))

print("ok")
