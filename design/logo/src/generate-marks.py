#!/usr/bin/env python3
"""Ten minimal directions. Rule for every one: if a shape can be removed and
the idea survives, remove it."""
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))
RED = "#E5322D"
C = 256.0


def pol(r, d, cx=C, cy=C):
    a = math.radians(d)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def arc(r, a0, a1, w, col, cx=C, cy=C, cap="round", large=None, sweep=1):
    x0, y0 = pol(r, a0, cx, cy)
    x1, y1 = pol(r, a1, cx, cy)
    if large is None:
        large = 1 if (a1 - a0) % 360 > 180 else 0
    return (f'<path d="M {x0:.2f} {y0:.2f} A {r} {r} 0 {large} {sweep} {x1:.2f} {y1:.2f}" '
            f'fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="{cap}"/>')


def rays(n, r0, r1, w, col, start=-90.0, cap="round"):
    o = []
    for i in range(n):
        d = start + i * 360.0 / n
        x0, y0 = pol(r0, d); x1, y1 = pol(r1, d)
        o.append(f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" '
                 f'stroke="{col}" stroke-width="{w}" stroke-linecap="{cap}"/>')
    return "\n  ".join(o)


def svg(b):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
            f'width="512" height="512">\n  {b}\n</svg>\n')


# 01 TRIAD - the wheel at its irreducible minimum: three spokes
def triad(k):
    return f"""{rays(3, 0, 198, 26, k, start=-90)}
  <circle cx="256" cy="256" r="140" fill="none" stroke="{k}" stroke-width="30"/>
  <circle cx="256" cy="256" r="34" fill="{RED}"/>"""


# 02 CARDINAL - ring plus four external nubs on the diagonals
def cardinal(k):
    return f"""{rays(4, 140, 196, 28, k, start=-45)}
  <circle cx="256" cy="256" r="140" fill="none" stroke="{k}" stroke-width="32"/>
  <circle cx="256" cy="256" r="36" fill="{RED}"/>"""


# 03 BEARING - an open ring; the red dot is the heading you are holding
def bearing(k):
    mx, my = pol(150, 0)
    return f"""{arc(150, 34, -34, 40, k, large=1)}
  <circle cx="{mx:.2f}" cy="{my:.2f}" r="42" fill="{RED}"/>"""




# 06 HEADING - a chevron holding a course inside the ring
def heading(k):
    return f"""<circle cx="256" cy="256" r="152" fill="none" stroke="{k}" stroke-width="32"/>
  <path d="M 214 176 L 316 256 L 214 336" fill="none" stroke="{RED}" stroke-width="36"
        stroke-linecap="round" stroke-linejoin="round"/>"""




# 09 NEEDLE - a compass needle alone; no ring at all
def needle(k):
    return f"""<path d="M 256 74 L 322 256 L 190 256 Z" fill="{RED}"/>
  <path d="M 256 438 L 190 256 L 322 256 Z" fill="{k}"/>"""


# 10 SPOKES - rim deleted; the circle survives in negative space
def spokes(k):
    return f"""{rays(8, 118, 186, 26, k, start=-90)}
  <circle cx="256" cy="256" r="44" fill="{RED}"/>"""

# 04 DIAL - a ring and one red tick: the setting you are holding
def trim(k):
    x0, y0 = pol(150, -90); x1, y1 = pol(212, -90)
    return f"""<circle cx="256" cy="256" r="150" fill="none" stroke="{k}" stroke-width="32"/>
  <line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" stroke="{RED}" stroke-width="32" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="38" fill="{k}"/>"""


# 05 SEGMENT - the rim broken into four arcs; the wheel implied by the gaps
def yaw(k):
    segs = "\n  ".join(arc(150, s + 12, s + 78, 34, k, large=0) for s in (-90, 0, 90, 180))
    return f"""{segs}
  <circle cx="256" cy="256" r="44" fill="{RED}"/>"""


# 07 SPLIT - one disc, halved and shifted: a turn caught mid-way
def notch(k):
    return f"""<path d="M 248 96 A 160 160 0 0 0 248 416 Z" fill="{k}"/>
  <path d="M 264 128 A 160 160 0 0 1 264 448 Z" fill="{RED}"/>"""


# 08 GATE - the H opened up, red bar floating free
def crossbar(k):
    return f"""<rect x="146" y="120" width="48" height="272" rx="24" fill="{k}"/>
  <rect x="318" y="120" width="48" height="272" rx="24" fill="{k}"/>
  <rect x="206" y="232" width="100" height="48" rx="24" fill="{RED}"/>"""


ALL = [("01-triad", triad), ("02-cardinal", cardinal), ("03-bearing", bearing),
       ("04-trim", trim), ("05-yaw", yaw), ("06-heading", heading),
       ("07-notch", notch), ("08-crossbar", crossbar), ("09-needle", needle),
       ("10-spokes", spokes)]

for name, fn in ALL:
    for tone, ink in (("light", "#121212"), ("dark", "#F2EFEC")):
        open(os.path.join(OUT, f"m5-{name}-{tone}.svg"), "w").write(svg(fn(ink)))
print("wrote", len(ALL))
