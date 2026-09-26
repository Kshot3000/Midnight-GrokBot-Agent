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
        { id: "m1", description: "scaffold", amount: 1 * L, status: "pending", proofHash: null },
        { id: "m2", description: "app", amount: 4 * L, status: "pending", proofHash: null },
      ],
      audit: [],
    };
  }

  let s = fresh();
  let toastTimer = null;

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

  function can(act) {
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
      btn.disabled = !enabled;
      btn.classList.toggle("cta-pulse", enabled && act === next && act !== "reset");
      btn.setAttribute("aria-disabled", enabled ? "false" : "true");
      if (!enabled) {
        btn.title = WHY_DISABLED[act] || "Not available in current state";
      } else {
        btn.title = btn.getAttribute("data-label") || act;
      }
    });
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
    proof1() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m1");
      if (m.status !== "pending") throw new Error("m1 not pending");
      m.status = "proof_submitted";
      m.proofHash = "0x9f2c41ab";
      push("proof_submitted", "agent", { milestone: "m1" });
    },
    approve1() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m1");
      if (m.status !== "proof_submitted") throw new Error("m1 needs proof");
      m.status = "released";
      s.released += m.amount;
      push("milestone_released", "approver", { milestone: "m1", amount: m.amount });
    },
    proof2() {
      if (s.state !== "in_progress") throw new Error("need in_progress");
      const m = find("m2");
      if (m.status !== "pending") throw new Error("m2 not pending");
      m.status = "proof_submitted";
      m.proofHash = "0x41b0de77";
      push("proof_submitted", "agent", { milestone: "m2" });
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
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-act");
      try {
        showErr("");
        actions[act]();
        render();
        showToast(SUCCESS_MSG[act] || "Done (local stub).", false);
      } catch (e) {
        const msg = e.message || String(e);
        showErr(msg);
        showToast(msg, true);
      }
    });
    btn.addEventListener("mouseenter", () => {
      if (!el.disabledHelp) return;
      const act = btn.getAttribute("data-act");
      if (btn.disabled) {
        el.disabledHelp.textContent = WHY_DISABLED[act] || "Not available.";
      } else {
        el.disabledHelp.textContent = "";
      }
    });
    btn.addEventListener("focus", () => {
      if (!el.disabledHelp) return;
      const act = btn.getAttribute("data-act");
      if (btn.disabled) {
        el.disabledHelp.textContent = WHY_DISABLED[act] || "Not available.";
      } else {
        el.disabledHelp.textContent = "";
      }
    });
  });

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
