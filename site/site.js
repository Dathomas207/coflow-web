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
