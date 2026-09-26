/**
 * Proof Playground — visual ZK / circuit explainer educational stub.
 * Simulated witnesses → gates → public outputs → prove/verify theater.
 * Not a Compact runtime. Not on-chain. Not a real proof server. Not Pages-live claims.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "mn-proof-playground-v1";
  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";
  const DOMAIN = "proof-playground:v1";

  /** @typedef {{ id: string, label: string, kind: 'witness'|'gate'|'public'|'proof', x: number, y: number, sub?: string }} Node */
  /** @typedef {{ from: string, to: string }} Edge */
  /** @typedef {{ id: string, name: string, blurb: string, desc: string, fields: Array<{key:string,label:string,type:string,hint?:string,min?:number,max?:number,default?:string|number}>, nodes: Node[], edges: Edge[], gates: Array<{name:string,role:string,pub:string}>, seed: Record<string, string|number>, compile: (w:Record<string,any>) => Promise<{ok:boolean, public: Record<string,string>, note: string, witnessVeil: number, publicSurface: number, failReason?: string}>, constrain: (w:Record<string,any>, pub: Record<string,string>) => {ok:boolean, reason: string} }} Circuit */

  /** @type {Circuit[]} */
  const CIRCUITS = [
    {
      id: "commit",
      name: "Commitment",
      blurb: "Hide a value behind H(value ‖ salt). Public sees only the hash.",
      desc: "Classic commit — public hash, private opening.",
      fields: [
        { key: "value", label: "Secret value", type: "text", hint: "Never published", default: "42" },
        { key: "salt", label: "Salt (hex or text)", type: "text", hint: "Random per commit", default: "" },
      ],
      nodes: [
        { id: "w_value", label: "value", kind: "witness", x: 70, y: 120, sub: "witness" },
        { id: "w_salt", label: "salt", kind: "witness", x: 70, y: 260, sub: "witness" },
        { id: "g_hash", label: "H(·)", kind: "gate", x: 280, y: 190, sub: "SHA-256*" },
        { id: "p_commit", label: "commit", kind: "public", x: 480, y: 140, sub: "public" },
        { id: "π", label: "π", kind: "proof", x: 480, y: 280, sub: "SIMULATED" },
      ],
      edges: [
        { from: "w_value", to: "g_hash" },
        { from: "w_salt", to: "g_hash" },
        { from: "g_hash", to: "p_commit" },
        { from: "g_hash", to: "π" },
      ],
      gates: [
        { name: "H(value‖salt)", role: "Domain-separated digest", pub: "commit only" },
        { name: "π", role: "Knowledge of opening (sim)", pub: "proof blob" },
      ],
      seed: { value: "aurora-42", salt: "" },
      async compile(w) {
        const salt = w.salt || (await randomHex(16));
        const commit = await sha256(`${DOMAIN}|commit|${w.value}|${salt}`);
        return {
          ok: true,
          public: { commit: commit, domain: DOMAIN + "|commit" },
          note: "Public sees commit only. value + salt remain witnesses.",
          witnessVeil: 100,
          publicSurface: 35,
          _salt: salt,
        };
      },
      constrain(w, pub) {
        if (!w.value) return { ok: false, reason: "value witness required" };
        if (!pub.commit) return { ok: false, reason: "missing public commit" };
        return { ok: true, reason: "opening binds to commit (sim)" };
      },
    },
    {
      id: "range",
      name: "Range ≥ T",
      blurb: "Prove amount ≥ threshold without revealing amount.",
      desc: "Threshold / range theater — flag only.",
      fields: [
        { key: "amount", label: "Private amount", type: "number", min: 0, max: 1e9, default: 75 },
        { key: "threshold", label: "Public threshold T", type: "number", min: 0, max: 1e9, default: 50 },
        { key: "salt", label: "Salt", type: "text", default: "" },
      ],
      nodes: [
        { id: "w_amt", label: "amount", kind: "witness", x: 70, y: 100, sub: "witness" },
        { id: "w_salt", label: "salt", kind: "witness", x: 70, y: 220, sub: "witness" },
        { id: "p_T", label: "T", kind: "public", x: 70, y: 340, sub: "public in" },
        { id: "g_cmp", label: "≥", kind: "gate", x: 280, y: 160, sub: "compare" },
        { id: "g_hash", label: "H(·)", kind: "gate", x: 280, y: 300, sub: "commit*" },
        { id: "p_flag", label: "met?", kind: "public", x: 500, y: 140, sub: "boolean" },
        { id: "p_commit", label: "commit", kind: "public", x: 500, y: 260, sub: "hash" },
        { id: "π", label: "π", kind: "proof", x: 500, y: 360, sub: "SIMULATED" },
      ],
      edges: [
        { from: "w_amt", to: "g_cmp" },
        { from: "p_T", to: "g_cmp" },
        { from: "w_amt", to: "g_hash" },
        { from: "w_salt", to: "g_hash" },
        { from: "g_cmp", to: "p_flag" },
        { from: "g_hash", to: "p_commit" },
        { from: "g_cmp", to: "π" },
        { from: "g_hash", to: "π" },
      ],
      gates: [
        { name: "amount ≥ T", role: "Range / threshold", pub: "boolean flag" },
        { name: "H(amount‖salt)", role: "Bind amount", pub: "commit" },
      ],
      seed: { amount: 88, threshold: 50, salt: "" },
      async compile(w) {
        const salt = w.salt || (await randomHex(16));
        const amt = Number(w.amount);
        const T = Number(w.threshold);
        const met = amt >= T;
        const commit = await sha256(`${DOMAIN}|range|${amt}|${salt}`);
        return {
          ok: true,
          public: {
            threshold: String(T),
            met: String(met),
            commit,
          },
          note: met
            ? `Threshold met (sim). amount stays private; public sees met=true + commit.`
            : `Threshold NOT met. Prove will still emit a blob, verify should reject the claim met=true.`,
          witnessVeil: 95,
          publicSurface: 45,
          _salt: salt,
          _met: met,
        };
      },
      constrain(w, pub) {
        const amt = Number(w.amount);
        const T = Number(w.threshold ?? pub.threshold);
        if (Number.isNaN(amt) || Number.isNaN(T)) return { ok: false, reason: "numeric witnesses required" };
        const claimMet = pub.met === "true";
        const actually = amt >= T;
        if (claimMet && !actually) return { ok: false, reason: "claimed met but amount < T" };
        if (!claimMet && actually) return { ok: false, reason: "public flag inconsistent" };
        return { ok: true, reason: claimMet ? "amount ≥ T (sim)" : "honest unmet flag" };
      },
    },
    {
      id: "equality",
      name: "Equality",
      blurb: "Two commits open to the same secret — without publishing it.",
      desc: "Equality of openings across commitments.",
      fields: [
        { key: "secret", label: "Shared secret", type: "text", default: "night-shared" },
        { key: "saltA", label: "Salt A", type: "text", default: "" },
        { key: "saltB", label: "Salt B", type: "text", default: "" },
      ],
      nodes: [
        { id: "w_sec", label: "secret", kind: "witness", x: 70, y: 190, sub: "witness" },
        { id: "w_sa", label: "saltA", kind: "witness", x: 70, y: 80, sub: "witness" },
        { id: "w_sb", label: "saltB", kind: "witness", x: 70, y: 300, sub: "witness" },
        { id: "g_ha", label: "H_A", kind: "gate", x: 260, y: 110, sub: "commit A" },
        { id: "g_hb", label: "H_B", kind: "gate", x: 260, y: 270, sub: "commit B" },
        { id: "g_eq", label: "eq", kind: "gate", x: 400, y: 190, sub: "same open" },
        { id: "p_a", label: "commitA", kind: "public", x: 540, y: 90, sub: "public" },
        { id: "p_b", label: "commitB", kind: "public", x: 540, y: 200, sub: "public" },
        { id: "π", label: "π", kind: "proof", x: 540, y: 320, sub: "SIMULATED" },
      ],
      edges: [
        { from: "w_sec", to: "g_ha" },
        { from: "w_sa", to: "g_ha" },
        { from: "w_sec", to: "g_hb" },
        { from: "w_sb", to: "g_hb" },
        { from: "g_ha", to: "p_a" },
        { from: "g_hb", to: "p_b" },
        { from: "g_ha", to: "g_eq" },
        { from: "g_hb", to: "g_eq" },
        { from: "w_sec", to: "g_eq" },
        { from: "g_eq", to: "π" },
      ],
      gates: [
        { name: "H(secret‖saltA)", role: "Commit A", pub: "commitA" },
        { name: "H(secret‖saltB)", role: "Commit B", pub: "commitB" },
        { name: "eq openings", role: "Same secret", pub: "via π only" },
      ],
      seed: { secret: "veil-equal", saltA: "", saltB: "" },
      async compile(w) {
        const saltA = w.saltA || (await randomHex(12));
        const saltB = w.saltB || (await randomHex(12));
        const commitA = await sha256(`${DOMAIN}|eq|A|${w.secret}|${saltA}`);
        const commitB = await sha256(`${DOMAIN}|eq|B|${w.secret}|${saltB}`);
        return {
          ok: true,
          public: { commitA, commitB },
          note: "Public sees two commits. Equality of openings is proved, not the secret.",
          witnessVeil: 100,
          publicSurface: 40,
          _saltA: saltA,
          _saltB: saltB,
        };
      },
      constrain(w, pub) {
        if (!w.secret) return { ok: false, reason: "shared secret required" };
        if (!pub.commitA || !pub.commitB) return { ok: false, reason: "both commits required" };
        return { ok: true, reason: "same opening (sim)" };
      },
    },
    {
      id: "disclose",
      name: "Selective disclose",
      blurb: "Dual-state: keep sealed, or reveal the opening on purpose.",
      desc: "Midnight dual-state teaching — disclose is a choice.",
      fields: [
        { key: "body", label: "Private body", type: "text", default: "sealed bulletin note" },
        { key: "salt", label: "Salt", type: "text", default: "" },
        { key: "disclose", label: "Disclose mode", type: "select", default: "sealed", options: [
          { value: "sealed", label: "Sealed (hash only)" },
          { value: "range", label: "Range hint (length band)" },
          { value: "full", label: "Full disclose (warn)" },
        ]},
      ],
      nodes: [
        { id: "w_body", label: "body", kind: "witness", x: 70, y: 140, sub: "vault" },
        { id: "w_salt", label: "salt", kind: "witness", x: 70, y: 280, sub: "vault" },
        { id: "g_hash", label: "H(·)", kind: "gate", x: 260, y: 140, sub: "commit" },
        { id: "g_pol", label: "policy", kind: "gate", x: 260, y: 280, sub: "disclose" },
        { id: "p_commit", label: "commit", kind: "public", x: 480, y: 100, sub: "always" },
        { id: "p_out", label: "out", kind: "public", x: 480, y: 230, sub: "optional" },
        { id: "π", label: "π", kind: "proof", x: 480, y: 350, sub: "SIMULATED" },
      ],
      edges: [
        { from: "w_body", to: "g_hash" },
        { from: "w_salt", to: "g_hash" },
        { from: "w_body", to: "g_pol" },
        { from: "g_hash", to: "p_commit" },
        { from: "g_pol", to: "p_out" },
        { from: "g_hash", to: "π" },
        { from: "g_pol", to: "π" },
      ],
      gates: [
        { name: "H(body‖salt)", role: "Always-public commit", pub: "commit" },
        { name: "policy", role: "sealed / range / full", pub: "optional out" },
      ],
      seed: { body: "Midnight dual-state note", salt: "", disclose: "sealed" },
      async compile(w) {
        const salt = w.salt || (await randomHex(16));
        const commit = await sha256(`${DOMAIN}|disc|${w.body}|${salt}`);
        const mode = w.disclose || "sealed";
        /** @type {Record<string,string>} */
        const pub = { commit, mode };
        let veil = 100;
        let surface = 30;
        let note = "Sealed: public commit only.";
        if (mode === "range") {
          const len = String(w.body || "").length;
          const band = len < 20 ? "short" : len < 80 ? "medium" : "long";
          pub.lengthBand = band;
          veil = 70;
          surface = 55;
          note = `Range hint: length band = ${band}. Body still private.`;
        } else if (mode === "full") {
          pub.body = String(w.body || "");
          veil = 0;
          surface = 100;
          note = "FULL DISCLOSE — body is now public. Teaching warn only.";
        }
        return { ok: true, public: pub, note, witnessVeil: veil, publicSurface: surface, _salt: salt };
      },
      constrain(w, pub) {
        if (!w.body) return { ok: false, reason: "body witness required" };
        if (!pub.commit) return { ok: false, reason: "missing commit" };
        if (pub.mode === "full" && pub.body !== w.body) return { ok: false, reason: "disclosed body mismatch" };
        return { ok: true, reason: `policy=${pub.mode}` };
      },
    },
    {
      id: "sum",
      name: "Threshold sum",
      blurb: "Prove a+b ≥ T without revealing a or b.",
      desc: "Aggregate privacy — sealed summands, public flag.",
      fields: [
        { key: "a", label: "Private a", type: "number", default: 30, min: 0 },
        { key: "b", label: "Private b", type: "number", default: 40, min: 0 },
        { key: "threshold", label: "Public T", type: "number", default: 50, min: 0 },
        { key: "salt", label: "Salt", type: "text", default: "" },
      ],
      nodes: [
        { id: "w_a", label: "a", kind: "witness", x: 60, y: 90, sub: "witness" },
        { id: "w_b", label: "b", kind: "witness", x: 60, y: 210, sub: "witness" },
        { id: "w_salt", label: "salt", kind: "witness", x: 60, y: 330, sub: "witness" },
        { id: "g_add", label: "+", kind: "gate", x: 220, y: 150, sub: "sum" },
        { id: "p_T", label: "T", kind: "public", x: 220, y: 300, sub: "public in" },
        { id: "g_cmp", label: "≥", kind: "gate", x: 370, y: 200, sub: "compare" },
        { id: "g_hash", label: "H(·)", kind: "gate", x: 370, y: 90, sub: "bind*" },
        { id: "p_flag", label: "met?", kind: "public", x: 540, y: 180, sub: "boolean" },
        { id: "p_commit", label: "commit", kind: "public", x: 540, y: 80, sub: "hash" },
        { id: "π", label: "π", kind: "proof", x: 540, y: 310, sub: "SIMULATED" },
      ],
      edges: [
        { from: "w_a", to: "g_add" },
        { from: "w_b", to: "g_add" },
        { from: "g_add", to: "g_cmp" },
        { from: "p_T", to: "g_cmp" },
        { from: "w_a", to: "g_hash" },
        { from: "w_b", to: "g_hash" },
        { from: "w_salt", to: "g_hash" },
        { from: "g_hash", to: "p_commit" },
        { from: "g_cmp", to: "p_flag" },
        { from: "g_cmp", to: "π" },
        { from: "g_hash", to: "π" },
      ],
      gates: [
        { name: "a + b", role: "Private sum", pub: "no" },
        { name: "sum ≥ T", role: "Threshold", pub: "boolean" },
        { name: "H(a‖b‖salt)", role: "Bind summands", pub: "commit" },
      ],
      seed: { a: 33, b: 41, threshold: 50, salt: "" },
      async compile(w) {
        const salt = w.salt || (await randomHex(16));
        const a = Number(w.a);
        const b = Number(w.b);
        const T = Number(w.threshold);
        const met = a + b >= T;
        const commit = await sha256(`${DOMAIN}|sum|${a}|${b}|${salt}`);
        return {
          ok: true,
          public: { threshold: String(T), met: String(met), commit },
          note: met
            ? "Sum meets T. a and b stay private."
            : "Sum below T — verify should reject a met=true claim.",
          witnessVeil: 95,
          publicSurface: 45,
          _salt: salt,
          _met: met,
        };
      },
      constrain(w, pub) {
        const a = Number(w.a);
        const b = Number(w.b);
        const T = Number(w.threshold ?? pub.threshold);
        if ([a, b, T].some((n) => Number.isNaN(n))) return { ok: false, reason: "numeric witnesses required" };
        const claimMet = pub.met === "true";
        const actually = a + b >= T;
        if (claimMet !== actually) return { ok: false, reason: "public met flag inconsistent with a+b" };
        return { ok: true, reason: claimMet ? "a+b ≥ T (sim)" : "honest unmet" };
      },
    },
  ];

  /** @type {Circuit} */
  let active = CIRCUITS[0];
  /** @type {Record<string, any>} */
  let witnesses = {};
  /** @type {{ public: Record<string,string>, note: string, witnessVeil: number, publicSurface: number, circuitId: string, saltExtras?: any } | null} */
  let compiled = null;
  /** @type {{ blob: string, circuitId: string, public: Record<string,string>, ok: boolean, verified: boolean|null, at: string, note: string } | null} */
  let lastProof = null;
  /** @type {Array<{ id: string, circuitId: string, name: string, blob: string, verified: boolean|null, at: string, note: string }>} */
  let history = [];
  let proving = false;
  let edgesPulsing = false;

  function randomHex(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function sha256(text) {
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function short(hex, n = 10) {
    if (!hex) return "—";
    return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-6)}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function announce(msg) {
    const el = document.getElementById("live-region");
    if (el) el.textContent = msg;
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  function setStatus(id, text, kind = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `status${kind ? ` ${kind}` : ""}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      history = Array.isArray(data?.history) ? data.history : [];
      if (data?.activeId) {
        const found = CIRCUITS.find((c) => c.id === data.activeId);
        if (found) active = found;
      }
    } catch {
      history = [];
    }
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ history, activeId: active.id, savedAt: new Date().toISOString() })
    );
  }

  function setJourney(phase, detail) {
    const order = ["idle", "witness", "compiled", "proven", "verified"];
    const idx = order.indexOf(phase);
    document.querySelectorAll(".journey-step").forEach((step) => {
      const p = step.getAttribute("data-phase");
      const pi = order.indexOf(p || "");
      step.classList.remove("is-active", "is-done");
      step.removeAttribute("aria-current");
      if (p === phase) {
        step.classList.add("is-active");
        step.setAttribute("aria-current", "step");
      } else if (pi >= 0 && pi < idx) {
        step.classList.add("is-done");
      }
    });
    const live = document.getElementById("journey-live");
    if (live) {
      live.textContent = detail || `Phase: ${phase}`;
      live.className = `journey-live status${
        phase === "verified" || phase === "proven"
          ? " ok"
          : phase === "compiled" || phase === "witness"
            ? " warn"
            : ""
      }`;
    }
  }

  function syncRails(veil = 100, surface = 0) {
    const setMeter = (id, pct, labelId, label) => {
      const meter = document.getElementById(id);
      const fill = meter?.querySelector(".rail-fill");
      const lab = document.getElementById(labelId);
      if (fill) fill.style.width = `${pct}%`;
      if (meter) meter.setAttribute("aria-valuenow", String(pct));
      if (lab) lab.textContent = label;
    };
    setMeter("rail-witness", veil, "rail-witness-label", `${veil}% private witnesses`);
    setMeter("rail-public", surface, "rail-public-label", `${surface}% public surface`);
  }

  function renderPicker() {
    const root = document.getElementById("circuit-picker");
    if (!root) return;
    root.innerHTML = CIRCUITS.map(
      (c) => `
      <button type="button" class="circuit-chip${c.id === active.id ? " is-active" : ""}"
        role="option" aria-selected="${c.id === active.id}" data-circuit="${c.id}">
        <span class="cc-id">${escapeHtml(c.id)}</span>
        <strong>${escapeHtml(c.name)}</strong>
        <span class="cc-desc">${escapeHtml(c.blurb)}</span>
      </button>`
    ).join("");
    root.querySelectorAll(".circuit-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-circuit");
        const c = CIRCUITS.find((x) => x.id === id);
        if (c) selectCircuit(c);
      });
    });
  }

  function selectCircuit(c) {
    active = c;
    compiled = null;
    lastProof = null;
    witnesses = {};
    c.fields.forEach((f) => {
      witnesses[f.key] = f.default ?? "";
    });
    renderPicker();
    renderWitnessForm();
    drawCircuit(false);
    renderGateTable();
    resetStages();
    updatePublicPreview(null);
    setProofCard("No proof yet", "—", "");
    setJourney("idle", `Phase: idle — ${c.name} selected. Set witnesses.`);
    syncRails(100, 0);
    save();
    announce(`Circuit ${c.name} selected`);
    toast(`${c.name} circuit ready`);
  }

  function renderWitnessForm() {
    const root = document.getElementById("witness-fields");
    const blurb = document.getElementById("circuit-blurb");
    if (blurb) blurb.textContent = active.desc + " · " + active.blurb;
    if (!root) return;
    root.innerHTML = active.fields
      .map((f) => {
        if (f.type === "select") {
          const opts = (f.options || [])
            .map(
              (o) =>
                `<option value="${escapeHtml(o.value)}"${
                  String(witnesses[f.key]) === o.value ? " selected" : ""
                }>${escapeHtml(o.label)}</option>`
            )
            .join("");
          return `<div class="field">
            <label for="w-${f.key}">${escapeHtml(f.label)}</label>
            <select id="w-${f.key}" data-key="${f.key}">${opts}</select>
            ${f.hint ? `<p class="hint">${escapeHtml(f.hint)}</p>` : ""}
          </div>`;
        }
        const t = f.type === "number" ? "number" : "text";
        return `<div class="field">
          <label for="w-${f.key}">${escapeHtml(f.label)}</label>
          <input id="w-${f.key}" data-key="${f.key}" type="${t}"
            ${f.min != null ? `min="${f.min}"` : ""} ${f.max != null ? `max="${f.max}"` : ""}
            value="${escapeHtml(String(witnesses[f.key] ?? ""))}" />
          ${f.hint ? `<p class="hint">${escapeHtml(f.hint)}</p>` : ""}
        </div>`;
      })
      .join("");
    root.querySelectorAll("[data-key]").forEach((el) => {
      el.addEventListener("input", () => {
        const key = el.getAttribute("data-key");
        if (!key) return;
        witnesses[key] = el.type === "number" ? el.valueAsNumber : el.value;
        if (compiled) {
          compiled = null;
          lastProof = null;
          setJourney("witness", "Phase: witness — inputs changed; recompile.");
          updatePublicPreview(null);
        } else {
          setJourney("witness", "Phase: witness — private inputs editing.");
        }
      });
    });
  }

  function readWitnessesFromForm() {
    active.fields.forEach((f) => {
      const el = document.getElementById(`w-${f.key}`);
      if (!el) return;
      if (f.type === "number") witnesses[f.key] = el.value === "" ? NaN : Number(el.value);
      else witnesses[f.key] = el.value;
    });
    return witnesses;
  }

  function nodeCenter(n) {
    return { x: n.x + 48, y: n.y + 28 };
  }

  function drawCircuit(lit) {
    const edgesG = document.getElementById("edges-layer");
    const nodesG = document.getElementById("nodes-layer");
    if (!edgesG || !nodesG) return;
    const byId = Object.fromEntries(active.nodes.map((n) => [n.id, n]));

    edgesG.innerHTML = active.edges
      .map((e, i) => {
        const a = byId[e.from];
        const b = byId[e.to];
        if (!a || !b) return "";
        const A = nodeCenter(a);
        const B = nodeCenter(b);
        const mx = (A.x + B.x) / 2;
        const d = `M ${A.x} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${B.x} ${B.y}`;
        return `<path class="edge-path${lit ? " is-active" : ""}" data-edge="${i}" d="${d}" />
          <path class="edge-pulse${edgesPulsing ? " is-run" : ""}" data-pulse="${i}" d="${d}" />`;
      })
      .join("");

    nodesG.innerHTML = active.nodes
      .map((n) => {
        const w = 96;
        const h = 56;
        const rx = n.kind === "gate" ? 12 : n.kind === "proof" ? 28 : 14;
        return `<g class="node-g${lit ? " is-lit" : ""}" data-kind="${n.kind}" data-id="${n.id}" transform="translate(${n.x},${n.y})">
          <rect class="node-body" width="${w}" height="${h}" rx="${rx}" ${n.kind === "proof" ? 'filter="url(#softGlow)"' : ""} />
          <text class="node-label" x="${w / 2}" y="24" text-anchor="middle">${escapeHtml(n.label)}</text>
          <text class="node-sub" x="${w / 2}" y="40" text-anchor="middle">${escapeHtml(n.sub || n.kind)}</text>
        </g>`;
      })
      .join("");
  }

  function setEdgesPulsing(on) {
    edgesPulsing = on;
    document.querySelectorAll(".edge-pulse").forEach((p) => {
      p.classList.toggle("is-run", on);
    });
    document.querySelectorAll(".edge-path").forEach((p) => {
      p.classList.toggle("is-active", on || !!compiled);
    });
    document.querySelectorAll(".node-g").forEach((n) => {
      n.classList.toggle("is-lit", on || !!compiled);
    });
  }

  function renderGateTable() {
    const body = document.getElementById("gate-table-body");
    if (!body) return;
    body.innerHTML = active.gates
      .map(
        (g) =>
          `<tr><td><code>${escapeHtml(g.name)}</code></td><td>${escapeHtml(g.role)}</td><td>${escapeHtml(g.pub)}</td></tr>`
      )
      .join("");
  }

  function updatePublicPreview(comp) {
    const el = document.getElementById("public-preview");
    if (!el) return;
    if (!comp) {
      el.innerHTML = `<strong>No compile yet</strong>Public outputs appear here after compile — never the raw witnesses (unless you pick selective disclose).`;
      return;
    }
    const lines = Object.entries(comp.public)
      .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(short(String(v), 14))}`)
      .join("\n");
    el.innerHTML = `<strong>Public outputs · ${escapeHtml(active.name)}</strong><pre style="margin:0;white-space:pre-wrap;font:inherit;color:inherit">${lines}</pre><p class="hint" style="margin:0.5rem 0 0">${escapeHtml(comp.note)}</p>`;
  }

  function resetStages() {
    document.querySelectorAll(".prove-stages li").forEach((li) => {
      li.classList.remove("is-active", "is-done", "is-fail");
      const meta = li.querySelector("[data-stage-meta]");
      if (meta) meta.textContent = "—";
    });
    setMeter(0, "0% — idle");
  }

  function setStage(stage, state, meta) {
    const li = document.querySelector(`.prove-stages li[data-stage="${stage}"]`);
    if (!li) return;
    li.classList.remove("is-active", "is-done", "is-fail");
    if (state) li.classList.add(state);
    const m = li.querySelector("[data-stage-meta]");
    if (m && meta != null) m.textContent = meta;
  }

  function setMeter(pct, label) {
    const fill = document.getElementById("proof-meter-fill");
    const meter = document.getElementById("proof-meter");
    const lab = document.getElementById("proof-meter-label");
    if (fill) fill.style.width = `${pct}%`;
    if (meter) meter.setAttribute("aria-valuenow", String(pct));
    if (lab) lab.textContent = label;
  }

  function setProofCard(title, hash, note, kind = "") {
    const card = document.getElementById("proof-result-card");
    const t = document.getElementById("proof-result-title");
    const h = document.getElementById("proof-result-hash");
    const n = document.getElementById("proof-result-note");
    if (t) t.textContent = title;
    if (h) h.textContent = hash;
    if (n) n.textContent = note || "LOCAL STUB · simulated proof blob only.";
    if (card) {
      card.classList.remove("is-ok", "is-fail");
      if (kind) card.classList.add(kind);
    }
  }

  function logLine(msg) {
    const el = document.getElementById("theater-log");
    if (!el) return;
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    const prev = el.textContent === "Awaiting prove…" ? "" : el.textContent + "\n";
    el.textContent = prev + `[${ts}] ${msg}`;
    el.scrollTop = el.scrollHeight;
  }

  async function compileGraph() {
    readWitnessesFromForm();
    // auto-fill empty salts in form for UX
    for (const f of active.fields) {
      if (f.key.toLowerCase().includes("salt") && !witnesses[f.key]) {
        witnesses[f.key] = await randomHex(12);
        const el = document.getElementById(`w-${f.key}`);
        if (el) el.value = witnesses[f.key];
      }
    }
    const result = await active.compile(witnesses);
    if (result._salt) witnesses.salt = result._salt;
    if (result._saltA) witnesses.saltA = result._saltA;
    if (result._saltB) witnesses.saltB = result._saltB;
    ["salt", "saltA", "saltB"].forEach((k) => {
      if (witnesses[k]) {
        const el = document.getElementById(`w-${k}`);
        if (el && !el.value) el.value = witnesses[k];
      }
    });
    compiled = {
      public: result.public,
      note: result.note,
      witnessVeil: result.witnessVeil,
      publicSurface: result.publicSurface,
      circuitId: active.id,
    };
    drawCircuit(true);
    updatePublicPreview(compiled);
    syncRails(result.witnessVeil, result.publicSurface);
    setStatus("compile-status", "Graph compiled · public outputs ready (sim).", "ok");
    setJourney("compiled", `Phase: compiled — ${active.name} graph lit.`);
    logLine(`compile ${active.id} · public keys: ${Object.keys(result.public).join(", ")}`);
    announce("Circuit compiled");
    toast("Graph compiled");
    return compiled;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function runProve() {
    if (proving) return;
    proving = true;
    try {
      if (!compiled || compiled.circuitId !== active.id) {
        await compileGraph();
      }
      resetStages();
      setEdgesPulsing(true);
      setJourney("compiled", "Phase: compiled — entering prove theater…");

      setStage("bind", "is-active", "…");
      setMeter(15, "15% — binding witnesses");
      await sleep(450);
      const bindHash = await sha256(
        `${DOMAIN}|bind|${active.id}|${JSON.stringify(witnesses)}`
      );
      setStage("bind", "is-done", short(bindHash, 6));
      logLine(`bind · ${short(bindHash)}`);

      setStage("constrain", "is-active", "…");
      setMeter(40, "40% — constraining gates");
      await sleep(500);
      const check = active.constrain(witnesses, compiled.public);
      if (!check.ok) {
        setStage("constrain", "is-fail", "reject");
        setMeter(40, "40% — constraint failed");
        setEdgesPulsing(false);
        setProofCard("Constraint rejected", "—", check.reason, "is-fail");
        lastProof = {
          blob: "",
          circuitId: active.id,
          public: { ...compiled.public },
          ok: false,
          verified: false,
          at: new Date().toISOString(),
          note: check.reason,
        };
        pushHistory(false, check.reason);
        setJourney("proven", `Phase: proven — REJECTED at constrain · ${check.reason}`);
        logLine(`constrain FAIL · ${check.reason}`);
        announce("Proof rejected at constrain");
        toast("Constraint failed");
        return;
      }
      setStage("constrain", "is-done", "ok");
      logLine(`constrain · ${check.reason}`);

      setStage("prove", "is-active", "…");
      setMeter(70, "70% — emitting proof blob");
      await sleep(550);
      const blob = await sha256(
        `${DOMAIN}|π|${active.id}|${bindHash}|${JSON.stringify(compiled.public)}|${await randomHex(8)}`
      );
      setStage("prove", "is-done", short(blob, 6));
      lastProof = {
        blob,
        circuitId: active.id,
        public: { ...compiled.public },
        ok: true,
        verified: null,
        at: new Date().toISOString(),
        note: "SIMULATED proof blob (SHA-256 stand-in)",
      };
      setProofCard("Simulated proof ready", blob, lastProof.note, "");
      setJourney("proven", "Phase: proven — simulated π ready. Verify next.");
      setMeter(85, "85% — proof emitted (sim)");
      logLine(`prove · π=${short(blob)}`);
      announce("Simulated proof emitted");
      toast("Proof blob ready");

      // auto-advance verify stage slot idle
      setStage("verify", "", "awaiting");
    } finally {
      setEdgesPulsing(false);
      if (compiled) drawCircuit(true);
      proving = false;
    }
  }

  async function runVerify() {
    if (!lastProof || !lastProof.ok || !lastProof.blob) {
      toast("Prove first");
      announce("No proof to verify");
      return;
    }
    if (!compiled) {
      toast("Recompile required");
      return;
    }
    setEdgesPulsing(true);
    setStage("verify", "is-active", "…");
    setMeter(92, "92% — verifying");
    await sleep(500);
    // Tamper detection: public must match compiled + constrain still holds
    const pubsMatch =
      JSON.stringify(lastProof.public) === JSON.stringify(compiled.public);
    const check = active.constrain(witnesses, compiled.public);
    const ok = pubsMatch && check.ok;
    setEdgesPulsing(false);
    if (ok) {
      setStage("verify", "is-done", "ACCEPT");
      setMeter(100, "100% — verified (sim)");
      lastProof.verified = true;
      setProofCard("Verified ✓ (simulated)", lastProof.blob, check.reason, "is-ok");
      setJourney("verified", "Phase: verified — ACCEPT against public outputs.");
      logLine(`verify ACCEPT · ${check.reason}`);
      pushHistory(true, check.reason);
      announce("Proof verified");
      toast("Verified (sim)");
    } else {
      setStage("verify", "is-fail", "REJECT");
      setMeter(100, "100% — rejected");
      lastProof.verified = false;
      const reason = !pubsMatch ? "public outputs tampered vs proof bind" : check.reason;
      setProofCard("Rejected ✗", lastProof.blob || "—", reason, "is-fail");
      setJourney("verified", `Phase: verified — REJECT · ${reason}`);
      logLine(`verify REJECT · ${reason}`);
      pushHistory(false, reason);
      announce("Proof rejected");
      toast("Rejected");
    }
    drawCircuit(true);
    renderHistory();
    save();
  }

  function tamperPublic() {
    if (!compiled) {
      toast("Compile first");
      return;
    }
    const keys = Object.keys(compiled.public);
    if (!keys.length) return;
    const k = keys[0];
    compiled.public[k] = "TAMPERED_" + (compiled.public[k] || "").slice(0, 8);
    updatePublicPreview(compiled);
    syncRails(compiled.witnessVeil, Math.min(100, compiled.publicSurface + 20));
    logLine(`tamper · public.${k} mutated (demo fail path)`);
    setStatus("compile-status", "Public outputs tampered — verify should fail.", "warn");
    toast("Public tampered");
    announce("Public outputs tampered for demo fail");
    if (lastProof) {
      // keep old proof blob bound to old publics — verify will catch mismatch
      setProofCard("Proof stale vs tampered public", lastProof.blob, "Re-verify to see reject", "");
    }
  }

  function pushHistory(verified, note) {
    if (!lastProof) return;
    history.unshift({
      id: randomHex(6),
      circuitId: active.id,
      name: active.name,
      blob: lastProof.blob || "",
      verified,
      at: new Date().toISOString(),
      note,
    });
    history = history.slice(0, 40);
    renderHistory();
    save();
  }

  function renderHistory() {
    const list = document.getElementById("history-list");
    const runs = document.getElementById("stat-runs");
    const ok = document.getElementById("stat-ok");
    const fail = document.getElementById("stat-fail");
    if (runs) runs.textContent = String(history.length);
    if (ok) ok.textContent = String(history.filter((h) => h.verified === true).length);
    if (fail) fail.textContent = String(history.filter((h) => h.verified === false).length);
    if (!list) return;
    if (!history.length) {
      list.className = "history-list is-empty";
      list.innerHTML = "No runs yet — prove something in the theater.";
      return;
    }
    list.className = "history-list";
    list.innerHTML = history
      .map((h) => {
        const icon = h.verified === true ? "✓" : h.verified === false ? "✗" : "π";
        const when = new Date(h.at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return `<li>
          <span class="h-icon" aria-hidden="true">${icon}</span>
          <div>
            <strong>${escapeHtml(h.name)}</strong>
            <div class="muted small">${escapeHtml(h.note || "")}</div>
            <div class="mono small" style="margin-top:0.25rem">${h.blob ? short(h.blob, 12) : "—"}</div>
          </div>
          <span class="muted small">${escapeHtml(when)}</span>
        </li>`;
      })
      .join("");
  }

  async function seedDemo() {
    const seed = { ...active.seed };
    for (const f of active.fields) {
      if (f.key.toLowerCase().includes("salt") && !seed[f.key]) {
        seed[f.key] = await randomHex(12);
      }
      witnesses[f.key] = seed[f.key] ?? f.default ?? "";
      const el = document.getElementById(`w-${f.key}`);
      if (el) el.value = String(witnesses[f.key]);
    }
    setJourney("witness", "Phase: witness — demo values seeded.");
    toast("Demo witnesses seeded");
    await compileGraph();
  }

  async function seedHistoryRun() {
    selectCircuit(CIRCUITS.find((c) => c.id === "range") || CIRCUITS[0]);
    await seedDemo();
    await runProve();
    await runVerify();
  }

  function resetStudio() {
    if (!confirm("Reset Proof Playground? Clears history and local state.")) return;
    history = [];
    compiled = null;
    lastProof = null;
    localStorage.removeItem(STORAGE_KEY);
    selectCircuit(CIRCUITS[0]);
    document.getElementById("theater-log").textContent = "Awaiting prove…";
    renderHistory();
    toast("Studio reset");
    announce("Studio reset");
  }

  async function copyAddr(btnId, statusId) {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      setStatus(statusId, "Copied Cardano donation address.", "ok");
      toast("Donate address copied");
      announce("Donation address copied");
    } catch {
      setStatus(statusId, "Copy failed — select the address manually.", "warn");
    }
    const btn = document.getElementById(btnId);
    if (btn) btn.focus();
  }

  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 12000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.02 + 0.005,
      }));
    }

    function frame(t) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const s of stars) {
        const twinkle = reduced ? s.a : s.a * (0.65 + 0.35 * Math.sin(t * s.sp + s.tw));
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 220, 255, ${twinkle})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", () => {
      resize();
      if (reduced) frame(0);
    });
    raf = requestAnimationFrame(frame);
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function initHelp() {
    const overlay = document.getElementById("help-overlay");
    const close = () => {
      if (!overlay) return;
      overlay.hidden = true;
    };
    const open = () => {
      if (!overlay) return;
      overlay.hidden = false;
      document.getElementById("btn-close-help")?.focus();
    };
    document.getElementById("btn-close-help")?.addEventListener("click", close);
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    return { open, close, isOpen: () => overlay && !overlay.hidden };
  }

  function init() {
    load();
    const help = initHelp();
    renderPicker();
    selectCircuit(active);
    renderHistory();
    initStarfield();
    initReveal();
    initNav();

    document.getElementById("btn-compile")?.addEventListener("click", () => {
      compileGraph().catch((e) => {
        console.error(e);
        toast("Compile failed");
      });
    });
    document.getElementById("btn-seed-w")?.addEventListener("click", () => {
      seedDemo().catch(console.error);
    });
    document.getElementById("btn-prove")?.addEventListener("click", () => {
      runProve().catch(console.error);
    });
    document.getElementById("btn-verify")?.addEventListener("click", () => {
      runVerify().catch(console.error);
    });
    document.getElementById("btn-tamper")?.addEventListener("click", tamperPublic);
    document.getElementById("btn-seed-history")?.addEventListener("click", () => {
      seedHistoryRun().catch(console.error);
    });
    document.getElementById("btn-reset")?.addEventListener("click", resetStudio);
    document.getElementById("btn-copy-donate")?.addEventListener("click", () =>
      copyAddr("btn-copy-donate", "donate-status")
    );
    document.getElementById("dock-copy-addr")?.addEventListener("click", () =>
      copyAddr("dock-copy-addr", "donate-status")
    );

    document.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;
      if (e.key === "Escape") {
        help.close();
        return;
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        if (!typing) {
          e.preventDefault();
          if (help.isOpen()) help.close();
          else help.open();
        }
        return;
      }
      if (typing) return;
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        document.getElementById("circuit-picker")?.focus();
        document.getElementById("circuits")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        runProve().catch(console.error);
      } else if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        runVerify().catch(console.error);
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        copyAddr("dock-copy-addr", "donate-status");
      } else if (e.key === "N" && e.shiftKey) {
        e.preventDefault();
        seedDemo().catch(console.error);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
