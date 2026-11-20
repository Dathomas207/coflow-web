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

// Draft an enquiry using the public support address. The visitor reviews and sends it.
const form = document.getElementById("talk-form");
const msg = document.getElementById("talk-msg");
if (form) form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const email = form.elements.email.value.trim();
  const size = form.elements.size.value;
  const body = `Hello CoFlow,\n\nI'd like to discuss the private pilot.\n\nWork email: ${email}\nTeam size: ${size}\n\nOur repository and main challenge:\n`;
  const href = "mailto:support@getcoflow.ai?subject=" + encodeURIComponent("CoFlow pilot enquiry") + "&body=" + encodeURIComponent(body);
  const draft = document.getElementById("pilot-draft");
  draft.href = href;
  draft.hidden = false;
  msg.textContent = "Your email draft is ready. Open it below, then review and send it in your email app. Nothing has been submitted here.";
});

// Keep the shared header readable as the page scrolls.
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
    // Click-open menus stay open across pointer movement; close with Escape or an outside click.
  });
  document.addEventListener("click", (e) => dds.forEach((d) => { if (!d.contains(e.target)) set(d, false); }));
})();

// ---------- legal page contents highlight ----------
(() => {
  const links = [...document.querySelectorAll(".toc a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove("on")); const a = map.get(e.target.id); if (a) a.classList.add("on"); } });
  }, { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll(".prose section[id]").forEach((s) => io.observe(s));
})();

// ---------- mega menu previews ----------
document.querySelectorAll(".mega").forEach((m) => {
  const items = [...m.querySelectorAll(".mg-list > a[data-pv]")];
  const show = (a) => {
    items.forEach((x) => x.classList.toggle("act", x === a));
    m.querySelectorAll(".pv").forEach((p) => p.classList.toggle("on", p.id === a.dataset.pv));
  };
  items.forEach((a) => { a.addEventListener("mouseenter", () => show(a)); a.addEventListener("focus", () => show(a)); });
  const cur = items.find((a) => a.getAttribute("aria-current") === "page") || items[0];
  if (cur) show(cur);
});

// ---------- menu button ----------
(() => {
  const nav = document.querySelector(".nav"), btn = document.querySelector(".nav-toggle");
  if (!nav || !btn) return;
  const set = (open) => { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); set(!nav.classList.contains("open")); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); } });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) set(false); });
  nav.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => set(false)));
})();

// Desktop use-case previews follow pointer or keyboard focus without navigating.
document.querySelectorAll('.case-menu').forEach((menu) => {
  const links = [...menu.querySelectorAll('[data-case]')];
  const show = (link) => {
    links.forEach((item) => item.classList.toggle('active', item === link));
    menu.querySelectorAll('.case-preview').forEach((panel) => { panel.hidden = panel.id !== link.dataset.case; });
  };
  links.forEach((link) => {
    link.addEventListener('mouseenter', () => show(link));
    link.addEventListener('focus', () => show(link));
  });
  if (links.length) show(links[0]);
});
