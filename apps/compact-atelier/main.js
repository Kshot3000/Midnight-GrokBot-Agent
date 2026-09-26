/**
 * Compact Atelier — editable Compact snippets + explain panel.
 * Teaching theater only. Not a Compact compiler. Not on-chain. Not Pages-live.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "mn-compact-atelier-v1";
  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";

  /** @type {{id:string,title:string,icon:string,blurb:string,tags:string[],source:string,highlights:{token:string,title:string,kind:string,body:string,bullets:string[]}[]}[]} */
  const LESSONS = [
    {
      id: "hello-counter",
      title: "Hello Counter",
      icon: "①",
      blurb: "pragma · import · public Counter ledger · increment circuit.",
      tags: ["ledger", "circuit", "pragma"],
      source: `/*
 * hello.compact — educational Compact starter (lab skeleton)
 * NOT production. Align pragma with official compatibility matrix:
 *   https://docs.midnight.network/getting-started/installation
 *   https://docs.midnight.network/compact
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

// Public, on-chain counter (standard-library ledger type).
export ledger greetings: Counter;

/**
 * increment — public circuit that bumps the on-chain counter by 1.
 * Callers pay fees in DUST (tDUST on testnets). No private inputs here.
 */
export circuit increment(): [] {
  greetings.increment(1);
}
`,
      highlights: [
        {
          token: "pragma",
          title: "pragma language_version",
          kind: "Language pin",
          body: "Pins the Compact language revision your compiler expects. Lab skeletons target ≥ 0.23 to match create-mn-app / escrow notes — always verify against the official matrix before compiling.",
          bullets: [
            "If your compiler rejects `>=`, try an exact pin.",
            "Wrong pragma → confusing compile errors later.",
          ],
        },
        {
          token: "import CompactStandardLibrary",
          title: "CompactStandardLibrary",
          kind: "Import",
          body: "Brings in ledger types like Counter, Maps, Bytes helpers, and other standard primitives. Prefer the official library over inventing types.",
          bullets: ["Counter is a public ledger accumulator.", "Do not invent alternate stdlib names."],
        },
        {
          token: "export ledger",
          title: "export ledger",
          kind: "Public state",
          body: "Declares replicated on-chain state. Observers can see ledger fields; private witnesses must never be declared as ledger.",
          bullets: ["Dual-state: public ledger ↔ private local witnesses.", "This counter has no private inputs."],
        },
        {
          token: "export circuit",
          title: "export circuit",
          kind: "Circuit",
          body: "A circuit is the ZK-backed transition callers invoke. Public circuits can mutate ledger state; private witnesses stay off-chain unless disclosed.",
          bullets: ["`increment()` takes no private args here.", "Fees are paid in DUST / tDUST — not simulated in this UI."],
        },
      ],
    },
    {
      id: "witness-secret",
      title: "Witness Secret",
      icon: "②",
      blurb: "Private host-supplied witness — never lands on the ledger.",
      tags: ["witness", "privacy"],
      source: `/*
 * witness-secret.compact — teaching skeleton
 * Witnesses are host-supplied local secrets. They are NOT ledger fields.
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

export ledger pubCommit: Bytes<32>;

/* Host supplies this; Compact does not store it on-chain. */
witness localSecretKey(): Bytes<32>;

export circuit sealCommit(): [] {
  /* Teaching stand-in: hash a private witness into a public commitment. */
  /* Real APIs: verify persistentHash / pad against Compact docs before compile. */
  const sk = localSecretKey();
  pubCommit = persistentHash<Bytes<32>>(pad(32, "atelier:commit:") || sk);
  disclose(pubCommit);
}
`,
      highlights: [
        {
          token: "witness",
          title: "witness",
          kind: "Private input",
          body: "A witness is local / off-chain data the prover supplies. It never becomes a ledger field unless you explicitly disclose a derived public value.",
          bullets: [
            "Keep secrets in witnesses, not `export ledger`.",
            "Callers cannot read other users' witnesses from chain state.",
          ],
        },
        {
          token: "persistentHash",
          title: "persistentHash (teaching)",
          body: "Domain-separated hashing appears across Midnight examples (bboard, escrow notes). Exact generic / helper signatures vary by Compact release — verify before compile.",
          kind: "Crypto helper",
          bullets: ["Always domain-separate (`atelier:commit:` style tags).", "This atelier does not execute real Compact crypto."],
        },
        {
          token: "disclose",
          title: "disclose()",
          kind: "Publicize",
          body: "Marks a value that must become visible as part of the public transition. Teaching pattern from official bboard / leaderboard guides — confirm current syntax in docs.",
          bullets: ["Disclose the commitment, not the raw secret.", "Over-disclose collapses the privacy rail."],
        },
      ],
    },
    {
      id: "mps-0029",
      title: "MPS-0029 Auth",
      icon: "③",
      blurb: "Never authorize with ownPublicKey() alone — use witness commitments.",
      tags: ["auth", "MPS-0029", "witness"],
      source: `/*
 * mps-0029-auth.compact — teaching skeleton
 * MPS-0029: NEVER authorize privileged circuits with ownPublicKey() alone.
 * Prefer witness-derived role commitments (bboard / agent-escrow patterns).
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

export ledger adminCommit: Bytes<32>;
export ledger sequence: Counter;

witness localSecretKey(): Bytes<32>;

/* Teaching helper — verify persistentHash / pad against Compact docs. */
circuit roleCommitment(tag: Bytes<32>): Bytes<32> {
  return persistentHash<Bytes<32>>(
    pad(32, "agent-escrow:role:") || tag || localSecretKey()
  );
}

export circuit claimAdmin(roleTag: Bytes<32>): [] {
  const expected = roleCommitment(roleTag);
  assert(adminCommit == expected, "not admin");
  sequence.increment(1);
  disclose(sequence);
}

/*
 * Anti-pattern (do NOT ship):
 *   assert(ownPublicKey() == storedPk); // prover-supplied, bypassable
 */
`,
      highlights: [
        {
          token: "ownPublicKey",
          title: "ownPublicKey() anti-pattern",
          kind: "MPS-0029",
          body: "ownPublicKey() is prover-supplied. Comparing it alone to a stored key does not prove key ownership — attackers can assert any key inside the proof.",
          bullets: [
            "Use witness-derived commitments (localSecretKey + domain tag).",
            "See lab contracts/agent-escrow and midnightntwrk/example-bboard.",
          ],
        },
        {
          token: "roleCommitment",
          title: "roleCommitment",
          kind: "Auth helper",
          body: "Domain-separated hash of (role tag ∥ local secret). Only someone holding the witness can satisfy the assert — teaching stand-in for real Compact auth.",
          bullets: ["Keep role tags domain-separated.", "Store commitments on ledger, not raw secrets."],
        },
        {
          token: "assert",
          title: "assert",
          kind: "Constraint",
          body: "Fails the circuit (and proof) when the condition is false. Privileged transitions should assert witness-derived identity checks.",
          bullets: ["Failed assert → no valid proof.", "Pair with disclose of public outcomes only."],
        },
      ],
    },
    {
      id: "disclose-pattern",
      title: "Disclose Pattern",
      icon: "④",
      blurb: "Every ledger write should be intentional — disclose public outcomes.",
      tags: ["disclose", "ledger"],
      source: `/*
 * disclose-pattern.compact — teaching skeleton
 * Pattern note from lab escrow / bboard: disclose() on ledger-visible writes.
 * Confirm current Compact syntax in official docs before compiling.
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

export ledger notice: Bytes<32>;
export ledger noticeCount: Counter;

witness localSecretKey(): Bytes<32>;

export circuit postNotice(bodyHash: Bytes<32>): [] {
  /* bodyHash is already a public commitment to private content. */
  notice = bodyHash;
  noticeCount.increment(1);
  disclose(notice);
  disclose(noticeCount);
}
`,
      highlights: [
        {
          token: "disclose",
          title: "disclose on writes",
          kind: "Publicize",
          body: "When a circuit mutates public ledger state, teaching examples often call disclose() on the written fields so the public transcript is explicit.",
          bullets: ["Disclose commitments, not plaintext bodies.", "Syntax may vary by Compact release — check docs."],
        },
        {
          token: "bodyHash",
          title: "Public commitment arg",
          kind: "Interface",
          body: "Passing a hash/commitment as a circuit argument keeps the plaintext off-chain while still binding the public ledger to a specific notice.",
          bullets: ["Private body stays in the DApp vault.", "Ledger stores only the commitment."],
        },
      ],
    },
    {
      id: "map-ledger",
      title: "Map + Counter",
      icon: "⑤",
      blurb: "Map ledger entries with a Counter for freshness / counts.",
      tags: ["Map", "Counter", "ledger"],
      source: `/*
 * map-ledger.compact — teaching skeleton
 * Maps + Counters appear in escrow / bboard-style contracts.
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

struct Entry {
  commit: Bytes<32>,
  active: Boolean
}

export ledger entries: Map<Uint<64>, Entry>;
export ledger entryCount: Counter;

export circuit register(id: Uint<64>, commit: Bytes<32>): [] {
  entries.insert(id, Entry { commit: commit, active: true });
  entryCount.increment(1);
  disclose(entryCount);
}
`,
      highlights: [
        {
          token: "Map",
          title: "Map ledger",
          kind: "Collection",
          body: "Public key→value store on the ledger. Values should prefer commitments over sensitive plaintext.",
          bullets: ["Keys are public identifiers.", "Confirm insert / Map APIs in Compact reference."],
        },
        {
          token: "struct",
          title: "struct",
          kind: "Composite type",
          body: "Groups fields into a typed value you can store in ledgers or pass through circuits.",
          bullets: ["Keep private openings out of structs you ledger.", "Booleans / Bytes sizes must match language rules."],
        },
        {
          token: "Counter",
          title: "Counter",
          kind: "Ledger type",
          body: "Monotonic public counter — useful for sequences, tallies, and freshness without exposing private reasons for the bump.",
          bullets: ["increment(n) is the common teaching op.", "Often disclosed after mutation."],
        },
      ],
    },
    {
      id: "commit-nullifier",
      title: "Commit + Nullifier",
      icon: "⑥",
      blurb: "Commitment for binding · nullifier for one-shot spend / revoke.",
      tags: ["commit", "nullifier", "privacy"],
      source: `/*
 * commit-nullifier.compact — teaching skeleton
 * Commitment binds private openings; nullifier burns reuse (ballot / passport lessons).
 * Crypto helpers are teaching stand-ins — verify Compact / Zswap primitives before shipping.
 */

pragma language_version >= 0.23;

import CompactStandardLibrary;

export ledger commitment: Bytes<32>;
export ledger nullifierSet: Map<Bytes<32>, Boolean>;

witness localSecretKey(): Bytes<32>;
witness opening(): Bytes<32>;

export circuit publish(): [] {
  const sk = localSecretKey();
  const open = opening();
  commitment = persistentHash<Bytes<32>>(pad(32, "atelier:cm:") || open || sk);
  disclose(commitment);
}

export circuit revoke(): [] {
  const sk = localSecretKey();
  const nf = persistentHash<Bytes<32>>(pad(32, "atelier:nf:") || sk);
  assert(nullifierSet.lookup(nf) != true, "already revoked");
  nullifierSet.insert(nf, true);
  disclose(nf);
}
`,
      highlights: [
        {
          token: "commitment",
          title: "Commitment",
          kind: "Binding",
          body: "A public hash that binds private openings without revealing them. Verifiers see the commit; openings stay local until selectively disclosed.",
          bullets: ["Domain-separate commit tags.", "Same idea as Shield Board / Passport commits in this lab."],
        },
        {
          token: "nullifier",
          title: "Nullifier",
          kind: "One-shot",
          body: "A public marker derived from a secret that proves a note/credential was spent or revoked without revealing which private opening it came from — beyond the burn itself.",
          bullets: ["Double-revoke should assert-fail.", "Used in ballot / passport teaching flows."],
        },
      ],
    },
  ];

  const GLOSSARY = [
    { token: "pragma", title: "pragma language_version", kind: "Language pin", body: "Pins Compact language revision. Verify against the official compatibility matrix before compile.", bullets: ["Lab target often ≥ 0.23.", "Exact pins may be required by some compilers."] },
    { token: "import", title: "import CompactStandardLibrary", kind: "Import", body: "Standard ledger types and helpers. Prefer official names — do not invent a parallel stdlib.", bullets: ["Counter, Map, Bytes, Uint…", "Docs: compact reference"] },
    { token: "ledger", title: "export ledger", kind: "Public state", body: "Replicated on-chain state. Dual-state model: public ledger vs private witnesses.", bullets: ["Observers can read ledger fields.", "Never put raw secrets here."] },
    { token: "circuit", title: "export circuit", kind: "Circuit", body: "ZK-backed transition. Proves a valid state change without revealing private witnesses.", bullets: ["Public outputs via disclose / ledger writes.", "Fees in DUST / tDUST on real networks."] },
    { token: "witness", title: "witness", kind: "Private input", body: "Host-supplied local secret. Stays off-chain unless a derived public value is disclosed.", bullets: ["localSecretKey() pattern in lab escrow.", "Foundation of MPS-0029-safe auth."] },
    { token: "disclose", title: "disclose()", kind: "Publicize", body: "Publishes a value into the public transcript of a transition. Teaching examples disclose ledger writes explicitly.", bullets: ["Disclose commits, not openings.", "Confirm syntax in current Compact docs."] },
    { token: "ownPublicKey", title: "ownPublicKey()", kind: "MPS-0029", body: "Prover-supplied identifier — not proof of ownership. Do not authorize privileged circuits with it alone.", bullets: ["Use witness-derived role commitments.", "See MPS-0029 / example-bboard."] },
    { token: "Map", title: "Map<K,V>", kind: "Collection", body: "Public key→value ledger collection. Store commitments when values would otherwise leak.", bullets: ["Keys are visible.", "Check insert/lookup APIs in docs."] },
    { token: "Counter", title: "Counter", kind: "Ledger type", body: "Monotonic public counter for sequences and tallies.", bullets: ["increment(n)", "Often paired with disclose"] },
    { token: "assert", title: "assert", kind: "Constraint", body: "Circuit constraint — failure means no valid proof.", bullets: ["Use for auth and invariants.", "Messages are teaching aids."] },
  ];

  let activeLessonId = null;
  let baselineSource = "";
  let phase = "idle";
  let explained = false;
  let linted = false;
  let toastTimer = 0;
  let activeConstruct = null;

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove("is-show"), 2400);
  }

  function announce(msg) {
    const live = document.getElementById("live-region");
    if (live) live.textContent = msg;
  }

  function sleep(ms) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 80) : ms));
  }

  function logTo(id, line) {
    const el = document.getElementById(id);
    if (!el) return;
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    const idle = el.textContent.startsWith("Awaiting");
    const prev = idle ? "" : el.textContent + "\n";
    el.textContent = prev + `[${t}] ${line}`;
    el.scrollTop = el.scrollHeight;
  }

  function save() {
    try {
      const editor = document.getElementById("code-editor");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lessonId: activeLessonId,
          source: editor ? editor.value : "",
          baselineSource,
          explained,
          linted,
        })
      );
    } catch (_) { /* quota */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function setJourney(next) {
    phase = next;
    const order = ["idle", "loaded", "edited", "explained", "linted"];
    const idx = order.indexOf(next);
    document.querySelectorAll("#journey-steps .journey-step").forEach((li) => {
      const p = li.getAttribute("data-phase");
      const i = order.indexOf(p);
      li.classList.remove("is-active", "is-done");
      li.removeAttribute("aria-current");
      if (i < idx) li.classList.add("is-done");
      if (p === next) {
        li.classList.add("is-active");
        li.setAttribute("aria-current", "step");
      }
    });
    const labels = {
      idle: "Phase: idle — pick a Compact lesson to begin.",
      loaded: "Phase: loaded — skeleton in buffer (local).",
      edited: "Phase: edited — draft diverged from lesson baseline.",
      explained: "Phase: explained — construct annotated in the panel.",
      linted: "Phase: linted — theater checks complete (not a compiler).",
    };
    const live = document.getElementById("journey-live");
    if (live) live.textContent = labels[next] || labels.idle;
  }

  function recomputePhase() {
    const editor = document.getElementById("code-editor");
    const src = editor ? editor.value : "";
    if (!activeLessonId) {
      setJourney("idle");
      return;
    }
    if (linted) {
      setJourney("linted");
      return;
    }
    if (explained) {
      setJourney("explained");
      return;
    }
    if (src !== baselineSource) {
      setJourney("edited");
      return;
    }
    setJourney("loaded");
  }

  function countMatches(src, re) {
    const m = src.match(re);
    return m ? m.length : 0;
  }

  function updateRails() {
    const editor = document.getElementById("code-editor");
    const src = editor ? editor.value : "";
    const witnesses = countMatches(src, /\bwitness\b/g);
    const ledgers = countMatches(src, /\bexport\s+ledger\b/g);
    const circuits = countMatches(src, /\bexport\s+circuit\b/g);
    const discloses = countMatches(src, /\bdisclose\s*\(/g);
    const ownPk = countMatches(src, /\bownPublicKey\s*\(/g);

    const witnessScore = Math.min(100, witnesses * 34 + (src.includes("localSecretKey") ? 20 : 0));
    const ledgerScore = Math.min(100, ledgers * 28 + circuits * 18 + discloses * 12 + ownPk * 8);

    const wMeter = document.getElementById("rail-witness");
    const lMeter = document.getElementById("rail-ledger");
    const wFill = wMeter?.querySelector(".rail-fill");
    const lFill = lMeter?.querySelector(".rail-fill");
    const wLabel = document.getElementById("rail-witness-label");
    const lLabel = document.getElementById("rail-ledger-label");

    if (wFill) wFill.style.width = witnessScore + "%";
    if (lFill) lFill.style.width = ledgerScore + "%";
    if (wMeter) wMeter.setAttribute("aria-valuenow", String(witnessScore));
    if (lMeter) lMeter.setAttribute("aria-valuenow", String(ledgerScore));
    if (wLabel) {
      wLabel.textContent =
        witnessScore === 0
          ? "0% witness surface — no private witnesses detected"
          : `${witnessScore}% witness veil · ${witnesses} witness decl.`;
    }
    if (lLabel) {
      lLabel.textContent =
        ledgerScore === 0
          ? "0% ledger surface — no public exports detected"
          : `${ledgerScore}% ledger rail · ${ledgers} ledger · ${circuits} circuit · ${discloses} disclose`;
    }
  }

  function syncLineNumbers() {
    const editor = document.getElementById("code-editor");
    const nums = document.getElementById("line-numbers");
    if (!editor || !nums) return;
    const lines = Math.max(1, editor.value.split("\n").length);
    let out = "";
    for (let i = 1; i <= lines; i++) out += i + (i < lines ? "\n" : "");
    nums.textContent = out;
    nums.scrollTop = editor.scrollTop;
  }

  function updateCursorMeta() {
    const editor = document.getElementById("code-editor");
    const meta = document.getElementById("cursor-meta");
    if (!editor || !meta) return;
    const pos = editor.selectionStart || 0;
    const upto = editor.value.slice(0, pos);
    const lines = upto.split("\n");
    const ln = lines.length;
    const col = lines[lines.length - 1].length + 1;
    meta.textContent = `Ln ${ln} · Col ${col}`;
  }

  function renderExplain(item) {
    const body = document.getElementById("explain-body");
    const tags = document.getElementById("explain-tags");
    if (!body) return;
    if (!item) {
      body.innerHTML =
        '<p class="muted">Load a lesson, then click a construct chip or select a keyword in the buffer. The panel narrates what that Compact idea is teaching — without pretending to compile.</p>';
      if (tags) {
        tags.hidden = true;
        tags.innerHTML = "";
      }
      return;
    }
    activeConstruct = item.token || item.title;
    explained = true;
    const bullets = (item.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
    body.innerHTML = `
      <span class="explain-kind">${escapeHtml(item.kind || "Construct")}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.body)}</p>
      ${bullets ? `<ul>${bullets}</ul>` : ""}
      <p class="muted small" style="margin-top:0.85rem">Teaching narration only — verify against <a href="https://docs.midnight.network/compact" rel="noopener noreferrer">official Compact docs</a>.</p>
    `;
    if (tags) {
      tags.hidden = false;
      tags.innerHTML = `<span class="tag">${escapeHtml(item.token || item.title)}</span>`;
    }
    document.querySelectorAll(".construct-chips .chip").forEach((c) => {
      c.classList.toggle("is-active", c.getAttribute("data-token") === (item.token || ""));
    });
    recomputePhase();
    save();
    announce("Explained " + item.title);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function lessonById(id) {
    return LESSONS.find((l) => l.id === id) || null;
  }

  function renderConstructChips(lesson) {
    const wrap = document.getElementById("construct-chips");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (!lesson) return;
    lesson.highlights.forEach((h) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("data-token", h.token);
      btn.textContent = h.token;
      btn.title = h.title;
      btn.addEventListener("click", () => {
        renderExplain(h);
        focusTokenInEditor(h.token);
      });
      wrap.appendChild(btn);
    });
  }

  function focusTokenInEditor(token) {
    const editor = document.getElementById("code-editor");
    if (!editor || !token) return;
    const idx = editor.value.indexOf(token);
    if (idx < 0) return;
    editor.focus();
    editor.setSelectionRange(idx, idx + token.length);
    updateCursorMeta();
  }

  function loadLesson(id, sourceOverride) {
    const lesson = lessonById(id);
    if (!lesson) return;
    activeLessonId = id;
    baselineSource = lesson.source;
    const editor = document.getElementById("code-editor");
    if (editor) editor.value = sourceOverride != null ? sourceOverride : lesson.source;
    explained = false;
    linted = false;
    activeConstruct = null;
    renderExplain(null);
    renderConstructChips(lesson);
    document.querySelectorAll(".lesson-card").forEach((c) => {
      c.classList.toggle("is-active", c.getAttribute("data-id") === id);
      c.setAttribute("aria-selected", c.getAttribute("data-id") === id ? "true" : "false");
    });
    const meta = document.getElementById("buffer-meta");
    if (meta) meta.textContent = `${lesson.title} · ${lesson.tags.join(" · ")} · LOCAL STUB`;
    syncLineNumbers();
    updateRails();
    updateCursorMeta();
    recomputePhase();
    save();
    toast("Loaded " + lesson.title);
    announce("Loaded lesson " + lesson.title);
  }

  function renderLessons() {
    const grid = document.getElementById("lesson-grid");
    if (!grid) return;
    grid.innerHTML = "";
    LESSONS.forEach((lesson) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-card";
      btn.setAttribute("role", "option");
      btn.setAttribute("data-id", lesson.id);
      btn.setAttribute("aria-selected", "false");
      btn.innerHTML = `
        <div class="lc-top">
          <span class="lc-icon" aria-hidden="true">${escapeHtml(lesson.icon)}</span>
          <span class="badge badge-lab">lesson</span>
        </div>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p>${escapeHtml(lesson.blurb)}</p>
      `;
      btn.addEventListener("click", () => {
        loadLesson(lesson.id);
        document.getElementById("atelier")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      grid.appendChild(btn);
    });
  }

  function renderGlossary() {
    const grid = document.getElementById("glossary-grid");
    if (!grid) return;
    grid.innerHTML = "";
    GLOSSARY.forEach((g) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "glossary-card";
      btn.innerHTML = `<strong>${escapeHtml(g.token)}</strong><span>${escapeHtml(g.body.slice(0, 110))}…</span>`;
      btn.addEventListener("click", () => {
        renderExplain(g);
        document.getElementById("atelier")?.scrollIntoView({ behavior: "smooth", block: "start" });
        const lesson = lessonById(activeLessonId);
        if (lesson) {
          const hit = lesson.highlights.find(
            (h) =>
              h.token === g.token ||
              h.token.includes(g.token) ||
              g.token.includes(h.token.split(/\s+/)[0])
          );
          if (hit) focusTokenInEditor(hit.token);
          else focusTokenInEditor(g.token);
        }
      });
      grid.appendChild(btn);
    });
  }

  function explainSelection() {
    const editor = document.getElementById("code-editor");
    if (!editor) return;
    const sel = editor.value.slice(editor.selectionStart, editor.selectionEnd).trim();
    if (!sel || sel.length > 64) return;
    const lesson = lessonById(activeLessonId);
    const pool = [
      ...(lesson ? lesson.highlights : []),
      ...GLOSSARY,
    ];
    const hit =
      pool.find((h) => h.token === sel) ||
      pool.find((h) => h.token.includes(sel) || sel.includes(h.token)) ||
      pool.find((h) => h.title.toLowerCase().includes(sel.toLowerCase()));
    if (hit) renderExplain(hit);
  }

  function lintFindings(src) {
    /** @type {{sev:string,title:string,detail:string}[]} */
    const findings = [];
    if (!src.trim()) {
      findings.push({
        sev: "danger",
        title: "Empty buffer",
        detail: "Load a lesson or paste a Compact skeleton before linting.",
      });
      return findings;
    }
    if (!/pragma\s+language_version/.test(src)) {
      findings.push({
        sev: "danger",
        title: "Missing pragma language_version",
        detail: "Pin a Compact language revision. Lab skeletons use >= 0.23 — verify the official matrix.",
      });
    } else {
      findings.push({
        sev: "ok",
        title: "Pragma present",
        detail: "language_version pin detected (still verify against the official compatibility matrix).",
      });
    }
    if (!/import\s+CompactStandardLibrary\s*;/.test(src)) {
      findings.push({
        sev: "warn",
        title: "Missing CompactStandardLibrary import",
        detail: "Most teaching skeletons import the official standard library for Counter / Map / Bytes helpers.",
      });
    } else {
      findings.push({
        sev: "ok",
        title: "Standard library import",
        detail: "CompactStandardLibrary import found.",
      });
    }
    const ledgers = countMatches(src, /\bexport\s+ledger\b/g);
    const circuits = countMatches(src, /\bexport\s+circuit\b/g);
    const witnesses = countMatches(src, /\bwitness\b/g);
    if (ledgers === 0 && circuits === 0) {
      findings.push({
        sev: "warn",
        title: "No export ledger / circuit",
        detail: "A Compact contract usually exports ledger state and/or circuits.",
      });
    } else {
      findings.push({
        sev: "info",
        title: "Surface inventory",
        detail: `${ledgers} ledger · ${circuits} circuit · ${witnesses} witness (counts are theater-only).`,
      });
    }
    if (/\bownPublicKey\s*\(/.test(src) && !/MPS-0029|anti-pattern|do NOT|never authorize/i.test(src)) {
      findings.push({
        sev: "danger",
        title: "ownPublicKey() without MPS-0029 warning",
        detail: "ownPublicKey() is prover-supplied. Do not authorize privileged circuits with it alone — prefer witness-derived commitments.",
      });
    } else if (/\bownPublicKey\s*\(/.test(src)) {
      findings.push({
        sev: "warn",
        title: "ownPublicKey() mentioned",
        detail: "Comment context looks cautionary — still never ship ownPublicKey-only auth.",
      });
    } else if (witnesses > 0) {
      findings.push({
        sev: "ok",
        title: "Witness-oriented skeleton",
        detail: "Witness declarations present without a bare ownPublicKey auth pattern. Good teaching posture.",
      });
    }
    if (/\bdisclose\s*\(/.test(src)) {
      findings.push({
        sev: "info",
        title: "disclose() used",
        detail: "Publicize calls detected. Confirm current Compact disclose syntax in official docs before compiling.",
      });
    }
    if (/TODO|FIXME|invent/i.test(src)) {
      findings.push({
        sev: "warn",
        title: "TODO / invent marker",
        detail: "Buffer still carries draft markers — clean before treating as compile-ready.",
      });
    }
    findings.push({
      sev: "info",
      title: "Not a Compact compiler",
      detail: "This lint theater does not type-check, prove, or deploy. Install the official toolchain to compile.",
    });
    return findings;
  }

  function scoreFindings(findings) {
    let score = 100;
    findings.forEach((f) => {
      if (f.sev === "danger") score -= 28;
      else if (f.sev === "warn") score -= 12;
      else if (f.sev === "info") score -= 2;
    });
    return Math.max(0, Math.min(100, score));
  }

  async function runLint() {
    const editor = document.getElementById("code-editor");
    const src = editor ? editor.value : "";
    const status = document.getElementById("lint-status");
    const summary = document.getElementById("lint-summary");
    const findingsEl = document.getElementById("lint-findings");
    const scoreEl = document.getElementById("lint-score");
    const ring = document.getElementById("lint-ring-fill");

    if (status) {
      status.textContent = "Running lint theater…";
      status.className = "status warn";
    }
    logTo("lint-log", "Lint theater start (SIMULATED · not Compact compiler)");
    await sleep(380);
    const findings = lintFindings(src);
    await sleep(220);
    findings.forEach((f) => logTo("lint-log", `${f.sev.toUpperCase()} · ${f.title}`));

    const score = scoreFindings(findings);
    if (scoreEl) scoreEl.textContent = String(score);
    if (ring) {
      const circ = 2 * Math.PI * 52;
      const offset = circ * (1 - score / 100);
      ring.style.strokeDasharray = String(circ);
      ring.style.strokeDashoffset = String(offset);
      ring.style.stroke = score >= 80 ? "#6ee7b7" : score >= 55 ? "#fbbf24" : "#fb7185";
    }
    if (findingsEl) {
      findingsEl.innerHTML = findings
        .map(
          (f) => `
        <div class="finding">
          <span class="finding-sev ${escapeHtml(f.sev)}">${escapeHtml(f.sev)}</span>
          <div>
            <strong>${escapeHtml(f.title)}</strong>
            <p>${escapeHtml(f.detail)}</p>
          </div>
        </div>`
        )
        .join("");
    }
    const dangers = findings.filter((f) => f.sev === "danger").length;
    const warns = findings.filter((f) => f.sev === "warn").length;
    if (summary) {
      summary.textContent = `${findings.length} findings · ${dangers} danger · ${warns} warn · theater score ${score}`;
    }
    if (status) {
      status.textContent =
        dangers > 0 ? "Theater complete — fix danger findings before treating as compile-ready." : "Theater complete — still not a Compact compile.";
      status.className = "status " + (dangers > 0 ? "danger" : "ok");
    }
    linted = true;
    recomputePhase();
    save();
    toast("Lint theater score " + score);
    announce("Lint theater finished with score " + score);
    logTo("lint-log", `Done · score ${score} · NOT a compiler`);
  }

  function copyDonate() {
    const done = () => {
      toast("Donation address copied");
      announce("Donation address copied");
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(DONATE_ADDR).then(done).catch(() => fallbackCopy(done));
    } else fallbackCopy(done);
  }

  function fallbackCopy(done) {
    const ta = document.createElement("textarea");
    ta.value = DONATE_ADDR;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (_) {
      toast("Copy failed — select the address manually");
    }
    ta.remove();
  }

  function copyBuffer() {
    const editor = document.getElementById("code-editor");
    const text = editor ? editor.value : "";
    if (!text.trim()) {
      toast("Buffer empty");
      return;
    }
    const done = () => {
      toast("Buffer copied");
      announce("Compact buffer copied");
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        toast("Copy failed");
      });
    } else toast("Clipboard unavailable");
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "textarea" || tag === "input" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      h = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.7 + 0.2,
        v: Math.random() * 0.15 + 0.02,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 220, 255, ${s.a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          s.y += s.v;
          if (s.y > h) {
            s.y = 0;
            s.x = Math.random() * w;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      frame();
    });
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function bindUI() {
    const navToggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    navToggle?.addEventListener("click", () => {
      const open = nav?.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    const editor = document.getElementById("code-editor");
    editor?.addEventListener("input", () => {
      linted = false;
      syncLineNumbers();
      updateRails();
      updateCursorMeta();
      recomputePhase();
      save();
    });
    editor?.addEventListener("scroll", () => {
      const nums = document.getElementById("line-numbers");
      if (nums) nums.scrollTop = editor.scrollTop;
    });
    editor?.addEventListener("keyup", updateCursorMeta);
    editor?.addEventListener("click", updateCursorMeta);
    editor?.addEventListener("mouseup", () => {
      updateCursorMeta();
      explainSelection();
    });

    document.getElementById("btn-run-lint")?.addEventListener("click", () => {
      runLint().catch(console.error);
      document.getElementById("lint")?.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("btn-copy-buffer")?.addEventListener("click", copyBuffer);
    document.getElementById("btn-reset-lesson")?.addEventListener("click", () => {
      if (!activeLessonId) {
        toast("No lesson loaded");
        return;
      }
      loadLesson(activeLessonId);
      toast("Reset to lesson baseline");
    });
    document.getElementById("btn-copy-donate")?.addEventListener("click", copyDonate);
    document.getElementById("dock-copy-addr")?.addEventListener("click", copyDonate);

    const help = document.getElementById("help-overlay");
    const closeHelp = () => {
      if (help) help.hidden = true;
    };
    const openHelp = () => {
      if (help) help.hidden = false;
    };
    document.getElementById("btn-close-help")?.addEventListener("click", closeHelp);
    help?.addEventListener("click", (e) => {
      if (e.target === help) closeHelp();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeHelp();
        return;
      }
      if (isTypingTarget(e.target)) {
        if (e.key === "Escape") editor?.blur();
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        if (help?.hidden) openHelp();
        else closeHelp();
        return;
      }
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        copyDonate();
        return;
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        editor?.focus();
        document.getElementById("atelier")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth" });
        document.getElementById("lesson-grid")?.focus();
        return;
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        copyBuffer();
        return;
      }
      if (e.shiftKey && (e.key === "R" || e.key === "r")) {
        e.preventDefault();
        if (activeLessonId) loadLesson(activeLessonId);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        runLint().catch(console.error);
        document.getElementById("lint")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function boot() {
    renderLessons();
    renderGlossary();
    bindUI();
    initStarfield();
    initReveal();

    const saved = load();
    if (saved?.lessonId && lessonById(saved.lessonId)) {
      loadLesson(saved.lessonId, saved.source != null ? saved.source : undefined);
      if (saved.baselineSource) baselineSource = saved.baselineSource;
      explained = !!saved.explained;
      linted = !!saved.linted;
      recomputePhase();
      updateRails();
      syncLineNumbers();
    } else {
      loadLesson("hello-counter");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
