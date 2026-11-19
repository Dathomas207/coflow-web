// Tabs for the code examples and the use cases. Without script, every panel stays visible in a stack.
document.querySelectorAll(".uc, .ex").forEach((root) => {
  const tabs = [...root.querySelectorAll("[role=tab]")];
  const panels = [...root.querySelectorAll("[role=tabpanel]")];
  root.classList.add("js");
  const pick = (i, focus) => {
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => pick(i));
    t.addEventListener("keydown", (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (step) { e.preventDefault(); pick((i + step + tabs.length) % tabs.length, true); }
      if (e.key === "Home") { e.preventDefault(); pick(0, true); }
      if (e.key === "End") { e.preventDefault(); pick(tabs.length - 1, true); }
    });
  });
  pick(0);
});

// Set FORM_ENDPOINT to the URL that accepts contact requests (JSON POST) before launch.
const FORM_ENDPOINT = "";
const form = document.getElementById("talk-form");
const msg = document.getElementById("talk-msg");
if (form) form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = "Enter a valid email address so we can reach you.";
    form.email.focus();
    return;
  }
  if (!FORM_ENDPOINT) {
    msg.textContent = "This form is not connected yet, so nothing was sent.";
    return;
  }
  try {
    const r = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, size: form.size ? form.size.value : "" }) });
    if (!r.ok) throw new Error(String(r.status));
    msg.textContent = "Request received. We will be in touch.";
    form.reset();
  } catch (err) {
    msg.textContent = "The request did not go through. Try again in a minute.";
  }
});

// ---------- motion ----------
(() => {
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canWatch = "IntersectionObserver" in window;

  // Reveal on scroll. Content is visible by default; this only runs when motion is welcome.
  if (!calm && canWatch) {
    document.documentElement.classList.add("js");
    const sel = ".band > .eyebrow, .band > h2, .band > .lede, .band > .uc-head, .band > .tbl, .band > .note, .band > .fine, .band > .links, .split-copy > *, .cards > *, .integ > *, .plans > *, .tiles > *, .steps > li, .faq > details, .banners > *, .vs > *, .mock, .talk, .ex, .uc, .score-head, .works, .contact > *";
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(sel).forEach((el) => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", Math.min(i * 80, 480) + "ms");
      el.classList.add("rv");
      io.observe(el);
    });

    // Scorecard numbers count up once.
    const tick = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tick.unobserve(e.target);
        const m = e.target.textContent.match(/^(\D*)(\d+)(.*)$/);
        if (!m) return;
        const end = Number(m[2]), t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / 1100), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          e.target.textContent = m[1] + v + m[3];
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".tile b").forEach((el) => tick.observe(el));
  }

  // Hexagon field behind each page header: outlines, a slow shimmer, hexes that trace their own outline, and a glow that follows the pointer.
  document.querySelectorAll("canvas.hexbg").forEach((cv) => {
    const ctx = cv.getContext("2d"), host = cv.parentElement;
    const R = 34, W3 = Math.sqrt(3) * R, P = 6 * R;
    let w = 0, h = 0, cells = [], lit = [], traces = [], on = true, last = 0;
    let px = -1e4, py = -1e4, inside = false, pe = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      cells = [];
      for (let row = 0; row * R * 1.5 < h + R; row++) {
        for (let x = row % 2 ? W3 / 2 : 0; x < w + W3; x += W3) {
          const u = x / w, f = u < 0.26 ? 0 : Math.min(1, (u - 0.26) / 0.46);
          if (f > 0) cells.push([x, row * R * 1.5, f]);
        }
      }
      lit = []; traces = [];
    };
    const hex = (x, y, r = R) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 3 * i - Math.PI / 2;
        ctx[i ? "lineTo" : "moveTo"](x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      for (const [x, y, f] of cells) { hex(x, y); ctx.strokeStyle = "rgba(33,72,224," + 0.17 * f + ")"; ctx.stroke(); }
      for (const l of lit) {
        const c = cells[l.i]; if (!c) continue;
        const a = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - l.t0) / l.dur)));
        hex(c[0], c[1]);
        ctx.fillStyle = l.o ? "rgba(255,107,26," + 0.22 * a * c[2] + ")" : "rgba(33,72,224," + 0.12 * a * c[2] + ")";
        ctx.fill();
      }
      if (pe > 0.01) {
        ctx.lineWidth = 1.6;
        for (const [x, y, f] of cells) {
          const d = Math.hypot(x - px, y - py);
          if (d < 190) { hex(x, y, R - 3); ctx.strokeStyle = "rgba(33,72,224," + 0.6 * (1 - d / 190) * pe * Math.max(f, 0.35) + ")"; ctx.stroke(); }
        }
      }
      ctx.lineWidth = 2;
      for (const tr of traces) {
        const c = cells[tr.i]; if (!c) continue;
        const p = (t - tr.t0) / tr.dur; if (p < 0) continue;
        ctx.setLineDash([P, P]);
        ctx.lineDashOffset = P * (1 - Math.min(1, p * 1.7));
        const a = p < 0.65 ? 1 : Math.max(0, (1 - p) / 0.35);
        hex(c[0], c[1], R - 3);
        ctx.strokeStyle = "rgba(255,107,26," + 0.85 * a * Math.max(c[2], 0.4) + ")";
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };
    const frame = (t) => {
      if (!on) return;
      if (t - last > 33) {
        last = t;
        pe += ((inside ? 1 : 0) - pe) * 0.12;
        lit = lit.filter((l) => t - l.t0 < l.dur);
        traces = traces.filter((l) => t - l.t0 < l.dur);
        while (cells.length && lit.length < 9) lit.push({ i: Math.floor(Math.random() * cells.length), t0: t + Math.random() * 900, dur: 2400 + Math.random() * 2600, o: Math.random() < 0.2 });
        while (cells.length && traces.length < 3) traces.push({ i: Math.floor(Math.random() * cells.length), t0: t + Math.random() * 1800, dur: 2600 + Math.random() * 1400 });
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

// ---------- nav menus ----------
(() => {
  const dds = [...document.querySelectorAll(".dd")];
  const set = (dd, open) => { dd.classList.toggle("open", open); dd.querySelector(".dd-btn").setAttribute("aria-expanded", String(open)); };
  dds.forEach((dd) => {
    const btn = dd.querySelector(".dd-btn");
    btn.addEventListener("click", (e) => { e.stopPropagation(); const o = !dd.classList.contains("open"); dds.forEach((d) => set(d, false)); set(dd, o); });
    dd.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(dd, false); btn.focus(); } });
    dd.addEventListener("focusout", (e) => { if (!dd.contains(e.relatedTarget)) set(dd, false); });
    dd.addEventListener("mouseleave", () => set(dd, false));
  });
  document.addEventListener("click", (e) => dds.forEach((d) => { if (!d.contains(e.target)) set(d, false); }));
})();
