/**
 * Agent Escrow — local UI stub (no chain, no Compact runtime).
 * Mirrors the reference protocol transitions for teaching only.
 */
(function () {
  const L = 1_000_000;

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

  const el = {
    statePill: document.getElementById("statePill"),
    funded: document.getElementById("funded"),
    released: document.getElementById("released"),
    refunded: document.getElementById("refunded"),
    balance: document.getElementById("balance"),
    miles: document.getElementById("miles"),
    log: document.getElementById("log"),
    err: document.getElementById("err"),
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

  function render() {
    el.statePill.textContent = s.state;
    el.statePill.className = "pill" + (s.state === "settled" || s.state === "refunded" ? " ok" : s.state === "disputed" ? " warn" : "");
    el.funded.textContent = String(s.funded);
    el.released.textContent = String(s.released);
    el.refunded.textContent = String(s.refunded);
    el.balance.textContent = String(bal());
    el.miles.innerHTML = s.milestones
      .map(
        (m) =>
          `<tr><td><code>${m.id}</code></td><td>${m.description}</td><td>${m.amount}</td><td>${m.status}</td><td><code>${m.proofHash || "—"}</code></td></tr>`
      )
      .join("");
    el.log.textContent = s.audit.length
      ? s.audit.map((e) => `#${e.seq} ${e.type} by ${e.actor} → ${e.state} ${JSON.stringify(e.data)}`).join("\n")
      : "(empty)";
  }

  function find(id) {
    return s.milestones.find((m) => m.id === id);
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
      try {
        showErr("");
        actions[btn.getAttribute("data-act")]();
        render();
      } catch (e) {
        showErr(e.message || String(e));
      }
    });
  });

  render();
})();
