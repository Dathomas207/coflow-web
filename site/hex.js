// CoFlow hexagon layer: a live hex field behind page headers and pulsing rings behind the product window.
(() => {
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canWatch = "IntersectionObserver" in window;
  const hero = document.querySelector(".launch-hero");
  if (hero) {
    const c = document.createElement("canvas");
    c.className = "hexfield"; c.setAttribute("aria-hidden", "true");
    hero.prepend(c);
    const prod = hero.querySelector(".hero-product");
    if (prod) ["", " r2"].forEach((k) => { const s = document.createElement("span"); s.className = "hx-ring" + k; s.setAttribute("aria-hidden", "true"); prod.prepend(s); });
  }
  document.querySelectorAll("canvas.hexfield, .phero canvas.hexbg").forEach((cv) => {
    const ctx = cv.getContext("2d"), host = cv.parentElement;
    const R = 32, W3 = Math.sqrt(3) * R, P = 6 * R;
    const BLUE = "53,73,232", PEACH = "242,145,95";
    let w = 0, h = 0, cells = [], lit = [], traces = [], on = true, last = 0, px = -1e4, py = -1e4, inside = false, pe = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      cells = [];
      for (let row = 0; row * R * 1.5 < h + R; row++) {
        for (let x = row % 2 ? W3 / 2 : 0; x < w + W3; x += W3) {
          const u = x / w, f = u < 0.3 ? 0.18 * (u / 0.3) : Math.min(1, 0.18 + (u - 0.3) / 0.45);
          const v = row * R * 1.5 / Math.max(h, 1), fade = v > 0.8 ? Math.max(0, (1 - v) / 0.2) : 1;
          if (f * fade > 0.02) cells.push([x, row * R * 1.5, f * fade]);
        }
      }
      lit = []; traces = [];
    };
    const hex = (x, y, r = R) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; ctx[i ? "lineTo" : "moveTo"](x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h); ctx.setLineDash([]); ctx.lineWidth = 1;
      for (const [x, y, f] of cells) { hex(x, y); ctx.strokeStyle = `rgba(${BLUE},${0.13 * f})`; ctx.stroke(); }
      for (const l of lit) { const c = cells[l.i]; if (!c) continue; const a = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - l.t0) / l.dur))); hex(c[0], c[1]); ctx.fillStyle = l.o ? `rgba(${PEACH},${0.22 * a * c[2]})` : `rgba(${BLUE},${0.08 * a * c[2]})`; ctx.fill(); }
      if (pe > 0.01) { ctx.lineWidth = 1.5; for (const [x, y, f] of cells) { const d = Math.hypot(x - px, y - py); if (d < 180) { hex(x, y, R - 3); ctx.strokeStyle = `rgba(${BLUE},${0.5 * (1 - d / 180) * pe * Math.max(f, 0.4)})`; ctx.stroke(); } } }
      ctx.lineWidth = 2;
      for (const tr of traces) { const c = cells[tr.i]; if (!c) continue; const p = (t - tr.t0) / tr.dur; if (p < 0) continue; ctx.setLineDash([P, P]); ctx.lineDashOffset = P * (1 - Math.min(1, p * 1.7)); const a = p < 0.65 ? 1 : Math.max(0, (1 - p) / 0.35); hex(c[0], c[1], R - 3); ctx.strokeStyle = `rgba(${PEACH},${0.9 * a * Math.max(c[2], 0.45)})`; ctx.stroke(); }
      ctx.setLineDash([]);
    };
    const frame = (t) => {
      if (!on) return;
      if (t - last > 33) {
        last = t; pe += ((inside ? 1 : 0) - pe) * 0.12;
        lit = lit.filter((l) => t - l.t0 < l.dur); traces = traces.filter((l) => t - l.t0 < l.dur);
        const pick = () => { for (let k = 0; k < 6; k++) { const i = Math.floor(Math.random() * cells.length); if (cells[i][2] > 0.35) return i; } return Math.floor(Math.random() * cells.length); };
        while (cells.length && lit.length < 8) lit.push({ i: pick(), t0: t + Math.random() * 900, dur: 2400 + Math.random() * 2600, o: Math.random() < 0.25 });
        while (cells.length && traces.length < 3) traces.push({ i: pick(), t0: t + Math.random() * 1800, dur: 2600 + Math.random() * 1400 });
        draw(t);
      }
      requestAnimationFrame(frame);
    };
    size();
    if (calm) { draw(0); return; }
    window.addEventListener("resize", size);
    host.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; inside = true; });
    host.addEventListener("pointerleave", () => { inside = false; });
    if (canWatch) new IntersectionObserver((es) => { const was = on; on = es[0].isIntersecting; if (on && !was) requestAnimationFrame(frame); }).observe(cv);
    requestAnimationFrame(frame);
  });
})();
