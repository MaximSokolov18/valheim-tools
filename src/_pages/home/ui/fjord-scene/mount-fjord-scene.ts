import { FJORD_FRAGMENT_SHADER, FJORD_VERTEX_SHADER } from './fjord-shader';

export interface FjordSceneOptions {
    /** Painted layer images, back to front. */
    far: string;
    mid: string;
    near: string;
    ship: string;
    /** Element whose pointer drives the parallax and steers the ship. */
    track: HTMLElement;
    /** Ship centre (0-1 from the left) and width (fraction of the scene). */
    shipX?: number;
    shipW?: number;
    /** Ship waterline and the horizon, 0-1 from the bottom. */
    waterline?: number;
    horizon?: number;
    /** Where the paper dissolve ends, 0-1 from the left. */
    wash?: number;
    /** Seconds the sun/moon wheel takes to turn when the theme changes. */
    cycleSeconds?: number;
}

export interface FjordScene {
    destroy(): void;
}

type Rgb = [number, number, number];
type Ripple = [x: number, y: number, born: number, strength: number];

const LAYERS = [
    ['far', 'uFar', 'uFarS'],
    ['mid', 'uMid', 'uMidS'],
    ['near', 'uNear', 'uNearS'],
    ['ship', 'uShip', 'uShipS'],
] as const;
type LayerName = (typeof LAYERS)[number][0];

const UNIFORMS = [
    'uFar', 'uMid', 'uNear', 'uShip', 'uRes', 'uFarS', 'uMidS', 'uNearS', 'uShipS', 'uPar',
    'uTime', 'uH', 'uAng', 'uWash', 'uScroll', 'uPaper', 'uShipPos', 'uTilt', 'uRip',
] as const;

/**
 * Below this width the scene is a band under the hero copy: no paper wash, ship
 * centred. Same query as Tailwind's `md` breakpoint; media queries in rem use the
 * browser's 16px initial size, not the page's 20px root, so this is 768px.
 */
const WIDE_QUERY = '(min-width: 48rem)';
const HALF_TURN = Math.PI;
/** Wheel angle with the sun up; night is half a turn further on. */
const DAY_ANGLE = Math.PI / 2 - 0.25;
/** Matches the page's color crossfade (globals.css, html.theme-transition). */
const PAPER_FADE_MS = 1600;

const isDark = () => document.documentElement.classList.contains('dark');
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function bodyPaper(fallback: Rgb): Rgb {
    const m = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
    return m ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : fallback;
}

/**
 * Mounts the painted fjord into `host` as a WebGL canvas. Theme changes (the
 * `dark` class on <html>) turn the sun/moon wheel half a circle, always
 * forward: the sun sets as the moon rises, and back again. Returns null
 * without WebGL, so a static fallback can stay in place.
 */
export function mountFjordScene(host: HTMLElement, opts: FjordSceneOptions): FjordScene | null {
    const wash = opts.wash ?? 0.42;
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | null = null;
    try {
        gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    } catch {
        gl = null;
    }
    if (!gl) return null;
    const g = gl;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const track = opts.track;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'absolute inset-0 block h-full w-full';
    // Fades in once the first frame is drawn, instead of popping in.
    canvas.style.opacity = '0';
    if (!reduce) canvas.style.transition = 'opacity 700ms ease';

    const compile = (type: number, src: string) => {
        const s = g.createShader(type);
        if (!s) throw new Error('createShader failed');
        g.shaderSource(s, src);
        g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s) ?? 'shader error');
        return s;
    };
    const prog = g.createProgram();
    if (!prog) return null;
    try {
        g.attachShader(prog, compile(g.VERTEX_SHADER, FJORD_VERTEX_SHADER));
        g.attachShader(prog, compile(g.FRAGMENT_SHADER, FJORD_FRAGMENT_SHADER));
        g.linkProgram(prog);
    } catch (error) {
        console.warn(error);
        return null;
    }
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
    g.useProgram(prog);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const aLoc = g.getAttribLocation(prog, 'a');
    g.enableVertexAttribArray(aLoc);
    g.vertexAttribPointer(aLoc, 2, g.FLOAT, false, 0, 0);
    const U = Object.fromEntries(UNIFORMS.map((n) => [n, g.getUniformLocation(prog, n)])) as Record<
        (typeof UNIFORMS)[number],
        WebGLUniformLocation | null
    >;

    /* ---------- textures: the scene appears once every layer has loaded ---------- */
    const sizes: Record<LayerName, [number, number]> = { far: [1, 1], mid: [1, 1], near: [1, 1], ship: [1, 1] };
    let ready = 0;
    const want = (1 << LAYERS.length) - 1;
    const images: HTMLImageElement[] = [];
    LAYERS.forEach(([name, sampler], i) => {
        g.uniform1i(U[sampler], i);
        const tex = g.createTexture();
        g.activeTexture(g.TEXTURE0 + i);
        g.bindTexture(g.TEXTURE_2D, tex);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, 1, 1, 0, g.RGBA, g.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
            if (destroyed) return;
            g.activeTexture(g.TEXTURE0 + i);
            g.bindTexture(g.TEXTURE_2D, tex);
            g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
            sizes[name] = [img.naturalWidth, img.naturalHeight];
            ready |= 1 << i;
            reveal();
        };
        // A layer that never loads would leave the hero empty, so show the static painting instead.
        img.onerror = () => {
            if (!destroyed) host.dataset.fallback = 'true';
        };
        img.src = opts[name];
        images.push(img);
    });
    function reveal() {
        if (ready !== want) return;
        if (!canvas.parentNode) host.appendChild(canvas);
        host.dataset.live = 'true';
        frame(0);
        requestAnimationFrame(() => {
            canvas.style.opacity = '1';
        });
        wake();
    }

    /* ---------- the sun/moon wheel: always turns forward ---------- */
    let ang = isDark() ? DAY_ANGLE + HALF_TURN : DAY_ANGLE;
    let angFrom = ang;
    let angTo = ang;
    let angT = 1;
    let angStart = 0;
    let paper: Rgb = bodyPaper([0.96, 0.95, 0.93]);
    let paperUntil = 0;
    let paperDirty = false;
    const themeObserver = new MutationObserver(() => {
        const target = isDark() ? 1 : 0;
        const current = Math.round((angTo - DAY_ANGLE) / HALF_TURN) % 2;
        if (current !== target) {
            angFrom = ang;
            angTo += HALF_TURN;
            angT = 0;
            angStart = performance.now();
        }
        paperUntil = performance.now() + PAPER_FADE_MS;
        paperDirty = true;
        if (reduce) {
            ang = angTo;
            angT = 1;
            paper = bodyPaper(paper);
            frame(0);
        } else wake();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    /* ---------- pointer: parallax, the ship follows, the water rings ---------- */
    let mx = 0.6, my = 0.5, smx = 0.6, smy = 0.5, t = 0, boost = 0, ri = 0;
    let lastRipple: [number, number] | null = null;
    const ripples: Ripple[] = Array.from({ length: 6 }, (): Ripple => [0, 0, -10, 0]);
    const rippleData = new Float32Array(ripples.length * 4);
    const waterline = opts.waterline ?? 0.2;
    const horizon = opts.horizon ?? 0.3;
    const wide = window.matchMedia?.(WIDE_QUERY);
    const narrow = () => (wide ? !wide.matches : host.clientWidth < 768);
    const addRipple = (x: number, y: number, s: number) => {
        ripples[ri] = [x, y, t, s];
        ri = (ri + 1) % ripples.length;
    };
    const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        if (!r.width) return;
        mx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        my = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
        if (my < horizon - 0.02 && my > 0.04 && mx > (narrow() ? 0 : wash)) {
            if (!lastRipple || Math.abs(lastRipple[0] - mx) + Math.abs(lastRipple[1] - my) > 0.05) {
                addRipple(mx, my, 0.6);
                lastRipple = [mx, my];
            }
        }
        wake();
    };
    const onDown = (e: PointerEvent) => {
        onMove(e);
        if (my < horizon - 0.02) {
            addRipple(mx, my, 1.4);
            boost = 1;
        }
    };
    const onLeave = () => {
        mx = 0.6;
        my = 0.5;
    };
    track.addEventListener('pointermove', onMove, { passive: true });
    track.addEventListener('pointerdown', onDown, { passive: true });
    track.addEventListener('pointerleave', onLeave);

    /* ---------- scroll: each layer sinks behind the horizon at its own depth ---------- */
    // How far the scene's centre is past the viewport's centre, -1..1.
    const scrollDepth = () => {
        const r = host.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        return Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
    };
    const onScroll = () => {
        // The running loop picks scroll up every frame; redraw here only when it is idle.
        if (!running && ready === want && !reduce) frame(0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- loop ---------- */
    let running = false, visible = true, destroyed = false, raf = 0, last = 0;
    let shipX = opts.shipX ?? 0.7, shipV = 0;
    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        g.viewport(0, 0, canvas.width, canvas.height);
    };
    function frame(dtIn?: number) {
        raf = 0;
        const now = performance.now() / 1000;
        const dt = dtIn ?? Math.min(0.05, now - (last || now));
        last = now;
        t += dt;
        // Wall-clock, not frame time: the sky keeps pace with the page's color fade even on slow GPUs.
        if (angT < 1) angT = Math.min(1, (now * 1000 - angStart) / (1000 * (opts.cycleSeconds ?? 4.2)));
        if (paperDirty) {
            paper = bodyPaper(paper);
            if (now * 1000 > paperUntil) paperDirty = false;
        }
        ang = angFrom + (angTo - angFrom) * ease(angT);
        smx += (mx - smx) * 0.05;
        smy += (my - smy) * 0.05;
        boost = Math.max(0, boost - dt * 0.5);
        const nar = narrow();
        const target = (nar ? 0.55 : (opts.shipX ?? 0.7)) + (smx - 0.6) * (nar ? 0.06 : 0.1);
        shipV += ((target - shipX) * 0.9 - shipV * 1.8) * dt;
        shipX += shipV * dt + boost * dt * 0.01;
        const bob = Math.sin(t * 1.1) * 0.004 + Math.sin(t * 2.3 + 1) * 0.0015;
        g.uniform2f(U.uRes, canvas.width, canvas.height);
        LAYERS.forEach(([name, , size]) => g.uniform2f(U[size], sizes[name][0], sizes[name][1]));
        // Gentle pointer parallax; scroll parallax is off under reduced motion.
        g.uniform2f(U.uPar, (smx - 0.5) * -0.03, (smy - 0.5) * -0.015);
        g.uniform1f(U.uScroll, reduce ? 0 : scrollDepth());
        g.uniform1f(U.uTime, t);
        g.uniform1f(U.uH, horizon);
        g.uniform1f(U.uAng, ang);
        g.uniform1f(U.uWash, nar ? -0.4 : wash);
        g.uniform3f(U.uPaper, paper[0], paper[1], paper[2]);
        g.uniform3f(U.uShipPos, shipX, waterline + bob, nar ? 0.6 : (opts.shipW ?? 0.3));
        g.uniform1f(U.uTilt, Math.sin(t * 0.8) * 0.018 - shipV * 0.6);
        ripples.forEach((ripple, i) => rippleData.set(ripple, i * 4));
        g.uniform4fv(U.uRip, rippleData);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
        if (running) raf = requestAnimationFrame(() => frame());
    }
    const start = () => {
        if (running || ready !== want) return;
        if (reduce && angT >= 1) {
            frame(0);
            return;
        }
        running = true;
        last = 0;
        raf = requestAnimationFrame(() => frame());
    };
    const stop = () => {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
    };
    function wake() {
        if (destroyed || ready !== want) return;
        if (reduce) {
            smx = mx;
            smy = my;
            frame(0);
            return;
        }
        if (visible && !document.hidden) start();
    }
    const resizeObserver = new ResizeObserver(() => {
        resize();
        if (!running && ready === want) frame(0);
    });
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) wake();
        else stop();
    });
    intersectionObserver.observe(host);
    const onVisibility = () => (document.hidden ? stop() : wake());
    document.addEventListener('visibilitychange', onVisibility);
    resize();

    return {
        destroy() {
            destroyed = true;
            stop();
            themeObserver.disconnect();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('scroll', onScroll);
            track.removeEventListener('pointermove', onMove);
            track.removeEventListener('pointerdown', onDown);
            track.removeEventListener('pointerleave', onLeave);
            images.forEach((img) => {
                img.onload = null;
                img.onerror = null;
            });
            canvas.remove();
            delete host.dataset.live;
            g.getExtension('WEBGL_lose_context')?.loseContext();
        },
    };
}
