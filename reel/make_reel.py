#!/usr/bin/env python3
"""
TIGER / JAILER 2  -  procedural 2D-vector style Instagram Reel generator
=========================================================================
Pure code (numpy + OpenCV + Pillow + ffmpeg). 1080x1920, 60 fps, 9 s.
Motion blur = temporal super-sampling (shutter angle configurable).

Usage
-----
    python3 make_reel.py                      # full render -> out/jailer2_reel.mp4
    python3 make_reel.py --preview 0.9,1.3,4,7.5   # dump still PNGs to out/preview
    python3 make_reel.py --samples 3          # faster / lower motion-blur quality

Everything you are likely to change lives in CONFIG below.
"""
import os, sys, math, wave, struct, argparse, subprocess
import multiprocessing as mp
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

# =============================================================================
#  CONFIG  -  edit freely
# =============================================================================
CONFIG = dict(
    # ---- output -------------------------------------------------------------
    OUTPUT_PATH   = "out/jailer2_reel.mp4",
    WIDTH=1080, HEIGHT=1920, FPS=60, DURATION=9.0,
    MOTION_BLUR_SAMPLES = 5,       # sub-frames per frame (higher = smoother blur, slower)
    SHUTTER             = 0.65,    # 1.0 = 360deg shutter, 0.5 = classic 180deg
    CRF                 = 16,      # x264 quality (lower = better/larger)
    WORKERS             = 0,       # 0 = all CPU cores

    # ---- text ---------------------------------------------------------------
    TITLE_LINE      = "TIGER",                  # scene 2, big gold
    SUBTITLE_LINES  = ["MUTHUVEL", "PANDIAN"],  # scene 2, gold, below
    MOVIE_TITLE_1   = "JAILER",                 # scene 3, drops first
    MOVIE_TITLE_2   = "2",                      # scene 3, slams second
    TAGLINE         = "THE HUNT BEGINS",        # small line at the very end ("" to disable)
    FONT_GOLD       = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    FONT_TITLE      = "/usr/share/fonts/opentype/inter/Inter-Black.otf",
    FONT_TAGLINE    = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf",

    # ---- assets -------------------------------------------------------------
    # Hero photo/silhouette. PNG with transparency is best; otherwise GrabCut
    # tries to cut out the subject. If the file is missing, a placeholder
    # silhouette is generated so the reel still renders.
    PHOTO_PATH      = "assets/hero.png",
    PHOTO_MAX_W     = 900,
    PHOTO_MAX_H     = 1060,
    PHOTO_CENTER_Y  = 0.40,         # fraction of frame height
    # Music. If the file is missing an original synthesised score is used.
    AUDIO_PATH      = "assets/one_sun_one_moon.mp3",
    AUDIO_START     = 0.0,          # seconds into the song to start from
    AUDIO_VOLUME    = 1.0,
    FADE_OUT        = 0.25,         # fade video+audio to black/silence at end

    # ---- palette (RGB 0-255) -----------------------------------------------
    NEON_RED        = (255, 22, 48),
    GOLD_STOPS      = [(0.00, (255, 238, 160)), (0.34, (238, 178, 52)),
                       (0.50, (118, 68, 10)),   (0.63, (252, 208, 92)),
                       (1.00, (148, 88, 18))],
    GOLD_GLOW       = (255, 190, 70),
    TITLE_STOPS     = [(0.00, (255, 248, 226)), (0.30, (255, 160, 48)),
                       (0.58, (226, 36, 16)),   (1.00, (96, 0, 8))],
    TITLE_GLOW      = (255, 50, 24),
    AURA_STOPS      = [(0.00, (0, 0, 0)), (0.22, (110, 0, 4)), (0.48, (225, 26, 10)),
                       (0.74, (255, 128, 22)), (1.00, (255, 232, 160))],

    # ---- timeline (seconds) -------------------------------------------------
    T_SLASH     = 1.15,   # sword slash
    T_S2        = 3.00,   # TIGER starts slamming in
    T_SUB       = (4.15, 4.45),   # subtitle line 1 / 2
    T_CRACK     = 5.78,   # background starts to crack
    T_S3        = 6.00,   # shatter + zoom
    T_PHOTO     = 6.25,   # hero fades in
    T_AURA      = 6.45,   # aura ignites
    T_LAND_1    = 7.35,   # JAILER impact
    T_LAND_2    = 7.85,   # "2" impact
    T_TAGLINE   = 8.35,
)
# =============================================================================

F32 = np.float32
C = CONFIG
W, H, FPS, DUR = C["WIDTH"], C["HEIGHT"], C["FPS"], C["DURATION"]
HW, HH = W // 2, H // 2
HERE = os.path.dirname(os.path.abspath(__file__))

def P(path):                       # resolve relative to the script
    return path if os.path.isabs(path) else os.path.join(HERE, path)

# ---------------------------------------------------------------- easing -----
def cl(x, a=0.0, b=1.0): return min(max(x, a), b)
def e_out_cubic(x): x = cl(x); return 1 - (1 - x) ** 3
def e_in_cubic(x): x = cl(x); return x ** 3
def e_out_expo(x): x = cl(x); return 1.0 if x >= 1 else 1 - 2 ** (-10 * x)
def smooth(x): x = cl(x); return x * x * (3 - 2 * x)
def sstep(a, b, x): return smooth((x - a) / (b - a))
def lerp(a, b, k): return a + (b - a) * k
def mix(c0, c1, k): return tuple(lerp(a, b, k) for a, b in zip(c0, c1))
def col(c, g=1.0): return np.array(c, F32) / 255.0 * g

# ------------------------------------------------------------- noise utils ----
def fbm(h, w, rng, sig=((40, 1.0), (14, 0.6), (5, 0.3)), tile=False):
    acc = np.zeros((h, w), F32)
    for s, a in sig:
        n = rng.standard_normal((h, w)).astype(F32)
        if tile:
            n = np.tile(n, (3, 3)); n = cv2.GaussianBlur(n, (0, 0), s)[h:2 * h, w:2 * w]
        else:
            n = cv2.GaussianBlur(n, (0, 0), s)
        acc += a * n / (n.std() + 1e-6)
    acc /= acc.std() + 1e-6
    return np.clip(acc * 0.22 + 0.5, 0, 1).astype(F32)

# --------------------------------------------------------- warp / composite ---
def warp(src, cx, cy, sx, sy=None, rot=0.0):
    """Affine-place `src` (centre) at (cx,cy). Returns (x0,y0,x1,y1,img) clipped to frame."""
    sy = sx if sy is None else sy
    h, w = src.shape[:2]
    a = math.radians(rot); c, s = math.cos(a), math.sin(a)
    A = np.array([[c * sx, -s * sy], [s * sx, c * sy]], np.float64)
    t = np.array([cx, cy]) - A @ np.array([w / 2, h / 2])
    cor = np.array([[0, 0], [w, 0], [0, h], [w, h]], np.float64) @ A.T + t
    x0 = max(0, int(math.floor(cor[:, 0].min()))); x1 = min(W, int(math.ceil(cor[:, 0].max())))
    y0 = max(0, int(math.floor(cor[:, 1].min()))); y1 = min(H, int(math.ceil(cor[:, 1].max())))
    if x1 <= x0 or y1 <= y0: return None
    M = np.hstack([A, (t - [x0, y0])[:, None]]).astype(F32)
    out = cv2.warpAffine(src, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    if out.ndim == 2: out = out[..., None]
    return x0, y0, x1, y1, out

def vblur(img, n):
    n = int(n) | 1
    if n < 3: return img
    k = np.ones((n, 1), F32) / n
    return cv2.filter2D(img, -1, k, borderType=cv2.BORDER_CONSTANT)

def over(frame, w, gain=1.0):                 # premultiplied RGBA warp -> frame
    if w is None: return
    x0, y0, x1, y1, im = w
    roi = frame[y0:y1, x0:x1]
    roi *= (1 - im[..., 3:4] * gain); roi += im[..., :3] * gain

def add(frame, w, color, gain=1.0):           # 1/2-channel warp -> additive tint
    if w is None: return
    x0, y0, x1, y1, im = w
    frame[y0:y1, x0:x1] += im[..., :1] * (np.asarray(color, F32) * gain)

def add_half(frame, half):
    frame += cv2.resize(half, (W, H), interpolation=cv2.INTER_LINEAR)

# ------------------------------------------------------------- text layers ----
def gradient(stops, v):
    pos = [s[0] for s in stops]
    return np.stack([np.interp(v, pos, [s[1][i] / 255.0 for s in stops]) for i in range(3)], -1).astype(F32)

def build_text(text, font_path, target_w, stretch_y, stops, tracking=0.02, pad=110, seed=0,
               grit=0.30, outline=5, outline_col=(16, 7, 2), bevel=1.0, per_char=False):
    """Returns dict(layers=[...]) - one layer per char (or one for the whole string)."""
    size = 200
    for _ in range(2):
        f = ImageFont.truetype(font_path, size)
        total = sum(f.getlength(ch) for ch in text) + tracking * size * (len(text) - 1)
        size = int(size * target_w / total)
    f = ImageFont.truetype(font_path, size)
    x0b, y0b, x1b, y1b = f.getbbox(text, anchor="ls")
    cw = int(sum(f.getlength(ch) for ch in text) + tracking * size * (len(text) - 1)) + 2 * pad
    chh = (y1b - y0b) + 2 * pad
    base_y = pad - y0b
    masks, x = [], float(pad)
    for ch in text:
        im = Image.new("L", (cw, chh), 0)
        ImageDraw.Draw(im).text((x, base_y), ch, font=f, fill=255, anchor="ls")
        masks.append(np.asarray(im, F32) / 255.0)
        x += f.getlength(ch) + tracking * size
    full = np.clip(np.max(masks, 0), 0, 1)
    if stretch_y != 1.0:
        nh = int(chh * stretch_y)
        full = cv2.resize(full, (cw, nh), interpolation=cv2.INTER_CUBIC)
        masks = [cv2.resize(m, (cw, nh), interpolation=cv2.INTER_CUBIC) for m in masks]
        chh = nh
    full = np.clip(full, 0, 1); masks = [np.clip(m, 0, 1) for m in masks]
    rng = np.random.default_rng(seed)
    ys = np.where(full.max(1) > 0.5)[0]; y0, y1 = ys.min(), ys.max()
    v = np.clip((np.arange(chh) - y0) / max(1, (y1 - y0)), 0, 1)
    base = gradient(stops, v)[:, None, :] * np.ones((1, cw, 1), F32)
    # gritty texture: coarse mottling + fine speckle + scratches
    coarse = fbm(chh, cw, rng, sig=((22, 1.0), (7, 0.7)))
    speck = cv2.GaussianBlur(rng.standard_normal((chh, cw)).astype(F32), (0, 0), 0.9)
    speck = np.clip(speck / speck.std(), -3, 3) * 0.33
    scr = np.zeros((chh, cw), F32)
    for _ in range(int(cw / 6)):
        x = rng.uniform(0, cw); y = rng.uniform(0, chh); L = rng.uniform(12, 60)
        a = rng.normal(0.9, 0.35)
        cv2.line(scr, (int(x), int(y)), (int(x + L * math.cos(a)), int(y + L * math.sin(a))), 1.0, 1, cv2.LINE_AA)
    scr = cv2.GaussianBlur(scr, (0, 0), 0.6)
    tex = 1.0 - grit * (0.9 * (1 - coarse) ** 1.5 + 0.55 * np.clip(-speck, 0, 1)) + 0.10 * np.clip(speck, 0, 1) - 0.28 * scr
    mb = cv2.GaussianBlur(full, (0, 0), 2.4)
    gx = cv2.Sobel(mb, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(mb, cv2.CV_32F, 0, 1, ksize=3)
    shade = 1.0 + bevel * np.clip(-(gx * 0.7 + gy * 0.9) * 2.4, -0.55, 0.55)
    rgb = np.clip(base * (tex * shade)[..., None], 0, 1.3)
    dark = col(outline_col)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (outline * 2 + 1, outline * 2 + 1))
    groups = masks if per_char else [full]
    layers = []
    for m in groups:
        stroke = np.clip(cv2.GaussianBlur(cv2.dilate(m, k), (0, 0), 0.9), 0, 1)
        body = np.concatenate([rgb * m[..., None] + dark * (stroke - m)[..., None], stroke[..., None]], -1)
        inner = m * np.clip(cv2.GaussianBlur(1 - m, (0, 0), 11) * 1.9, 0, 1)
        halo = cv2.GaussianBlur(stroke, (0, 0), 30)
        xs = np.where(stroke.max(0) > 0.01)[0]
        xa, xb = max(0, xs.min() - pad), min(cw, xs.max() + pad + 1)
        fx = np.stack([inner, halo], -1)
        layers.append(dict(body=np.ascontiguousarray(body[:, xa:xb]), fx=np.ascontiguousarray(fx[:, xa:xb]),
                           ox=(xa + xb) / 2 - cw / 2, w=xb - xa, h=chh))
    return dict(layers=layers, w=cw, h=chh)

def draw_text_layer(frame, L, cx, cy, sx, sy, rot=0.0, alpha=1.0, halo=1.0, inner=0.0,
                    halo_col=(255, 190, 70), inner_col=(255, 220, 120), blur_v=0):
    if alpha <= 0.002: return
    body = warp(L["body"], cx, cy, sx, sy, rot)
    fxw = warp(L["fx"], cx, cy, sx, sy, rot)
    if body is not None and blur_v >= 3:
        x0, y0, x1, y1, im = body; body = (x0, y0, x1, y1, vblur(im, blur_v))
    if fxw is not None:
        x0, y0, x1, y1, im = fxw
        if blur_v >= 3: im = vblur(im, blur_v)
        roi = frame[y0:y1, x0:x1]
        roi += (im[..., 1:2] * np.asarray(halo_col, F32) / 255.0) * (halo * alpha)
    if body is not None:
        x0, y0, x1, y1, im = body
        if inner > 0 and fxw is not None:
            fim = fxw[4] if blur_v < 3 else vblur(fxw[4], blur_v)
            im = im.copy()
            im[..., :3] += fim[..., 0:1] * (np.asarray(inner_col, F32) / 255.0) * inner * im[..., 3:4]
        over(frame, (x0, y0, x1, y1, im), alpha)

# --------------------------------------------------------------- particles ----
class Particles:
    def __init__(s, n, seed):
        r = np.random.default_rng(seed); s.n = n
        s.x0 = r.uniform(0, W, n); s.y0 = r.uniform(0, H + 160, n)
        s.depth = r.random(n); s.v = r.uniform(45, 200, n) * (0.5 + s.depth)
        s.size = r.uniform(1.0, 3.6, n); s.amp = r.uniform(6, 55, n); s.f = r.uniform(0.15, 0.55, n)
        s.ph = r.uniform(0, 6.28, n); s.fl = r.uniform(1.5, 5.5, n); s.fph = r.uniform(0, 6.28, n)
        s.hue = r.random(n)

    def draw(s, buf, t, pal, density=1.0, speed=1.0, bright=1.0):
        n = int(s.n * density)
        x = s.x0[:n] + s.amp[:n] * np.sin(6.283 * s.f[:n] * t + s.ph[:n])
        y = (s.y0[:n] - s.v[:n] * speed * t) % (H + 160) - 80
        b = (0.55 + 0.45 * np.sin(s.fl[:n] * t + s.fph[:n])) * (0.30 + 0.70 * s.depth[:n]) * bright
        edge = np.clip(np.minimum(y + 80, H + 80 - y) / 200.0, 0, 1)
        b = b * edge
        for i in range(n):
            if b[i] < 0.02: continue
            d = s.depth[i]
            r = s.size[i] * (0.45 + 1.8 * d ** 3) * 0.5
            c = np.asarray(mix(pal[0], pal[1], s.hue[i]), F32) / 255.0 * b[i]
            if d > 0.86: c = c * 0.45                       # soft bokeh discs
            cv2.circle(buf, (int(x[i] * 8), int(y[i] * 8)), int(max(r, 0.5) * 16), (float(c[0]), float(c[1]), float(c[2])),
                       -1, cv2.LINE_AA, 4)

def glow_of(buf, s1=3.0, s2=9.0, g1=1.1, g2=1.2):
    return buf + cv2.GaussianBlur(buf, (0, 0), s1) * g1 + cv2.GaussianBlur(buf, (0, 0), s2) * g2

class Sparks:
    def __init__(s, n, seed, origin, t0, speed, angle_rng, life=(0.5, 1.1), grav=1800.0, jitter_t0=0.0, size=(1.2, 2.8)):
        r = np.random.default_rng(seed); s.n = n
        s.o = np.asarray(origin, np.float64)[None, :] if np.ndim(origin) == 1 else np.asarray(origin, np.float64)
        a = r.uniform(angle_rng[0], angle_rng[1], n); sp = r.uniform(speed[0], speed[1], n)
        s.v = np.stack([np.cos(a) * sp, np.sin(a) * sp], 1)
        s.t0 = t0 + r.uniform(0, jitter_t0, n) if np.ndim(t0) == 0 else np.asarray(t0)
        s.life = r.uniform(*life, n); s.g = grav; s.size = r.uniform(*size, n); s.hue = r.random(n)

    def draw(s, buf, t, pal, gain=1.0):
        for i in range(s.n):
            u = t - s.t0[i]
            if u < 0 or u > s.life[i]: continue
            o = s.o[min(i, len(s.o) - 1)]
            x = o[0] + s.v[i, 0] * u; y = o[1] + s.v[i, 1] * u + 0.5 * s.g * u * u
            k = (1 - u / s.life[i]) ** 1.6 * gain
            c = np.asarray(mix(pal[0], pal[1], s.hue[i]), F32) / 255.0 * k
            cv2.circle(buf, (int(x * 8), int(y * 8)), int(s.size[i] * 8), (float(c[0]), float(c[1]), float(c[2])), -1, cv2.LINE_AA, 4)

# ----------------------------------------------------------------- hero -------
def procedural_silhouette(w, h):
    """Placeholder bust silhouette (used only when PHOTO_PATH is missing)."""
    S = 2
    im = Image.new("L", (w * S, h * S), 0); d = ImageDraw.Draw(im)
    cx = w * S // 2
    d.ellipse([cx - 235 * S, h * S - 520 * S, cx + 235 * S, h * S + 480 * S], fill=255)           # shoulders
    d.rectangle([cx - 90 * S, 300 * S, cx + 90 * S, h * S - 380 * S], fill=255)                    # neck
    d.ellipse([cx - 360 * S, h * S - 560 * S, cx + 360 * S, h * S + 300 * S], fill=255)
    d.rounded_rectangle([cx - 430 * S, h * S - 470 * S, cx + 430 * S, h * S], radius=160 * S, fill=255)
    d.ellipse([cx - 150 * S, 110 * S, cx + 150 * S, 420 * S], fill=255)                            # head
    d.pieslice([cx - 168 * S, 80 * S, cx + 168 * S, 400 * S], 180, 360, fill=255)                  # hair
    d.polygon([(cx - 150 * S, 190 * S), (cx - 205 * S, 120 * S), (cx - 90 * S, 100 * S)], fill=255)
    d.polygon([(cx + 150 * S, 190 * S), (cx + 205 * S, 120 * S), (cx + 90 * S, 100 * S)], fill=255)
    m = np.asarray(im.resize((w, h), Image.LANCZOS), F32) / 255.0
    yy = np.linspace(0, 1, h, dtype=F32)[:, None]; xx = np.linspace(-1, 1, w, dtype=F32)[None, :]
    shade = 0.10 + 0.08 * (1 - yy) + 0.06 * np.clip(xx, -1, 1)
    rgb = np.repeat(shade[..., None], 3, -1) * np.array([1.0, 0.8, 0.8], F32)
    return rgb, m

def load_hero():
    mw, mh = C["PHOTO_MAX_W"], C["PHOTO_MAX_H"]
    path = P(C["PHOTO_PATH"])
    if os.path.isfile(path):
        im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        if im is not None:
            if im.ndim == 2: im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
            if im.shape[2] == 3: im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
            k = min(mw / im.shape[1], mh / im.shape[0])
            im = cv2.resize(im, (int(im.shape[1] * k), int(im.shape[0] * k)), interpolation=cv2.INTER_AREA)
            alpha = im[..., 3]
            if alpha.min() > 250:                                   # opaque -> try GrabCut cut-out
                print("  hero: no alpha channel, running GrabCut cut-out...")
                bgr = np.ascontiguousarray(im[..., :3]); h, w = bgr.shape[:2]
                mask = np.zeros((h, w), np.uint8); rect = (int(w * .06), int(h * .03), int(w * .88), int(h * .95))
                cv2.grabCut(bgr, mask, rect, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_RECT)
                alpha = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
                alpha = cv2.GaussianBlur(alpha, (0, 0), 1.5)
            a = alpha.astype(F32) / 255.0
            rgb = cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2RGB).astype(F32) / 255.0
            rgb = np.clip((rgb - 0.08) * 1.25, 0, 1) * 0.82 * np.array([1.0, 0.84, 0.82], F32)   # noir-red grade
            return rgb, a
    print("  hero: %s not found -> using placeholder silhouette" % C["PHOTO_PATH"])
    return procedural_silhouette(780, 1000)

# ------------------------------------------------------------ static assets ---
G = {}

def build_assets():
    print("building assets ...")
    rng = np.random.default_rng(11)
    # half-res coordinate grids
    yy, xx = np.mgrid[0:HH, 0:HW].astype(F32)
    G["X"], G["Y"] = xx * 2, yy * 2
    r = np.sqrt(((G["X"] - W / 2) / (W * 0.72)) ** 2 + ((G["Y"] - H * 0.48) / (H * 0.62)) ** 2)
    G["V"] = np.clip(1.12 - r ** 1.7, 0, 1)
    G["Gbot"] = np.exp(-((G["Y"] - H * 1.04) / (H * 0.34)) ** 2) * (0.6 + 0.4 * np.exp(-((G["X"] - W * 0.5) / (W * 0.8)) ** 2))
    G["Gc_title"] = np.exp(-(((G["X"] - W / 2) / (W * 0.55)) ** 2 + ((G["Y"] - H * 0.47) / (H * 0.30)) ** 2))
    G["Gc_hero"] = np.exp(-(((G["X"] - W / 2) / (W * 0.50)) ** 2 + ((G["Y"] - H * 0.40) / (H * 0.30)) ** 2))
    G["theta"] = np.arctan2(G["Y"] - H * 0.42, G["X"] - W / 2)
    G["rad"] = np.sqrt((G["X"] - W / 2) ** 2 + (G["Y"] - H * 0.42) ** 2)
    G["fog"] = fbm(HH, HW, rng, sig=((60, 1.0), (22, 0.6)), tile=True)
    G["fog2"] = fbm(HH, HW, rng, sig=((34, 1.0), (12, 0.6)), tile=True)
    # final-frame vignette + grain
    yf, xf = np.mgrid[0:H, 0:W].astype(F32)
    rr = np.sqrt(((xf - W / 2) / (W * 0.78)) ** 2 + ((yf - H / 2) / (H * 0.70)) ** 2)
    G["VIG"] = np.clip(1.08 - 0.55 * rr ** 2.2, 0.35, 1.0)[..., None]
    G["GRAIN"] = [cv2.resize(rng.standard_normal((H // 2, W // 2)).astype(F32), (W, H)) for _ in range(6)]
    # particles
    G["pS1"] = Particles(150, 3); G["pS2"] = Particles(150, 5)
    # text layers
    G["tiger"] = build_text(C["TITLE_LINE"], C["FONT_GOLD"], 880, 1.55, C["GOLD_STOPS"], tracking=0.035, seed=1,
                            grit=0.34, per_char=True)
    G["subs"] = [build_text(s, C["FONT_GOLD"], 720, 1.35, C["GOLD_STOPS"], tracking=0.05, seed=2 + i, grit=0.30, outline=4)
                 for i, s in enumerate(C["SUBTITLE_LINES"])]
    G["t1"] = build_text(C["MOVIE_TITLE_1"], C["FONT_TITLE"], 950, 1.5, C["TITLE_STOPS"], tracking=0.01, seed=9, grit=0.22,
                         outline=7, outline_col=(10, 0, 2))
    G["t2"] = build_text(C["MOVIE_TITLE_2"], C["FONT_TITLE"], 210, 1.5, C["TITLE_STOPS"], seed=10, grit=0.22,
                         outline=7, outline_col=(10, 0, 2))
    if C["TAGLINE"]:
        G["tag"] = build_text(C["TAGLINE"], C["FONT_TAGLINE"], 700, 1.0, C["GOLD_STOPS"], tracking=0.18, pad=60, seed=12,
                              grit=0.1, outline=2, bevel=0.5)
    # hero + aura
    rgb, a = load_hero(); ph, pw = a.shape
    G["hero_wh"] = (pw, ph)
    dist = cv2.distanceTransform((a > 0.5).astype(np.uint8), cv2.DIST_L2, 5).astype(F32)
    G["hero_rim"] = np.exp(-dist / 15.0) * (a > 0.5)
    G["hero_rgb"], G["hero_a"] = rgb, a
    m = 260                                           # aura margin (full-res px)
    ah, aw = (ph + 2 * m) // 2, (pw + 2 * m) // 2
    M = np.zeros((ah, aw), F32); M[m // 2:m // 2 + ph // 2, m // 2:m // 2 + pw // 2] = cv2.resize(a, (pw // 2, ph // 2))
    G["aura_M"] = M
    G["aura_G"] = [cv2.GaussianBlur(M, (0, 0), s) for s in (9, 26, 58)]
    G["aura_rim"] = np.clip(cv2.GaussianBlur(M, (0, 0), 2.2) - M * 0.78, 0, 1)
    ay, ax = np.mgrid[0:ah, 0:aw].astype(F32); G["aura_xy"] = (ax, ay)
    G["aura_N"] = [fbm(ah, aw, rng, sig=((26, 1.0), (10, 0.5)), tile=True) for _ in range(2)] + \
                  [fbm(ah, aw, rng, sig=((9, 1.0), (4, 0.7)), tile=True)]
    lut = gradient(C["AURA_STOPS"], np.linspace(0, 1, 256))
    G["aura_lut"] = (lut * 255).astype(np.uint8)[None, :, :]
    # shatter
    build_shards()
    G["snap"] = None
    print("assets ready")

def build_shards():
    rng = np.random.default_rng(21); K = 46
    c0 = np.array([W * 0.5, H * 0.46])
    ang = rng.uniform(0, 6.283, K); rad = (rng.random(K) ** 1.6) * 1700 + 20
    seeds = np.stack([c0[0] + rad * np.cos(ang), c0[1] + rad * np.sin(ang)], 1).astype(F32)
    nz = [cv2.resize(fbm(H // 8, W // 8, rng, sig=((10, 1.0), (4, 0.6))), (W, H)) for _ in range(2)]
    lab = np.zeros((H, W), np.int16)
    xs = np.arange(W, dtype=F32)[None, :]
    for y0 in range(0, H, 96):
        y1 = min(H, y0 + 96)
        yy = np.arange(y0, y1, dtype=F32)[:, None]
        px = xs + (nz[0][y0:y1] - 0.5) * 110; py = yy + (nz[1][y0:y1] - 0.5) * 110
        d = (px[..., None] - seeds[:, 0]) ** 2 + (py[..., None] - seeds[:, 1]) ** 2
        lab[y0:y1] = np.argmin(d, -1)
    edge = ((lab != np.roll(lab, 1, 0)) | (lab != np.roll(lab, 1, 1))).astype(np.uint8)
    edge = cv2.dilate(edge, np.ones((3, 3), np.uint8)).astype(F32)
    G["lab"] = lab; G["K"] = K
    G["edge"] = cv2.GaussianBlur(edge, (0, 0), 1.2)
    G["edge_half"] = cv2.resize(edge, (HW, HH), interpolation=cv2.INTER_AREA)
    info = []
    for k in range(K):
        ys, xs_ = np.nonzero(lab == k)
        if len(ys) == 0: info.append(None); continue
        bx0, bx1, by0, by1 = xs_.min(), xs_.max() + 1, ys.min(), ys.max() + 1
        cen = np.array([xs_.mean(), ys.mean()])
        dv = cen - c0; dist = np.linalg.norm(dv) + 1e-3
        info.append(dict(box=(bx0, by0, bx1, by1), cen=cen, dir=dv / dist, dist=dist,
                         spd=rng.uniform(380, 900) + 700 / (1 + dist / 260), spin=rng.uniform(-1, 1) * 150,
                         grow=rng.uniform(0.15, 0.9), delay=dist / 7000.0 + rng.uniform(0, 0.03),
                         fade=rng.uniform(0.85, 1.2)))
    G["shards"] = info

def make_shard_crops(snap):
    out = []
    for k, inf in enumerate(G["shards"]):
        if inf is None: out.append(None); continue
        x0, y0, x1, y1 = inf["box"]
        m = (G["lab"][y0:y1, x0:x1] == k).astype(F32)
        m = cv2.GaussianBlur(m, (0, 0), 0.8)
        rgb = snap[y0:y1, x0:x1] + G["edge"][y0:y1, x0:x1, None] * np.array([1.0, 0.12, 0.10], F32) * 0.9
        out.append(np.concatenate([rgb * m[..., None], m[..., None]], -1).astype(F32))
    return out

# -------------------------------------------------------------- scene bits ----
SEEDS_SLASH = None

def slash_geometry():
    return np.array([W * 1.10, H * 0.17]), np.array([-W * 0.10, H * 0.83])

def shake(t):
    dx = dy = ang = 0.0
    for tk, a in ((C["T_S3"], 26.0), (C["T_LAND_1"], 38.0), (C["T_LAND_2"], 60.0)):
        d = t - tk
        if d < 0: continue
        env = math.exp(-d * 6.2)
        dx += a * env * (0.6 * math.sin(63 * d) + 0.4 * math.sin(97 * d + 1.0))
        dy += a * env * (0.6 * math.sin(71 * d + 2.0) + 0.4 * math.sin(113 * d))
        ang += 0.045 * a * env * math.sin(53 * d + 0.5)
    return dx, dy, ang

def camera(frame, scale, dx=0.0, dy=0.0, ang=0.0):
    if abs(scale - 1) < 1e-4 and abs(dx) + abs(dy) + abs(ang) < 1e-3: return frame
    M = cv2.getRotationMatrix2D((W / 2, H / 2), ang, scale); M[0, 2] += dx; M[1, 2] += dy
    return cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def bg_frame(t, scene):
    """scene weights: tuple (s1,s2,s3). Half-res background, upsampled."""
    s1, s2, s3 = scene
    base = col((8, 10, 20), 1) * s1 + col((16, 10, 6)) * s2 + col((22, 4, 6)) * s3
    bot = col((120, 8, 26), 0.75) * s1 + col((170, 90, 14), 0.75) * s2 + col((200, 20, 10), 0.5) * s3
    cen = col((230, 140, 25), 0.24) * s2 * (0.85 + 0.15 * math.sin(t * 5.4)) + col((230, 24, 14), 0.42) * s3 * (0.88 + 0.12 * math.sin(t * 9))
    fogc = col((90, 20, 40), 0.20) * s1 + col((150, 90, 20), 0.14) * s2 + col((170, 30, 20), 0.22) * s3
    fog = np.roll(G["fog"], -int(t * 14), 0) * 0.55 + np.roll(G["fog2"], (-int(t * 26), int(t * 9)), (0, 1)) * 0.45
    b = G["V"][..., None] * base + G["Gbot"][..., None] * bot + G["Gc_title"][..., None] * cen * (s2) \
        + G["Gc_hero"][..., None] * (col((230, 24, 14), 0.20) * s3 * (0.88 + 0.12 * math.sin(t * 9))) \
        + (fog * G["V"])[..., None] * fogc
    return cv2.resize(b.astype(F32), (W, H), interpolation=cv2.INTER_LINEAR)

def draw_slash(frame, half, t):
    T = C["T_SLASH"]
    if t < T: return
    P0, P1 = slash_geometry()
    d = P1 - P0; Ln = np.linalg.norm(d); nrm = np.array([-d[1], d[0]]) / Ln
    hp = e_out_expo((t - T) / 0.17)
    late = max(0.0, t - T - 0.05)
    wmax = 3.2 + 15.0 * math.exp(-late * 3.0)
    gi = 0.40 + 0.60 * math.exp(-max(0, t - T) * 2.0)
    if t > C["T_S2"]: gi = lerp(gi, 0.30, sstep(C["T_S2"], C["T_S2"] + .4, t))
    gi *= 0.92 + 0.08 * math.sin(t * 57)
    n = 56; s = np.linspace(0, 1, n)
    pts = P0 + d * (s * hp)[:, None]
    prof = np.sin(np.pi * s) ** 0.55
    def poly(wm, scale):
        w = prof * wm
        L = (pts + nrm * w[:, None] / 2) * scale; R = (pts - nrm * w[:, None] / 2) * scale
        return np.concatenate([L, R[::-1]]).astype(np.float32)
    k = 16
    # full-res core (neon body + white-hot centre)
    body = np.zeros((H, W), np.uint8); hot = np.zeros((H, W), np.uint8)
    cv2.fillPoly(body, [np.round(poly(wmax, 1) * k).astype(np.int32)], 255, cv2.LINE_AA, 4)
    cv2.fillPoly(hot, [np.round(poly(wmax * 0.42, 1) * k).astype(np.int32)], 255, cv2.LINE_AA, 4)
    frame += (body.astype(F32) / 255.0)[..., None] * col(C["NEON_RED"], 1.15)
    frame += (hot.astype(F32) / 255.0)[..., None] * col((255, 215, 215), 1.0)
    # glow into half-res
    g = np.zeros((HH, HW), np.uint8)
    cv2.fillPoly(g, [np.round(poly(wmax * 1.6, 0.5) * k).astype(np.int32)], 255, cv2.LINE_AA, 4)
    gf = g.astype(F32) / 255.0
    q = cv2.GaussianBlur(gf, (0, 0), 7) * 1.6 + cv2.GaussianBlur(gf, (0, 0), 22) * 2.4
    q += cv2.GaussianBlur(cv2.resize(gf, (HW // 2, HH // 2), interpolation=cv2.INTER_AREA), (0, 0), 20) \
        .repeat(2, 0).repeat(2, 1)[:HH, :HW] * 2.2
    half += q[..., None] * col(C["NEON_RED"], gi * 0.85)
    # slash flash
    fl = math.exp(-max(0, t - T - 0.09) * 13) if t > T + 0.09 else 0
    if fl > 0.01: half += fl * col((120, 10, 20), 0.55)

def draw_god_rays(half, t, strength):
    if strength <= 0.01: return
    th, rad = G["theta"], G["rad"]
    a = (0.5 + 0.5 * np.sin(13 * th + t * 0.55)) * (0.5 + 0.5 * np.sin(7 * th - t * 0.38 + 1.3))
    rays = (a ** 2.2) * np.exp(-rad / (H * 0.55))
    half += rays[..., None] * col(C["GOLD_GLOW"], 0.38 * strength)

# ------------------------------------------------------------ scene renders ---
def render_old(t, extras=True):
    """Scenes 1+2 (0..6 s), with camera push. Returns float RGB frame."""
    s2 = sstep(C["T_S2"] - 0.05, C["T_S2"] + 0.35, t)
    frame = bg_frame(t, (1 - s2, s2, 0.0))
    half = np.zeros((HH, HW, 3), F32)
    # particles (embers -> gold dust)
    pb = np.zeros((HH, HW, 3), F32)
    pal = (mix(((255, 70, 55), (255, 30, 60)), ((255, 205, 100), (255, 150, 40)), s2)[0], mix(((255, 70, 55), (255, 30, 60)), ((255, 205, 100), (255, 150, 40)), s2)[1]) \
        if False else (mix((255, 80, 60), (255, 215, 110), s2), mix((255, 30, 60), (255, 150, 40), s2))
    G["pS1"].draw(pb, t, pal, bright=1.0 + 0.4 * s2)
    # slash sparks
    if t >= C["T_SLASH"]:
        P0, P1 = slash_geometry(); ns = 70; r = np.random.default_rng(31)
        sk = r.uniform(0.08, 0.97, ns); org = P0 + (P1 - P0) * sk[:, None]
        sp = Sparks(ns, 32, org, C["T_SLASH"] + 0.17 * sk ** 0.7, (80, 700), (0, 6.283), life=(0.45, 1.2), grav=700)
        sp.draw(pb, t, ((255, 230, 190), (255, 70, 60)))
    half += glow_of(pb)
    draw_slash(frame, half, t)
    draw_god_rays(half, t, sstep(C["T_S2"], C["T_S2"] + 0.8, t))
    add_half(frame, half)
    # ---------------- scene 2 text
    u = t - C["T_S2"]
    if u > -0.1:
        pulse = 0.62 + 0.38 * math.sin(2 * math.pi * t * 0.95)
        breathe = 1 + 0.010 * math.sin(2 * math.pi * t * 0.8)
        T = G["tiger"]; cy0 = H * 0.385
        for i, L in enumerate(T["layers"]):
            st = 0.04 + 0.085 * i; p = (u - st) / 0.5
            if p <= 0: continue
            e = e_out_expo(p); ec = e_out_cubic(p)
            sc = 1 + (1 - e) * 1.9
            land = u - st - 0.5
            boost = 1.0 + (3.0 * math.exp(-land * 7.0) if land > 0 else 0)
            offx = L["ox"] * breathe * 1.0
            draw_text_layer(frame, L, W / 2 + offx * sc * 0 + offx, cy0 + (1 - e) * -90, sc * breathe, sc * breathe,
                            rot=(1 - e) * (-7 if i % 2 else 7), alpha=cl(p * 2.6), halo=0.42 * pulse * boost + 0.12,
                            inner=0.16 + 0.16 * pulse + (1.4 * math.exp(-land * 8) if land > 0 else 0),
                            halo_col=C["GOLD_GLOW"], blur_v=0)
        # divider line
        dv = e_out_expo((u - 1.0) / 0.7)
        if dv > 0:
            y = int(H * 0.512); half_w = int(330 * dv)
            ln = np.zeros((10, 2 * half_w + 2, 3), F32) if half_w > 2 else None
            if ln is not None:
                xs = np.linspace(-1, 1, ln.shape[1], dtype=F32); prof = np.clip(1 - np.abs(xs) ** 1.5, 0, 1)
                ln[3:6] = (prof[None, :, None] * col((255, 215, 110), 1.2))
                ln = cv2.GaussianBlur(ln, (0, 0), 1.0)
                gl = cv2.GaussianBlur(ln, (0, 0), 9) * 2.2
                x0 = W // 2 - ln.shape[1] // 2
                frame[y - 5:y + 5, x0:x0 + ln.shape[1]] += ln + gl[:, :, :]
        # subtitle lines
        for i, L in enumerate(G["subs"]):
            ts = C["T_SUB"][min(i, 1)] - C["T_S2"]; p = (u - ts) / 0.62
            if p <= 0: continue
            e = e_out_expo(p); side = -1 if i % 2 == 0 else 1
            yc = H * (0.575 + 0.067 * i)
            land = u - ts - 0.62
            draw_text_layer(frame, L["layers"][0], W / 2 + side * (1 - e) * 420, yc, breathe, breathe, alpha=cl(p * 3),
                            halo=0.32 * pulse + 0.10 + (0.9 * math.exp(-land * 7) if land > 0 else 0),
                            inner=0.14 + 0.14 * pulse, halo_col=C["GOLD_GLOW"], blur_v=0)
    # camera: slow push + pre-shatter punch
    z = 1 + 0.035 * (t / 6.0) + 0.09 * e_in_cubic((t - C["T_CRACK"]) / (C["T_S3"] - C["T_CRACK"]))
    if t < 0.6: frame *= smooth(t / 0.6)
    frame = camera(frame, z, ang=0.25 * math.sin(t * 0.7))
    if extras and t >= C["T_CRACK"]:
        # glowing cracks spreading from the impact point
        rv = e_out_cubic((t - C["T_CRACK"]) / 0.2) * 1700
        cmask = (G["rad_c"] < rv).astype(F32) * G["edge_half"]
        hb = (cmask[..., None] * col((255, 40, 30), 2.2)).astype(F32)
        hb = hb + cv2.GaussianBlur(hb, (0, 0), 6) * 2.0
        add_half(frame, hb)
        fl = sstep(C["T_S3"] - 0.07, C["T_S3"], t) * 0.5
        frame += fl * col((255, 120, 100))
    return frame

OLD_CAM_END = None

def hero_world(t):
    """Scene 3 background + hero + aura (no title)."""
    frame = bg_frame(t, (0.0, 0.0, 1.0))
    half = np.zeros((HH, HW, 3), F32)
    pb = np.zeros((HH, HW, 3), F32)
    G["pS2"].draw(pb, t, ((255, 130, 40), (255, 40, 24)), density=1.0, speed=1.5, bright=1.3)
    half += glow_of(pb)
    # diagonal light streaks
    ph = G["theta"] * 0
    add_half(frame, half)
    # hero
    cx, cy = W / 2, H * C["PHOTO_CENTER_Y"]
    pw, phh = G["hero_wh"]
    pa = e_out_cubic((t - C["T_PHOTO"]) / 0.6)
    ign = e_out_cubic((t - C["T_AURA"]) / 0.9)
    sc = lerp(1.14, 1.0, e_out_expo((t - C["T_PHOTO"]) / 0.9)) * (1 + 0.006 * math.sin(t * 2.2))
    yoff = (1 - e_out_cubic((t - C["T_PHOTO"]) / 0.8)) * 90
    if pa > 0.003:
        # ----- aura (half-res)
        Gs = G["aura_G"]; ax, ay = G["aura_xy"]; N1, N2, N3 = G["aura_N"]
        s1 = np.roll(N1, -int(t * 150), 0); s2 = np.roll(N2, (-int(t * 95), int(t * 40)), (0, 1))
        s3 = np.roll(N3, -int(t * 260), 0)
        base = 1.45 * Gs[0] + 0.85 * Gs[1] + 0.45 * Gs[2]
        mapx = ax + (s1 - 0.5) * 80; mapy = ay + (s2 - 0.5) * 80 + 34
        fl = cv2.remap(base, mapx.astype(F32), mapy.astype(F32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        f = np.clip((fl * (0.55 + 0.95 * s3) - 0.20) * 1.45, 0, 1) * ign * (0.92 + 0.08 * math.sin(t * 11))
        idx = np.clip(f * 255, 0, 255).astype(np.uint8)
        aura = cv2.LUT(cv2.merge([idx, idx, idx]), G["aura_lut"]).astype(F32) / 255.0
        aura += G["aura_rim"][..., None] * col((255, 205, 150), 0.8) * ign
        aura += cv2.GaussianBlur(aura, (0, 0), 10) * 0.3
        ww = warp(np.concatenate([aura, aura[..., :1] * 0], -1), cx, cy + yoff, 2 * sc, 2 * sc)
        if ww is not None:
            x0, y0, x1, y1, im = ww; frame[y0:y1, x0:x1] += im[..., :3] * pa
        # ----- photo
        flick = 0.85 + 0.15 * math.sin(t * 17) + 0.08 * math.sin(t * 31 + 1)
        rim = G["hero_rim"][..., None] * np.array([1.0, 0.30, 0.10], F32) * (1.0 * flick * ign + 0.15)
        rgb = G["hero_rgb"] + rim * G["hero_a"][..., None]
        top = np.clip(1 - np.linspace(0, 1, phh, dtype=F32) * 1.4, 0, 1)[:, None, None] * np.array([0.30, 0.04, 0.02], F32) * ign
        rgb = rgb + top * G["hero_a"][..., None]
        im4 = np.concatenate([rgb * G["hero_a"][..., None], G["hero_a"][..., None]], -1)
        over(frame, warp(im4, cx, cy + yoff, sc, sc), pa)
    return frame

def render_titles(frame, t):
    """Scene 3 title drops. Draws onto frame (in world space, before camera shake)."""
    fx = np.zeros((HH, HW, 3), F32)
    for key, land, ypos, scl, order in (("t1", C["T_LAND_1"], H * 0.69, 1.0, 1), ("t2", C["T_LAND_2"], H * 0.885, 1.0, 2)):
        L = G[key]["layers"][0]
        dur = 0.27; t0 = land - dur
        if t < t0: continue
        hh = L["h"] * 0.5
        if t < land:
            p = (t - t0) / dur; ys = -hh * 1.1
            y = lerp(ys, ypos, p ** 2.3); vel = (ypos - ys) * 2.3 * p ** 1.3 / dur
            sx = sy = scl; alpha = cl(p * 6)
            bv = min(170, vel * (C["SHUTTER"] / FPS) / C["MOTION_BLUR_SAMPLES"] * 1.2)
        else:
            d = t - land
            sq = math.exp(-d * 11) * math.cos(d * 36)
            sy = scl * (1 - 0.20 * sq); sx = scl * (1 + 0.13 * sq)
            y = ypos + (1 - sy / scl) * hh - 20 * math.exp(-d * 9) * abs(math.sin(d * 24)); alpha = 1.0; bv = 0
        d = t - land
        boost = 1 + (3.2 * math.exp(-d * 8) if d > 0 else 0)
        pulse = 0.85 + 0.15 * math.sin(t * 6 + order)
        draw_text_layer(frame, L, W / 2, y, sx, sy, alpha=alpha, halo=1.1 * pulse * boost, inner=0.35 + 0.25 * pulse + (1.6 * math.exp(-d * 10) if d > 0 else 0),
                        halo_col=C["TITLE_GLOW"], inner_col=(255, 150, 60), blur_v=bv)
        if d >= 0:
            # impact FX: shock rings, sparks, flash
            yb = ypos + hh * 0.55
            for j, (spd, th, a0) in enumerate(((2300, 16, 1.0), (1500, 8, 0.7))):
                rr = d * spd
                if rr > 1 and d < 0.9:
                    k = math.exp(-d * 4.2) * a0
                    cv2.ellipse(fx, (int(W / 4), int(yb / 2)), (int(rr / 2), int(rr / 2 * 0.28)), 0, 0, 360,
                                (float(k * 1.4), float(k * 0.45), float(k * 0.2)), th // 2, cv2.LINE_AA)
            if d < 0.14: frame += (0.35 * (1 - d / 0.14)) * col((255, 200, 170)) * (1.0 if order == 2 else 0.7)
    # sparks
    for land, ypos, seed in ((C["T_LAND_1"], H * 0.69, 41), (C["T_LAND_2"], H * 0.885, 42)):
        if t >= land:
            sp = Sparks(90, seed, (W / 2 + np.random.default_rng(seed).uniform(-420, 420, 90), ypos + 70)[0:1] and
                        np.stack([W / 2 + np.random.default_rng(seed).uniform(-430, 430, 90), np.full(90, ypos + 60)], 1),
                        land, (350, 1500), (-2.65, -0.5), life=(0.5, 1.2), grav=2400)
            sp.draw(fx, t, ((255, 230, 180), (255, 80, 30)))
    if t >= C["T_LAND_1"] - 0.1:
        frame_fx = glow_of(fx, 3, 9, 0.9, 1.0)
        add_half(frame, frame_fx)
    # tagline
    if C["TAGLINE"] and t > C["T_TAGLINE"]:
        p = e_out_cubic((t - C["T_TAGLINE"]) / 0.5)
        draw_text_layer(frame, G["tag"]["layers"][0], W / 2, H * 0.945 - (1 - p) * 24, 1, 1, alpha=p, halo=0.5, inner=0.2,
                        halo_col=C["GOLD_GLOW"])

def chroma(frame, amt):
    a = int(round(amt))
    if a < 1: return frame
    out = frame.copy()
    out[..., 0] = np.roll(frame[..., 0], a, 1); out[..., 2] = np.roll(frame[..., 2], -a, 1)
    return out

def render_scene(t):
    t = max(t, 0.0)
    if t < C["T_S3"]:
        return render_old(t)
    if G["snap"] is None:
        G["snap"] = render_old(C["T_S3"], extras=False)
        G["crops"] = make_shard_crops(G["snap"])
    u = t - C["T_S3"]
    frame = hero_world(t)
    render_titles(frame, t)
    dx, dy, ang = shake(t)
    z = 1.04 + 0.27 * (1 - e_out_expo(u / 0.95)) + 0.03 * (u / 3.0)
    frame = camera(frame, z, dx, dy, ang)
    frame = chroma(frame, 14 * math.exp(-u * 18) + sum(15 * math.exp(-(t - l) * 16) for l in (C["T_LAND_1"], C["T_LAND_2"]) if t > l))
    # flash at shatter
    if u < 0.12: frame += (1 - u / 0.12) ** 2 * col((255, 150, 130)) * 0.9
    # shards flying toward camera
    ez = e_out_cubic(u / 1.1)
    Z = 1 + 1.25 * u * (1 + 0.8 * u) * 0.6
    z_old = 1 + 0.035 + 0.09           # camera value reached at t = T_S3 in render_old
    for k, inf in enumerate(G["shards"]):
        if inf is None: continue
        q = u - inf["delay"]
        if q < 0: q = 0
        a = 1 - sstep(0.30, 1.15 * inf["fade"], q)
        if a <= 0.004: continue
        disp = inf["dir"] * inf["spd"] * (q + 1.6 * q * q)
        c = np.array([W / 2, H / 2]) + (Z) * (inf["cen"] + disp - np.array([W / 2, H / 2]))
        # box centre vs centroid: use box centre for placement
        bx0, by0, bx1, by1 = inf["box"]; bc = np.array([(bx0 + bx1) / 2, (by0 + by1) / 2]) + (inf["cen"] - inf["cen"])
        cc = np.array([W / 2, H / 2]) + Z * (bc + disp - np.array([W / 2, H / 2]))
        sc = Z * (1 + inf["grow"] * q)
        over(frame, warp(G["crops"][k], cc[0], cc[1], sc, sc, inf["spin"] * (q + .5 * q * q) * 0.6), a)
    return frame

def post(frame, fi, t):
    small = cv2.resize(frame, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    br = np.clip(small - 0.74, 0, None)
    bl = cv2.GaussianBlur(br, (0, 0), 5) * 0.9 + cv2.GaussianBlur(br, (0, 0), 16) * 1.1
    frame = frame + cv2.resize(bl, (W, H), interpolation=cv2.INTER_LINEAR)
    frame = frame * G["VIG"]
    frame += G["GRAIN"][fi % 6][..., None] * 0.020
    fo = C["FADE_OUT"]
    if fo > 0 and t > DUR - fo: frame *= max(0.0, (DUR - t) / fo)
    return (np.clip(frame, 0, 1) * 255 + 0.5).astype(np.uint8)

def render_frame(fi):
    N = C["MOTION_BLUR_SAMPLES"]; acc = None
    for k in range(N):
        t = fi / FPS + ((k + 0.5) / N - 0.5) * C["SHUTTER"] / FPS
        f = render_scene(t)
        acc = f if acc is None else acc + f
    return fi, post(acc / N, fi, fi / FPS).tobytes()

# ------------------------------------------------------------------ audio -----
def synth_audio(path, sr=44100):
    """Original dark-cinematic cue timed to the scene beats (used if no song file)."""
    n = int(sr * DUR); t = np.arange(n) / sr; rng = np.random.default_rng(5)
    L = np.zeros(n); R = np.zeros(n)
    def env_at(t0, a, d): e = np.where(t >= t0, np.exp(-(t - t0) / d), 0.0); return e * np.clip((t - t0) / a, 0, 1)
    def noise(): return rng.standard_normal(n)
    def band(x, lo, hi):
        X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / sr); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, n)
    # drone: D1 + fifth, slowly swelling
    swell = 0.35 + 0.65 * np.clip(t / 6.0, 0, 1) ** 1.3
    drone = sum(np.sin(2 * np.pi * f * t + p) / h ** 1.1 for f0 in (36.7, 55.0) for h, (f, p) in enumerate([(f0 * k, k) for k in range(1, 9)], 1)) * 0.10 * swell
    L += drone; R += drone
    # taiko / boom hits
    def boom(t0, amp, f0=95, f1=34):
        u = np.clip(t - t0, 0, None); ph = 2 * np.pi * (f1 * u + (f0 - f1) * 0.045 * (1 - np.exp(-u / 0.045)))
        x = np.sin(ph) * env_at(t0, 0.002, 0.55) + 0.5 * band(noise(), 60, 900) * env_at(t0, 0.001, 0.10)
        return x * amp
    for t0, a in ((C["T_S2"], 0.85), (C["T_SUB"][0], 0.5), (C["T_SUB"][1], 0.5), (C["T_S3"], 1.0), (C["T_LAND_1"], 0.95), (C["T_LAND_2"], 1.2)):
        b = boom(t0, a); L += b; R += b
    # sword "shing"
    ts = C["T_SLASH"]; u = np.clip(t - ts, 0, None)
    sh = band(noise(), 3500, 16000) * env_at(ts, 0.004, 0.22) * 0.55 + np.sin(2 * np.pi * (2800 + 9000 * (1 - np.exp(-u * 14))) * u) * env_at(ts, 0.003, 0.30) * 0.18
    L += sh * 0.9; R += sh
    # riser into the shatter
    r0, r1 = 4.9, C["T_S3"]; g = np.clip((t - r0) / (r1 - r0), 0, 1) ** 2.2 * (t < r1)
    ris = band(noise(), 400, 9000) * g * 0.35 + np.sin(2 * np.pi * (200 + 1400 * np.clip((t - r0) / (r1 - r0), 0, 1) ** 2) * t) * g * 0.12
    L += ris; R += ris
    # pulse + plucked minor line (D phrygian) over scene 2/3
    notes = [293.66, 349.23, 392.0, 440.0, 466.16, 440.0, 392.0, 349.23]
    step = 0.5
    for i, tt in enumerate(np.arange(C["T_S2"] + 0.25, DUR - 0.2, step)):
        f = notes[i % len(notes)] * (0.5 if tt < C["T_S3"] else 1.0)
        e = env_at(tt, 0.003, 0.35 if tt < C["T_S3"] else 0.22)
        x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.4 for k in (1, 2, 3, 4)) * e * (0.09 if tt < C["T_S3"] else 0.12)
        pan = 0.5 + 0.35 * math.sin(i * 1.7)
        L += x * (1 - pan); R += x * pan
    for tt in np.arange(C["T_S3"] + 0.5, C["T_LAND_1"] - 0.3, 0.5):
        b = boom(tt, 0.35, 75, 40); L += b; R += b
    out = np.stack([L, R], 1)
    out *= np.clip(t / 0.05, 0, 1)[:, None]
    fo = C["FADE_OUT"]; out *= np.clip((DUR - t) / max(fo, 1e-3), 0, 1)[:, None] if fo > 0 else 1
    out = np.tanh(out * 1.2) / np.max(np.abs(np.tanh(out * 1.2))) * 0.89
    pcm = (out * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())

def prepare_audio(outdir):
    src = P(C["AUDIO_PATH"])
    if os.path.isfile(src):
        print("audio: using", src); return src, True
    wav = os.path.join(outdir, "score_synth.wav"); print("audio: %s not found -> synthesising original score" % C["AUDIO_PATH"])
    synth_audio(wav); return wav, False

# ------------------------------------------------------------------- main -----
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", help="comma list of times (s) to dump as PNG")
    ap.add_argument("--samples", type=int); ap.add_argument("--frames", help="a-b frame range (testing)")
    ap.add_argument("--no-audio", action="store_true"); ap.add_argument("--out")
    a = ap.parse_args()
    if a.samples: C["MOTION_BLUR_SAMPLES"] = a.samples
    out = P(a.out or C["OUTPUT_PATH"]); outdir = os.path.dirname(out); os.makedirs(outdir, exist_ok=True)
    build_assets()
    G["rad_c"] = np.sqrt((G["X"] - W * 0.5) ** 2 + (G["Y"] - H * 0.46) ** 2)
    if a.preview:
        pd = os.path.join(outdir, "preview"); os.makedirs(pd, exist_ok=True)
        for s in a.preview.split(","):
            tt = float(s); fi = int(round(tt * FPS)); _, b = render_frame(fi)
            img = np.frombuffer(b, np.uint8).reshape(H, W, 3)
            cv2.imwrite(os.path.join(pd, "t%05.2f.png" % tt), cv2.cvtColor(img, cv2.COLOR_RGB2BGR)); print("wrote preview", tt)
        return
    total = int(round(DUR * FPS)); i0, i1 = 0, total
    if a.frames: i0, i1 = map(int, a.frames.split("-"))
    vid = out if a.no_audio else os.path.join(outdir, "_video_only.mp4")
    ff = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
          "-c:v", "libx264", "-preset", "slow", "-crf", str(C["CRF"]), "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
          "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", vid]
    pr = subprocess.Popen(ff, stdin=subprocess.PIPE)
    nw = C["WORKERS"] or os.cpu_count() or 2
    print("rendering frames %d-%d with %d workers, %d motion-blur samples ..." % (i0, i1, nw, C["MOTION_BLUR_SAMPLES"]))
    import time; t0 = time.time(); done = 0
    with mp.get_context("fork").Pool(nw) as pool:
        for fi, b in pool.imap(render_frame, range(i0, i1), chunksize=1):
            pr.stdin.write(b); done += 1
            if done % 30 == 0:
                el = time.time() - t0; print("  %d/%d  %.1fs elapsed  ETA %.0fs" % (done, i1 - i0, el, el / done * (i1 - i0 - done)), flush=True)
    pr.stdin.close(); pr.wait()
    if not a.no_audio:
        au, is_song = prepare_audio(outdir)
        af = "volume=%.3f" % C["AUDIO_VOLUME"]
        if is_song:
            af += ",afade=t=in:d=0.05,afade=t=out:st=%.2f:d=%.2f" % (DUR - C["FADE_OUT"], C["FADE_OUT"])
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", vid]
        if is_song: cmd += ["-ss", str(C["AUDIO_START"])]
        cmd += ["-i", au, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-af", af, "-t", str(DUR),
                "-movflags", "+faststart", out]
        subprocess.run(cmd, check=True); os.remove(vid)
    print("done ->", out)

if __name__ == "__main__":
    main()
