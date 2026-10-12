import math, sys, random
from reportlab.graphics.barcode import qrencoder as q
URL=sys.argv[1]; out=sys.argv[2]; mode=sys.argv[3]; RIMC=sys.argv[4]
qr=q.QRCode(6, q.QRErrorCorrectLevel.H); qr.addData(URL); qr.make(); N=qr.getModuleCount()
INK="#1A1035"; PINK="#FF3D8B"; CORAL="#FF6B4A"; SUN="#FFC53D"; LIME="#B8F23C"; TEAL="#1FD1B9"; SKY="#3FA9FF"; VIOLET="#8B5CFF"; RED="#FF3355"
PAL=[PINK,CORAL,SUN,LIME,TEAL,SKY,VIOLET]
C=500; QS=392; m=QS/(N+8); h=QS/2; x0=C-h+4*m; y0=x0
def finder(r,c): return (r<7 and c<7) or (r<7 and c>=N-7) or (r>=N-7 and c<7)
lz=4.6; cz=(N-1)/2
mods="".join(f'<rect x="{x0+c*m:.2f}" y="{y0+r*m:.2f}" width="{m*1.002:.2f}" height="{m*1.002:.2f}"/>'
   for r in range(N) for c in range(N) if not finder(r,c) and not (abs(r-cz)<=lz and abs(c-cz)<=lz) and qr.isDark(r,c))
def eye(r,c,col):
    x=x0+c*m; y=y0+r*m
    return (f'<rect x="{x+m*.5:.2f}" y="{y+m*.5:.2f}" width="{m*6:.2f}" height="{m*6:.2f}" rx="{m*.5:.2f}" fill="none" stroke="{INK}" stroke-width="{m:.2f}"/>'
            f'<rect x="{x+m*2:.2f}" y="{y+m*2:.2f}" width="{m*3:.2f}" height="{m*3:.2f}" rx="{m*.3:.2f}" fill="{col}"/>')
eyes=eye(0,0,"#C2185B")+eye(0,N-7,"#5B2BD6")+eye(N-7,0,"#0B7F70")
lr=m*3.9
def seg(r,a1,a2,col):
    a1r,a2r=math.radians(a1),math.radians(a2)
    return f'<path d="M0 0L{r*math.cos(a1r):.2f} {r*math.sin(a1r):.2f}A{r:.2f} {r:.2f} 0 0 1 {r*math.cos(a2r):.2f} {r*math.sin(a2r):.2f}Z" fill="{col}"/>'
mark=(f'<g transform="translate({C},{C})"><circle r="{lr+m*.7:.2f}" fill="#fff"/><circle r="{lr:.2f}" fill="{PINK}"/>'
      +seg(lr,-90,-18,SUN)+seg(lr,-18,54,TEAL)+seg(lr,54,126,VIOLET)+seg(lr,126,198,CORAL)+
      f'<circle r="{lr*.6:.2f}" fill="{INK}"/><path d="M{-lr*.2:.2f} {-lr*.3:.2f}V{lr*.3:.2f}L{lr*.32:.2f} 0Z" fill="#fff"/></g>')

# ---------- bold, grown-up party icons (48 box) ----------
W='#FFFFFF'
def martini(c): return f'<path d="M7 9h34L24 27z" fill="{c}"/><path d="M24 27v12M16 40h16" stroke="{W}" stroke-width="2.6" stroke-linecap="round"/><circle cx="33" cy="10" r="4.2" fill="{LIME}"/><path d="M14 13h20" stroke="{W}" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>'
def highball(c): return f'<path d="M13 11h22l-2.5 31h-17z" fill="{c}"/><path d="M28 3l-4 22" stroke="{W}" stroke-width="2.4" stroke-linecap="round"/><circle cx="34" cy="12" r="5.5" fill="{SUN}"/><rect x="17" y="18" width="6" height="6" rx="1.5" fill="{W}" fill-opacity=".6"/><rect x="24" y="25" width="6" height="6" rx="1.5" fill="{W}" fill-opacity=".45"/>'
def coupes(c): return (f'<g transform="rotate(-14 16 24)"><path d="M5 12h20c0 7-4.5 11-10 11S5 19 5 12z" fill="{c}"/><path d="M15 23v12M10 36h10" stroke="{W}" stroke-width="2.4" stroke-linecap="round"/></g>'
                       f'<g transform="rotate(14 32 24)"><path d="M23 12h20c0 7-4.5 11-10 11s-10-4-10-11z" fill="{SUN}"/><path d="M33 23v12M28 36h10" stroke="{W}" stroke-width="2.4" stroke-linecap="round"/></g>'
                       f'<path d="M24 4v4M19 6l2 3M29 6l-2 3" stroke="{W}" stroke-width="2" stroke-linecap="round"/>')
def note(c): return f'<path d="M15 13l22-5v24a6 6 0 1 1-4-5.6V15l-14 3.2V36a6 6 0 1 1-4-5.6z" fill="{c}"/>'
def quaver(c): return f'<path d="M21 7h4v27a7 7 0 1 1-4-6.3z" fill="{c}"/><path d="M25 7c3 4 11 6 11 14-2-4-6-6-11-6z" fill="{c}"/>'
def mic(c): return f'<rect x="17" y="5" width="14" height="20" rx="7" fill="{c}"/><path d="M11 21a13 13 0 0 0 26 0M24 34v8M17 43h14" fill="none" stroke="{W}" stroke-width="2.6" stroke-linecap="round"/><path d="M20 11h8M20 16h8" stroke="{W}" stroke-opacity=".6" stroke-width="1.8" stroke-linecap="round"/>'
def disco(c):
    g=f'<circle cx="24" cy="26" r="16" fill="{c}"/>'
    for i in range(-3,4):
        g+=f'<path d="M{24-16} {26+i*4.6}h32" stroke="{INK}" stroke-opacity=".25" stroke-width="1"/>'
    g+=f'<path d="M24 10c-6 5-6 27 0 32M24 10c6 5 6 27 0 32M14 13c-3 7-3 19 0 26M34 13c3 7 3 19 0 26" fill="none" stroke="{INK}" stroke-opacity=".25" stroke-width="1"/>'
    g+=f'<rect x="15" y="17" width="5" height="5" fill="{W}" fill-opacity=".85"/><rect x="21" y="14" width="4" height="4" fill="{W}" fill-opacity=".6"/><path d="M24 3v7" stroke="{W}" stroke-width="2"/>'
    return g
def heart(c): return f'<path fill="{c}" d="M24 41S6 30.5 6 18.5A9 9 0 0 1 24 14.6 9 9 0 0 1 42 18.5C42 30.5 24 41 24 41z"/><path d="M12.5 17.5a5 5 0 0 1 5-4" stroke="{W}" stroke-opacity=".7" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
def dice(c): return f'<rect x="8" y="8" width="32" height="32" rx="8" fill="{c}" transform="rotate(12 24 24)"/><g transform="rotate(12 24 24)" fill="{W}"><circle cx="16" cy="16" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="32" cy="16" r="3"/><circle cx="16" cy="32" r="3"/></g>'
def cards(c): return f'<rect x="7" y="11" width="21" height="29" rx="4" fill="{W}" transform="rotate(-14 17 25)"/><rect x="20" y="8" width="21" height="29" rx="4" fill="{c}" transform="rotate(10 30 22)"/><path transform="rotate(10 30 22)" d="M30.5 27s-6-3.6-6-7.6a3 3 0 0 1 6-.9 3 3 0 0 1 6 .9c0 4-6 7.6-6 7.6z" fill="{W}"/>'
def sparkle(c): return f'<path fill="{c}" d="M24 4c2 11 9 18 20 20-11 2-18 9-20 20-2-11-9-18-20-20 11-2 18-9 20-20z"/>'
def star(c): return f'<path fill="{c}" d="M24 4l6 12.2 13.4 2-9.7 9.4 2.3 13.4L24 34.7 12 41l2.3-13.4-9.7-9.4 13.4-2z"/>'
def balloon(c): return f'<ellipse cx="24" cy="18" rx="11" ry="13.5" fill="{c}"/><path d="M22 31.5h4l-2-3z" fill="{c}"/><path d="M24 32c-3 4 3 6 0 11" fill="none" stroke="{W}" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="19.5" cy="12.5" rx="2.8" ry="4.5" fill="{W}" fill-opacity=".5"/>'
def icecream(c): return f'<path d="M15 22h18l-9 22z" fill="{SUN}"/><path d="M17 26l12 6M19 33l8 4" stroke="{INK}" stroke-opacity=".25" stroke-width="1.5"/><circle cx="18" cy="18" r="7.5" fill="{c}"/><circle cx="30" cy="18" r="7.5" fill="{PINK if c!=PINK else TEAL}"/><circle cx="24" cy="11" r="7.5" fill="{W}"/><circle cx="24" cy="4.5" r="2.8" fill="{RED}"/>'
def popper(c): return f'<path d="M8 42l8-24 14 14z" fill="{c}"/><path d="M11 33l4 4M13 26l9 9" stroke="{W}" stroke-opacity=".7" stroke-width="2"/><circle cx="34" cy="10" r="2.6" fill="{SUN}"/><circle cx="40" cy="20" r="2.4" fill="{TEAL}"/><path d="M26 8q4 4 1 9M33 24q5-1 8 3" stroke="{PINK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="36" y="4" width="4" height="4" fill="{LIME}" transform="rotate(30 38 6)"/>'
SET=[(martini,9),(highball,8),(coupes,6),(note,8),(quaver,6),(mic,6),(disco,5),(heart,8),(dice,5),(cards,4),(sparkle,7),(star,4),(balloon,4),(icecream,3),(popper,4)]
bag=[f for f,w in SET for _ in range(w)]

random.seed(23)
OUT=470; QZ=h+8
def in_zone(x,y,s):
    r=math.hypot(x-C,y-C)
    if r+s*0.5>OUT: return False
    if abs(x-C)<QZ+s*0.5 and abs(y-C)<QZ+s*0.5: return False
    if C-118-s*.5<x<C+118+s*.5 and 140-s*.5<y<262+s*.5: return False
    ang=(math.degrees(math.atan2(x-C,-(y-C)))+360)%360
    if r+s*0.5>374 and (ang<66 or ang>294): return False
    if r+s*0.5>392 and 116<ang<244: return False
    return True
placed=[]; tries=0
while tries<150000 and len(placed)<34:
    tries+=1
    x=random.uniform(30,970); y=random.uniform(30,970)
    dq=max(abs(x-C),abs(y-C))-QZ; t=max(0,min(1,dq/120))
    s=34+30*t+random.uniform(-4,4)
    if not in_zone(x,y,s): continue
    if any((x-px)**2+(y-py)**2<((s+ps)/2*1.55)**2 for px,py,ps,_ in placed): continue
    placed.append((x,y,s,t))
icons=""; last=None
for x,y,s,t in placed:
    f=random.choice(bag)
    c=random.choice([p for p in PAL if p!=last]); last=c
    op=0.22+0.78*t**0.8
    icons+=f'<g opacity="{op:.2f}" transform="translate({x:.1f} {y:.1f}) rotate({random.uniform(-25,25):.0f}) scale({s/48:.3f}) translate(-24 -24)">{f(c)}</g>'
# confetti specks
conf=""
for i in range(36):
    x=random.uniform(40,960); y=random.uniform(40,960)
    if not in_zone(x,y,6): continue
    c=random.choice(PAL); a=random.uniform(0,180)
    conf+= (f'<rect x="{x-4:.1f}" y="{y-1.6:.1f}" width="8" height="3.2" rx="1.6" fill="{c}" opacity=".8" transform="rotate({a:.0f} {x:.1f} {y:.1f})"/>' if i%2 else f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{c}" opacity=".8"/>')
if mode=="template":
    vl=(f'<rect x="{C-108}" y="148" width="216" height="104" rx="18" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-dasharray="8 7"/>'
        f'<text x="{C}" y="207" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="700" font-size="20" letter-spacing="4" fill="#fff" fill-opacity=".8">VENUE LOGO</text>')
else:
    vl=(f'<g transform="translate({C} 200)"><circle cx="-74" cy="0" r="32" fill="#fff"/>'
        f'<path d="M-74 -18c9 10 11 16 5 25a9 9 0 0 1-13 0c-5-7-1-13 3-18 1 6 3 8 5 8-1-6-1-10 0-15z" fill="{CORAL}"/>'
        f'<text x="-32" y="-3" font-family="Inter Display, Inter, sans-serif" font-weight="800" font-size="30" fill="#fff">Ember</text>'
        f'<text x="-32" y="24" font-family="Inter Display, Inter, sans-serif" font-weight="500" font-size="17" letter-spacing="3" fill="#fff" fill-opacity=".75">&amp; DATE</text></g>')
tr=414; br=436
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
<defs><path id="top" d="M{C-tr} {C}A{tr} {tr} 0 0 1 {C+tr} {C}"/><path id="bot" d="M{C-br} {C}A{br} {br} 0 0 0 {C+br} {C}"/>
<radialGradient id="bg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#2E1A5E"/><stop offset="1" stop-color="#140B2C"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{PINK}"/><stop offset=".25" stop-color="{SUN}"/><stop offset=".5" stop-color="{TEAL}"/><stop offset=".75" stop-color="{SKY}"/><stop offset="1" stop-color="{VIOLET}"/></linearGradient>
<linearGradient id="hot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{SUN}"/><stop offset=".5" stop-color="{CORAL}"/><stop offset="1" stop-color="{PINK}"/></linearGradient>
<filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="60"/></filter>
<clipPath id="clip"><circle cx="{C}" cy="{C}" r="500"/></clipPath></defs>
<circle cx="{C}" cy="{C}" r="500" fill="url(#bg)"/>
<g clip-path="url(#clip)"><g filter="url(#blur)" opacity=".55"><circle cx="190" cy="250" r="160" fill="{PINK}"/><circle cx="820" cy="260" r="150" fill="{SKY}"/><circle cx="830" cy="760" r="160" fill="{SUN}"/><circle cx="170" cy="760" r="150" fill="{TEAL}"/></g>{conf}{icons}</g>
<circle cx="{C}" cy="{C}" r="489" fill="none" stroke="{RIMC}" stroke-width="16"/>
<rect x="{C-h-9}" y="{C-h-9}" width="{QS+18}" height="{QS+18}" rx="34" fill="{RIMC}"/>
<rect x="{C-h}" y="{C-h}" width="{QS}" height="{QS}" rx="26" fill="#fff"/>
<g fill="{INK}">{mods}</g>{eyes}{mark}
{vl}
<text font-family="Inter Display, Inter, sans-serif" font-weight="900" font-size="58" fill="#fff" letter-spacing="5"><textPath href="#top" startOffset="50%" text-anchor="middle">PLAY AT THE TABLE</textPath></text>
<text font-family="Inter Display, Inter, sans-serif" font-weight="800" font-size="38" fill="{SUN}" letter-spacing="5"><textPath href="#bot" startOffset="50%" text-anchor="middle">SCAN HERE TO HAVE FUN</textPath></text>
</svg>'''
open(out,"w").write(svg); print(len(placed),"icons")
