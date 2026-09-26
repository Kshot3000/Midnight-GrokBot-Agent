/**
 * Agent Escrow — local UI stub (no chain, no Compact runtime).
 * Mirrors the reference protocol transitions for teaching only.
 */
(function () {
  const L = 1_000_000;
  const MAIN_PATH = ["created", "funded", "in_progress", "settled"];

  const WHY_DISABLED = {
    fund: "Available only while state is created.",
    start: "Fund the escrow first (state must be funded).",
    proof1: "Needs in_progress and milestone m1 still pending.",
    approve1: "Needs m1 in proof_submitted (agent must submit proof first).",
    proof2: "Needs in_progress and milestone m2 still pending.",
    reject2: "Needs m2 in proof_submitted (demo path: reject after proof).",
    settle: "Needs every milestone released or rejected while in_progress.",
    dispute: "Available from funded or in_progress only.",
    resume: "Available only while disputed.",
    refund: "Available only while disputed.",
    reset: "Always available — clears local demo state.",
  };

  const SUCCESS_MSG = {
    fund: "Escrow funded with 5 ADA (local).",
    start: "Work started — milestones are live.",
    proof1: "Agent submitted proof for m1.",
    approve1: "Approver released m1.",
    proof2: "Agent submitted proof for m2.",
    reject2: "Approver rejected m2 (demo path).",
    settle: "Escrow settled — remaining balance refunded locally.",
    dispute: "Dispute opened.",
    resume: "Dispute resolved — resumed in_progress.",
    refund: "Dispute refunded remaining balance.",
    reset: "Local demo reset.",
  };

  function fresh() {
    return {
      state: "created",
      funded: 0,
      released: 0,
      refunded: 0,
      milestones: [
        { id: "m1", description: "scaffold", amount: 1 * L, status: "pending", proofHash: null, privateNote: null },
        { id: "m2", description: "app", amount: 4 * L, status: "pending", proofHash: null, privateNote: null },
      ],
      audit: [],
    };
  }

  let s = fresh();
  let toastTimer = null;
  /** @type {"client"|"agent"|"approver"} */
  let activeRole = "client";

  const ROLE_ACTS = {
    client: ["fund", "start", "settle", "dispute", "resume", "refund", "reset", "approve1", "reject2"],
    agent: ["proof1", "proof2", "reset"],
    approver: ["approve1", "reject2", "reset"],
  };

  const ROLE_HINTS = {
    client: "Acting as <strong>Client</strong> — fund / start / settle / dispute when state allows. Client is also an approver here.",
    agent: "Acting as <strong>Agent</strong> — submit proof hashes + private work notes. You cannot release your own milestones.",
    approver: "Acting as <strong>Approver</strong> — release or reject after a public proof exists. Private notes stay shielded.",
  };

  const PROOF_NOTES = {
    m1: "Private note: scaffolded Compact layout + witness stubs for role commitments (local only).",
    m2: "Private note: app milestone — UI wired to local state machine; CI still red in demo reject path.",
  };

  async function hashProof(milestoneId, note) {
    const payload = `agent-escrow:v1|${milestoneId}|${note}|${Date.now()}`;
    const dig = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return "0x" + [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }


  const el = {
    statePill: document.getElementById("statePill"),
    funded: document.getElementById("funded"),
    released: document.getElementById("released"),
    refunded: document.getElementById("refunded"),
    balance: document.getElementById("balance"),
    miles: document.getElementById("miles"),
    log: document.getElementById("log"),
    err: document.getElementById("err"),
    toast: document.getElementById("toast"),
    nextHint: document.getElementById("nextHint"),
    disabledHelp: document.getElementById("disabledHelp"),
    stepper: document.getElementById("escrowStepper"),
    milestoneTrack: document.getElementById("milestoneTrack"),
    publicProofs: document.getElementById("publicProofs"),
    privateProofs: document.getElementById("privateProofs"),
    publicProofsEmpty: document.getElementById("publicProofsEmpty"),
    privateProofsEmpty: document.getElementById("privateProofsEmpty"),
    roleHint: document.getElementById("roleHint"),
  };

  function bal() {
    return s.funded - s.released - s.refunded;
  }

  function push(type, actor, data) {
    s.audit.push({
      seq: s.audit.length + 1,
      type,
      actor,
      state: s.state,
      data: data || {},
    });
  }

  function showErr(msg) {
    if (!msg) {
      el.err.style.display = "none";
      el.err.textContent = "";
      return;
    }
    el.err.style.display = "block";
    el.err.textContent = msg;
  }

  function showToast(msg, isError) {
    if (!el.toast) return;
    el.toast.hidden = false;
    el.toast.textContent = msg;
    el.toast.classList.toggle("error-toast", !!isError);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2800);
  }

  function find(id) {
    return s.milestones.find((m) => m.id === id);
  }

  function stateAllows(act) {
    const m1 = find("m1");
    const m2 = find("m2");
    switch (act) {
      case "fund":
        return s.state === "created";
      case "start":
        return s.state === "funded";
      case "proof1":
        return s.state === "in_progress" && m1.status === "pending";
      case "approve1":
        return s.state === "in_progress" && m1.status === "proof_submitted";
      case "proof2":
        return s.state === "in_progress" && m2.status === "pending";
      case "reject2":
        return s.state === "in_progress" && m2.status === "proof_submitted";
      case "settle":
        return (
          s.state === "in_progress" &&
          s.milestones.every((m) => m.status === "released" || m.status === "rejected")
        );
      case "dispute":
        return s.state === "funded" || s.state === "in_progress";
      case "resume":
      case "refund":
        return s.state === "disputed";
      case "reset":
        return true;
      default:
        return false;
    }
  }

  function roleAllows(act) {
    return (ROLE_ACTS[activeRole] || []).includes(act);
  }

  function can(act) {
    return roleAllows(act) && stateAllows(act);
  }

  function nextAction() {
    const order = [
      "fund",
      "start",
      "proof1",
      "approve1",
      "proof2",
      "reject2",
      "settle",
      "resume",
      "refund",
    ];
    return order.find((a) => can(a)) || null;
  }

  function hintText() {
    const next = nextAction();
    if (s.state === "settled") return "Escrow settled. Reset to walk the flow again.";
    if (s.state === "refunded") return "Escrow refunded after dispute. Reset to walk again.";
    if (s.state === "disputed") return "Disputed — resume work or refund the remaining balance.";
    if (!next) return "No primary action right now — try Dispute or Reset.";
    const labels = {
      fund: "Next: <strong>Fund 5 ADA</strong> to leave created.",
      start: "Next: <strong>Start</strong> work once funded.",
      proof1: "Next: Agent submits <strong>proof m1</strong>.",
      approve1: "Next: Approver <strong>releases m1</strong>.",
      proof2: "Next: Agent submits <strong>proof m2</strong>.",
      reject2: "Next: Approver can <strong>reject m2</strong> (demo path) or you’d release in a real flow.",
      settle: "Next: <strong>Settle</strong> — all milestones decided.",
      resume: "Next: <strong>Resume</strong> after dispute.",
      refund: "Next: <strong>Dispute refund</strong> remaining balance.",
    };
    return labels[next] || "Continue with an enabled action.";
  }

  function updateButtons() {
    const next = nextAction();
    document.querySelectorAll("[data-act]").forEach((btn) => {
      const act = btn.getAttribute("data-act");
      const enabled = can(act);
      const roleOk = roleAllows(act);
      const stateOk = stateAllows(act);
      btn.disabled = !enabled;
      btn.classList.toggle("cta-pulse", enabled && act === next && act !== "reset");
      btn.classList.toggle("wrong-role", !roleOk && stateOk);
      btn.setAttribute("aria-disabled", enabled ? "false" : "true");
      if (!enabled) {
        if (!roleOk) {
          btn.title = "Switch role — this action belongs to another party.";
        } else {
          btn.title = WHY_DISABLED[act] || "Not available in current state";
        }
      } else {
        btn.title = btn.getAttribute("data-label") || act;
      }
    });
    if (el.roleHint) el.roleHint.innerHTML = ROLE_HINTS[activeRole] || "";
  }

  function renderStepper() {
    if (!el.stepper) return;
    const steps = el.stepper.querySelectorAll(".step");
    let idx = MAIN_PATH.indexOf(s.state);
    if (s.state === "disputed" || s.state === "refunded") {
      // Progress stays at last main state before branch; treat in_progress as current path end
      idx = s.state === "refunded" ? MAIN_PATH.indexOf("settled") : MAIN_PATH.indexOf("in_progress");
      if (s.funded === 0) idx = 0;
      else if (s.state === "disputed" && find("m1").status === "pending" && s.milestones.every((m) => m.status === "pending")) {
        // could be disputed from funded
        const wasStarted = s.audit.some((e) => e.type === "started");
        idx = wasStarted ? MAIN_PATH.indexOf("in_progress") : MAIN_PATH.indexOf("funded");
      }
    }
    if (idx < 0) idx = 0;

    const progressPct =
      s.state === "settled" || s.state === "refunded"
        ? 100
        : s.state === "disputed"
          ? Math.max(0, (idx / (MAIN_PATH.length - 1)) * 100)
          : (idx / (MAIN_PATH.length - 1)) * 100;
    el.stepper.style.setProperty("--progress", progressPct + "%");

    steps.forEach((step) => {
      const st = step.getAttribute("data-state");
      const si = MAIN_PATH.indexOf(st);
      step.classList.remove("done", "current");
      if (s.state === "settled" && st === "settled") {
        step.classList.add("current", "done");
      } else if (s.state === st && MAIN_PATH.includes(s.state)) {
        step.classList.add("current");
        if (si > 0) {
          // mark previous as done via loop below
        }
      }
      if (si < idx || (s.state === "settled" && si <= idx) || (s.state === "refunded" && si < MAIN_PATH.length - 1 && si <= idx)) {
        step.classList.add("done");
      }
      if (s.state === st && MAIN_PATH.includes(s.state)) {
        step.classList.add("current");
      }
    });

    document.querySelectorAll(".branch-chip").forEach((chip) => {
      const b = chip.getAttribute("data-branch");
      chip.classList.remove("active", "done");
      if (b === "disputed" && s.state === "disputed") chip.classList.add("active");
      if (b === "refunded" && s.state === "refunded") chip.classList.add("done", "active");
      if (b === "disputed" && s.state === "refunded") chip.classList.add("done");
    });
  }

  function milestoneWidth(status) {
    if (status === "pending") return "8%";
    if (status === "proof_submitted") return "55%";
    return "100%";
  }

  function renderMilestones() {
    if (!el.milestoneTrack) return;
    el.milestoneTrack.innerHTML = s.milestones
      .map((m) => {
        const cls = ["m-card", m.status];
        if (m.status === "proof_submitted" || m.status === "pending") cls.push("active");
        return (
          `<article class="${cls.join(" ")}">` +
          `<div class="m-card-top"><span class="m-id">${m.id}</span>` +
          `<span class="status-tag ${m.status}">${m.status}</span></div>` +
          `<p class="m-desc">${m.description} · ${m.amount} L</p>` +
          `<div class="m-bar" aria-hidden="true"><span style="--w:${milestoneWidth(m.status)}"></span></div>` +
          `</article>`
        );
      })
      .join("");
  }


  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderProofs() {
    if (!el.publicProofs || !el.privateProofs) return;
    const withProof = s.milestones.filter((m) => m.proofHash);
    el.publicProofs.innerHTML = "";
    el.privateProofs.innerHTML = "";
    if (el.publicProofsEmpty) el.publicProofsEmpty.hidden = withProof.length > 0;
    if (el.privateProofsEmpty) el.privateProofsEmpty.hidden = withProof.length > 0;

    withProof.forEach((m) => {
      const pub = document.createElement("li");
      pub.className = "proof-card";
      pub.innerHTML =
        `<div class="meta"><span class="tag sealed">${escapeHtml(m.id)}</span>` +
        `<span class="status-tag ${m.status}">${escapeHtml(m.status)}</span></div>` +
        `<div class="commitment mono">H = ${escapeHtml(m.proofHash)}</div>` +
        `<p class="body muted">Body sealed — commitment only (approver sees this).</p>`;
      el.publicProofs.appendChild(pub);

      const priv = document.createElement("li");
      priv.className = "proof-card";
      priv.innerHTML =
        `<div class="meta"><span class="tag sealed">vault · ${escapeHtml(m.id)}</span></div>` +
        `<p class="body">${escapeHtml(m.privateNote || "(no note)")}</p>` +
        `<div class="commitment mono">H = ${escapeHtml(m.proofHash)}</div>`;
      el.privateProofs.appendChild(priv);
    });
  }

  function render() {
    el.statePill.textContent = s.state;
    el.statePill.className =
      "pill" +
      (s.state === "settled" || s.state === "refunded"
        ? " ok"
        : s.state === "disputed"
          ? " warn"
          : s.state === "in_progress" || s.state === "funded"
            ? " live"
            : "");
    el.funded.textContent = String(s.funded);
    el.released.textContent = String(s.released);
    el.refunded.textContent = String(s.refunded);
    el.balance.textContent = String(bal());
    el.miles.innerHTML = s.milestones
      .map(
        (m) =>
          `<tr><td><code>${m.id}</code></td><td>${m.description}</td><td>${m.amount}</td>` +
          `<td><span class="status-tag ${m.status}">${m.status}</span></td>` +
          `<td><code>${m.proofHash || "—"}</code></td></tr>`
      )
      .join("");
    el.log.textContent = s.audit.length
      ? s.audit
          .map((e) => `#${e.seq} ${e.type} by ${e.actor} → ${e.state} ${JSON.stringify(e.data)}`)
          .join("\n")
      : "(empty)";
    if (el.nextHint) el.nextHint.innerHTML = hintText();
    renderStepper();
    renderMilestones();
    renderProofs();
    updateButtons();
  }

  const actions = {
    fund() {
      if (s.state !== "created") throw new Error("can only fund in created");
      s.funded = 5 * L;
      s.state = "funded";
      push("funded", "client", { amount: s.funded });
    },
    start() {
      if (s.state !== "funded") throw new Error("can only start in funded");
      const total = s.milestones.reduce((a, m) => a + m.amount, 0);
      if (total > s.funded) throw new Error("milestones exceed funded");
      s.state = "in_progress";
      push("started", "client", { milestoneTotal: total });
    },
    async proof1() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m1");
      if (m.status !== "pending") throw new Error("m1 not pending");
      const note = PROOF_NOTES.m1;
      m.privateNote = note;
      m.proofHash = await hashProof("m1", note);
      m.status = "proof_submitted";
      push("proof_submitted", "agent", { milestone: "m1", proofHash: m.proofHash });
    },
    approve1() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m1");
      if (m.status !== "proof_submitted") throw new Error("m1 needs proof");
      m.status = "released";
      s.released += m.amount;
      push("milestone_released", "approver", { milestone: "m1", amount: m.amount });
    },
    async proof2() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m2");
      if (m.status !== "pending") throw new Error("m2 not pending");
      const note = PROOF_NOTES.m2;
      m.privateNote = note;
      m.proofHash = await hashProof("m2", note);
      m.status = "proof_submitted";
      push("proof_submitted", "agent", { milestone: "m2", proofHash: m.proofHash });
    },
    reject2() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m2");
      if (m.status !== "proof_submitted") throw new Error("m2 needs proof");
      m.status = "rejected";
      push("milestone_rejected", "approver", { milestone: "m2", reason: "CI red" });
    },
    settle() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const open = s.milestones.some((m) => m.status !== "released" && m.status !== "rejected");
      if (open) throw new Error("all milestones must be decided");
      const rem = bal();
      s.refunded += rem;
      s.state = "settled";
      push("settled", "client", { refund: rem });
    },
    dispute() {
      if (s.state !== "funded" && s.state !== "in_progress") throw new Error("cannot dispute now");
      s.state = "disputed";
      push("disputed", "client", {});
    },
    resume() {
      if (s.state !== "disputed") throw new Error("not disputed");
      s.state = "in_progress";
      push("dispute_resolved_resume", "client", {});
    },
    refund() {
      if (s.state !== "disputed") throw new Error("not disputed");
      const rem = bal();
      s.refunded += rem;
      s.state = "refunded";
      push("dispute_resolved_refund", "client", { refund: rem });
    },
    reset() {
      s = fresh();
      push("reset", "ui", {});
    },
  };

  document.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const act = btn.getAttribute("data-act");
      try {
        if (!roleAllows(act)) {
          throw new Error("Wrong role — switch the role theater to use this action.");
        }
        showErr("");
        await Promise.resolve(actions[act]());
        render();
        showToast(SUCCESS_MSG[act] || "Done (local stub).", false);
      } catch (e) {
        const msg = e.message || String(e);
        showErr(msg);
        showToast(msg, true);
      }
    });
    const helpFor = (btn) => {
      if (!el.disabledHelp) return;
      const act = btn.getAttribute("data-act");
      if (!btn.disabled) {
        el.disabledHelp.textContent = "";
        return;
      }
      if (!roleAllows(act)) {
        el.disabledHelp.textContent = "Switch role — this action belongs to another party.";
      } else {
        el.disabledHelp.textContent = WHY_DISABLED[act] || "Not available.";
      }
    };
    btn.addEventListener("mouseenter", () => helpFor(btn));
    btn.addEventListener("focus", () => helpFor(btn));
  });

  // Role theater
  document.querySelectorAll(".role-card[data-role]").forEach((card) => {
    card.addEventListener("click", () => {
      activeRole = card.getAttribute("data-role") || "client";
      document.querySelectorAll(".role-card[data-role]").forEach((c) => {
        const on = c.getAttribute("data-role") === activeRole;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      updateButtons();
      showToast("Now acting as " + activeRole, false);
    });
  });

  // Donate copy
  const copyAddr = document.getElementById("copy-addr");
  const donationAddr = document.getElementById("donation-addr");
  if (copyAddr && donationAddr) {
    copyAddr.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(donationAddr.textContent.trim());
        const prev = copyAddr.textContent;
        copyAddr.textContent = "Copied";
        setTimeout(() => { copyAddr.textContent = prev; }, 1600);
      } catch {
        copyAddr.textContent = "Select & copy";
      }
    });
  }

  // Mobile nav
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (header && toggle && nav) {
    const closeNav = () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      toggle.textContent = "☰";
    };
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.textContent = open ? "✕" : "☰";
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  render();
})();
