// Playground: a scripted demonstration. Outputs are prepared examples, not live model responses.
(() => {
  const root = document.getElementById("pg");
  if (!root) return;
  const TASKS = [
    {
      label: "Firmware", lang: "C", file: "uart_isr.c", ask: "Log each line received on the UART.",
      rules: [
        { id: "MISRA C 21.3", title: "No heap allocation", src: "Firmware starter standards", miss: "Heap allocation with malloc and free.", met: "A fixed buffer and no heap." },
        { id: "MISRA C 21.6", title: "No standard input and output", src: "Firmware starter standards", miss: "printf called from firmware.", met: "Logging goes through the project logger." },
        { id: "Team rule", title: "Interrupts stay short", src: "A failed hardware-in-the-loop run", miss: "A blocking read inside an interrupt handler.", met: "The handler stores one byte, sets a flag and returns." },
      ],
      build(s) {
        const body = (read) => [
          s[0] ? ["    static char line[128];", "g", 0] : ["    char *line = malloc(128);", "b", 0],
          read,
          s[1] ? ["    log_write(line);", "g", 1] : ['    printf("rx: %s\\n", line);', "b", 1],
          ...(s[0] ? [] : [["    free(line);", "b", 0]]),
        ];
        if (!s[2]) return [["void USART1_IRQHandler(void) {"], ...body(["    read_line(line, 128);", "b", 2]), ["}"]];
        return [["void USART1_IRQHandler(void) {"], ["    rx_ring_push(USART1->DR);", "g", 2], ["    rx_pending = true;", "g", 2], ["}"], [""],
          ["void uart_task(void) {"], ...body(["    rx_ring_read_line(line, 128);"]), ["}"]];
      },
    },
    {
      label: "API security", lang: "Python", file: "invoices.py", ask: "Add an endpoint that returns one invoice.",
      rules: [
        { id: "CWE-89", title: "Parameterized queries only", src: "Security standards", miss: "The query is built from user input.", met: "A typed id and a parameterized call." },
        { id: "OWASP Top 10 A01", title: "Scope every lookup to the caller's tenant", src: "Security standards", miss: "Any caller can read any tenant's invoice.", met: "The lookup is scoped to the caller's tenant." },
        { id: "FastAPI standard", title: "A response model on every route", src: "Rules keyed to your stack", miss: "No response model, so every column is returned.", met: "The response model lists the fields that leave the API." },
      ],
      build(s) {
        const L = [];
        L.push(s[2] ? ['@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)', "g", 2] : ['@router.get("/invoices/{invoice_id}")', "b", 2]);
        L.push(["def get_invoice("]);
        L.push(s[0] ? ["    invoice_id: UUID,", "g", 0] : ["    invoice_id: str,", "b", 0]);
        if (s[1]) L.push(["    user=Depends(current_user),", "g", 1]);
        L.push(["    db=Depends(get_db),"], ["):"]);
        const q = "    q = f\"SELECT * FROM invoices WHERE id = '{invoice_id}'\"";
        if (s[0] && s[1]) L.push(["    invoice = invoices.get_for_tenant(db, user.tenant_id, invoice_id)", "g", 1]);
        else if (s[0]) L.push(["    invoice = invoices.get(db, invoice_id)", "b", 1]);
        else if (s[1]) L.push([q, "b", 0], ["    q += f\" AND tenant_id = '{user.tenant_id}'\"", "b", 0], ["    invoice = db.execute(text(q)).first()", "b", 0]);
        else L.push([q, "b", 0], ["    invoice = db.execute(text(q)).first()", "b", 1]);
        L.push(["    if invoice is None:"], ["        raise HTTPException(status_code=404)"], ["    return invoice"]);
        return L;
      },
    },
    {
      label: "Design system", lang: "TypeScript", file: "CheckoutButton.tsx", ask: "Add a pay button to the checkout page.",
      rules: [
        { id: "Color tokens", title: "Colors come from tokens", src: "Your design system", miss: "A hard-coded hex value close to the brand blue.", met: "Color comes from the primary token." },
        { id: "Spacing scale", title: "Spacing comes from the scale", src: "Your design system", miss: "Padding and radius that match nothing else in the app.", met: "Size comes from the scale." },
        { id: "Shared components", title: "Use the shared Button", src: "Your design system", miss: "A native button with no focus or disabled states.", met: "Focus, hover and disabled states come with the component." },
      ],
      build(s) {
        const L = [];
        if (s[2]) L.push(['import { Button } from "@/ui/button";', "g", 2], [""]);
        L.push(["export function PayButton() {"], ["  return ("]);
        const tag = s[2] ? "Button" : "button";
        if (s[0] && s[1] && s[2]) L.push(['    <Button variant="primary" size="md">', "g", 2]);
        else {
          L.push(["    <" + tag, s[2] ? "g" : "b", 2]);
          if (s[2] && s[0]) L.push(['      variant="primary"', "g", 0]);
          if (s[2] && s[1]) L.push(['      size="md"', "g", 1]);
          const st = [];
          if (!s[0]) st.push(['        background: "#2f6fed",', "b", 0]);
          else if (!s[2]) st.push(['        background: "var(--color-primary)",', "g", 0]);
          if (!s[1]) st.push(['        padding: "11px 18px", borderRadius: 7,', "b", 1]);
          else if (!s[2]) st.push(['        padding: "var(--space-3) var(--space-5)",', "g", 1]);
          if (st.length) L.push(["      style={{"], ...st, ["      }}"]);
          L.push(["    >"]);
        }
        L.push(["      Pay now"], ["    </" + tag + ">", s[2] ? "" : "b", 2], ["  );"], ["}"]);
        return L;
      },
    },
    {
      label: "Migrations", lang: "Python", file: "0042_order_region.py", ask: "Add a region column to orders and backfill it.",
      rules: [
        { id: "Team rule", title: "Backfills run with tenant context", src: "One review comment and one incident ticket", miss: "The backfill runs with no tenant context, so it sees no rows and passes.", met: "Each tenant is backfilled with its context set." },
        { id: "Team rule", title: "Backfill in batches", src: "Two review comments", miss: "One statement updates the whole table in a single lock.", met: "Rows are updated in batches." },
      ],
      build(s) {
        const stmt = (ind) => s[1] ? [ind + 'backfill_in_batches("orders", region="us")', "g", 1] : [ind + "op.execute(\"UPDATE orders SET region = 'us'\")", "b", 1];
        const L = [["def upgrade():"], ['    op.add_column("orders", sa.Column("region", sa.Text()))']];
        if (s[0]) L.push(["    for tenant in all_tenants():", "g", 0], ["        with tenant_context(tenant):", "g", 0], stmt("            "));
        else { const x = stmt("    "); L.push(s[1] ? [x[0], "b", 0] : x); }
        return L;
      },
    },
  ];

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ti = 0, state = TASKS[0].rules.map(() => false), timer = 0;

  const renderOut = () => {
    const t = TASKS[ti], lines = t.build(state), pre = $("pg-code");
    pre.textContent = "";
    lines.forEach(([text, kind], i) => {
      const s = el("span", kind === "b" ? "bad" : kind === "g" ? "good" : "", text || " ");
      s.style.animationDelay = i * 40 + "ms";
      pre.appendChild(s);
    });
    const on = state.filter(Boolean).length, miss = state.length - on;
    $("pg-count").textContent = miss;
    $("pg-count-label").textContent = miss === 0 ? "findings. Ready to merge." : miss === 1 ? "finding for review to catch." : "findings for review to catch.";
    root.classList.toggle("clean", miss === 0);
    $("pg-ctx").textContent = on === 0 ? "Agent alone" : on + " of " + state.length + " rules in context";
    const list = $("pg-review");
    list.textContent = "";
    t.rules.forEach((r, i) => {
      const li = el("li", state[i] ? "met" : "miss");
      li.append(el("b", "", state[i] ? "Met" : "Finding"), el("i", "", r.id), el("span", "", state[i] ? r.met : r.miss));
      list.appendChild(li);
    });
    root.querySelectorAll(".sw").forEach((b, i) => b.setAttribute("aria-checked", String(state[i])));
    $("pg-meter").style.setProperty("--p", state.length ? on / state.length : 0);
  };
  const run = () => {
    clearTimeout(timer);
    if (calm) return renderOut();
    root.classList.add("run");
    timer = setTimeout(() => { root.classList.remove("run"); renderOut(); }, 420);
  };
  const renderTask = () => {
    const t = TASKS[ti];
    $("pg-ask").textContent = t.ask;
    $("pg-file").textContent = t.file;
    root.querySelectorAll(".pg-task").forEach((b, i) => b.setAttribute("aria-pressed", String(i === ti)));
    const box = $("pg-rules");
    box.textContent = "";
    t.rules.forEach((r, i) => {
      const b = el("button", "sw");
      b.type = "button"; b.setAttribute("role", "switch"); b.setAttribute("aria-checked", "false");
      const txt = el("span", "sw-text");
      txt.append(el("b", "", r.title), el("small", "", r.id + ". Source: " + r.src));
      b.append(el("span", "sw-track"), txt);
      b.addEventListener("click", () => { state[i] = !state[i]; run(); });
      box.appendChild(b);
    });
  };
  const tasks = $("pg-tasks");
  TASKS.forEach((t, i) => {
    const b = el("button", "pg-task");
    b.type = "button";
    b.append(el("b", "", t.label), el("small", "", t.lang));
    b.addEventListener("click", () => { ti = i; state = t.rules.map(() => false); renderTask(); run(); });
    tasks.appendChild(b);
  });
  $("pg-none").addEventListener("click", () => { state = state.map(() => false); run(); });
  $("pg-all").addEventListener("click", () => { state = state.map(() => true); run(); });
  renderTask();
  renderOut();
})();
