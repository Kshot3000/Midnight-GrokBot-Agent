/**
 * Private Ballot Studio — sealed polls & private votes educational stub.
 * Commitments + nullifiers + tally theater. Not Compact. Not on-chain. Not Pages-live.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "mn-private-ballot-v1";
  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";
  const DOMAIN = "private-ballot:v1";
  const CIRC = 2 * Math.PI * 48; // vote ring circumference

  /** @type {{ id: string, question: string, options: string[], eligCommit: string, eligSalt: string, createdAt: string, certified: boolean, tally?: Record<string, number>, tallyPi?: string, disclosed?: boolean } | null} */
  let activeBallot = null;
  /** @type {Array<{id:string,question:string,options:string[],eligCommit:string,createdAt:string,certified:boolean,tally?:Record<string,number>,tallyPi?:string,disclosed?:boolean}>} */
  let ballots = [];
  /** @type {Array<{id:string,ballotId:string,choiceIdx:number,choiceLabel:string,commit:string,nullifier:string,salt:string,secret:string,at:string,rejected?:boolean,rejectReason?:string}>} */
  let votes = [];
  let rejectCount = 0;
  let lastTallyOk = null;
  let tallying = false;
  let toastTimer = 0;

  function short(h, n = 8) {
    if (!h) return "—";
    return h.length <= n * 2 ? h : h.slice(0, n) + "…" + h.slice(-n);
  }

  function randomHex(bytes = 16) {
    const a = new Uint8Array(bytes);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function sleep(ms) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 80) : ms));
  }

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

  function setStatus(id, msg, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = "status" + (kind ? " " + kind : "");
  }

  function logTo(id, line) {
    const el = document.getElementById(id);
    if (!el) return;
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    const prev = el.textContent === "Awaiting cast…" || el.textContent === "Awaiting tally…" ? "" : el.textContent + "\n";
    el.textContent = prev + `[${t}] ${line}`;
    el.scrollTop = el.scrollHeight;
  }

  function save() {
    try {
      const vault = {};
      for (const b of ballots) {
        // Prefer live active salt; else keep prior vault entry
        let salt = null;
        if (activeBallot && activeBallot.id === b.id && activeBallot.eligSalt) {
          salt = activeBallot.eligSalt;
        }
        vault[b.id] = { eligSalt: salt };
      }
      // merge prior vault salts if present
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (prev.vault) {
          for (const [id, v] of Object.entries(prev.vault)) {
            if (!vault[id]) vault[id] = v;
            else if (!vault[id].eligSalt && v.eligSalt) vault[id].eligSalt = v.eligSalt;
          }
        }
      } catch (_) {}
      if (activeBallot?.eligSalt) {
        vault[activeBallot.id] = { eligSalt: activeBallot.eligSalt };
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ballots,
          votes,
          rejectCount,
          activeId: activeBallot?.id || null,
          vault,
        })
      );
    } catch (_) { /* quota */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      ballots = Array.isArray(data.ballots) ? data.ballots : [];
      votes = Array.isArray(data.votes) ? data.votes : [];
      rejectCount = Number(data.rejectCount) || 0;
      if (data.activeId) {
        activeBallot = ballots.find((b) => b.id === data.activeId) || ballots[0] || null;
      } else {
        activeBallot = ballots[0] || null;
      }
      if (activeBallot && data.vault && data.vault[activeBallot.id]?.eligSalt) {
        activeBallot = { ...activeBallot, eligSalt: data.vault[activeBallot.id].eligSalt };
      }
    } catch (_) {
      ballots = [];
      votes = [];
    }
  }

  function setJourney(phase, liveMsg) {
    const steps = document.querySelectorAll(".journey-step");
    const order = ["idle", "sealed", "voting", "tallying", "certified"];
    const idx = order.indexOf(phase);
    steps.forEach((el) => {
      const p = el.getAttribute("data-phase");
      const i = order.indexOf(p);
      el.classList.remove("is-active", "is-done");
      el.removeAttribute("aria-current");
      if (i < idx) el.classList.add("is-done");
      if (i === idx) {
        el.classList.add("is-active");
        el.setAttribute("aria-current", "step");
      }
    });
    const live = document.getElementById("journey-live");
    if (live && liveMsg) live.textContent = liveMsg;
  }

  function syncRails(veil, pub) {
    const rv = document.getElementById("rail-veil");
    const rp = document.getElementById("rail-public");
    const lvl = document.getElementById("rail-veil-label");
    const lpl = document.getElementById("rail-public-label");
    const vf = rv?.querySelector(".rail-fill");
    const pf = rp?.querySelector(".rail-fill");
    if (vf) vf.style.width = veil + "%";
    if (pf) pf.style.width = pub + "%";
    if (rv) rv.setAttribute("aria-valuenow", String(veil));
    if (rp) rp.setAttribute("aria-valuenow", String(pub));
    if (lvl) lvl.textContent = `${veil}% veiled`;
    if (lpl) lpl.textContent = `${pub}% public surface`;
  }

  function parseOptions(raw) {
    return String(raw || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  function updateChoiceSelect() {
    const sel = document.getElementById("vote-choice");
    const btn = document.getElementById("btn-cast");
    if (!sel) return;
    sel.innerHTML = "";
    if (!activeBallot) {
      sel.disabled = true;
      sel.innerHTML = '<option value="">Seal a ballot first…</option>';
      if (btn) btn.disabled = true;
      return;
    }
    sel.disabled = false;
    if (btn) btn.disabled = false;
    activeBallot.options.forEach((opt, i) => {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = opt;
      sel.appendChild(o);
    });
  }

  function updatePreview() {
    const box = document.getElementById("ballot-preview");
    if (!box) return;
    if (!activeBallot) {
      box.innerHTML =
        "<strong>No ballot yet</strong> Seal a poll to publish the question, option labels, and eligibility commitment — never the salt itself.";
      return;
    }
    const b = activeBallot;
    const voteN = votes.filter((v) => v.ballotId === b.id && !v.rejected).length;
    box.innerHTML = `
      <strong>${escapeHtml(b.question)}</strong>
      <div class="muted small">Options: ${b.options.map(escapeHtml).join(" · ")}</div>
      <div class="mono" style="margin-top:0.5rem">eligCommit ${short(b.eligCommit, 10)}</div>
      <div class="muted small" style="margin-top:0.35rem">${voteN} sealed vote(s) · ${b.certified ? "CERTIFIED" : "open"} · LOCAL STUB</div>
    `;
    updateRing(voteN);
  }

  function updateRing(n) {
    const ring = document.getElementById("vote-ring");
    const count = document.getElementById("ring-count");
    if (count) count.textContent = String(n);
    if (!ring) return;
    const max = Math.max(8, n + 2);
    const pct = Math.min(1, n / max);
    ring.style.strokeDasharray = String(CIRC);
    ring.style.strokeDashoffset = String(CIRC * (1 - pct));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function sealBallot() {
    const qEl = document.getElementById("poll-question");
    const oEl = document.getElementById("poll-options");
    const eEl = document.getElementById("poll-elig");
    const question = (qEl?.value || "").trim();
    const options = parseOptions(oEl?.value);
    if (!question) {
      setStatus("compose-status", "Question required.", "fail");
      toast("Add a question");
      return;
    }
    if (options.length < 2) {
      setStatus("compose-status", "Need at least 2 options.", "fail");
      toast("Need 2+ options");
      return;
    }
    const eligSalt = (eEl?.value || "").trim() || (await randomHex(16));
    if (eEl && !eEl.value) eEl.value = eligSalt;
    const eligCommit = await sha256(`${DOMAIN}|elig|${eligSalt}`);
    const ballot = {
      id: await randomHex(8),
      question,
      options,
      eligCommit,
      eligSalt,
      createdAt: new Date().toISOString(),
      certified: false,
      disclosed: false,
    };
    // Keep eligSalt only in active working memory for theater — strip from board copy
    const boardCopy = { ...ballot };
    delete boardCopy.eligSalt;
    ballots.unshift(boardCopy);
    ballots = ballots.slice(0, 20);
    activeBallot = ballot;
    updateChoiceSelect();
    updatePreview();
    renderBoard();
    save();
    setJourney("sealed", "Phase: sealed — ballot opened · eligibility commit live.");
    syncRails(100, 30);
    setStatus("compose-status", "Ballot sealed & opened (sim). LOCAL STUB.", "ok");
    announce("Ballot sealed");
    toast("Ballot opened");
    logTo("vote-log", `open · ${short(ballot.id, 6)} · elig=${short(eligCommit)}`);
  }

  function resetEligStages() {
    document.querySelectorAll("#elig-stages li").forEach((li) => {
      li.classList.remove("is-active", "is-done", "is-fail");
      const meta = li.querySelector("[data-stage-meta]");
      if (meta) meta.textContent = "—";
    });
  }

  function setEligStage(stage, cls, meta) {
    const li = document.querySelector(`#elig-stages li[data-stage="${stage}"]`);
    if (!li) return;
    li.classList.remove("is-active", "is-done", "is-fail");
    if (cls) li.classList.add(cls);
    const m = li.querySelector("[data-stage-meta]");
    if (m && meta != null) m.textContent = meta;
  }

  async function castVote(opts) {
    const fast = opts && opts.fast;
    const pause = (ms) => sleep(fast ? Math.min(ms, 60) : ms);
    if (!activeBallot) {
      toast("Seal a ballot first");
      return;
    }
    const choiceEl = document.getElementById("vote-choice");
    const secretEl = document.getElementById("vote-secret");
    const saltEl = document.getElementById("vote-salt");
    const choiceIdx = Number(choiceEl?.value);
    const secret = (secretEl?.value || "").trim();
    if (!secret) {
      setStatus("vote-status", "Voter secret required.", "fail");
      toast("Voter secret required");
      return;
    }
    if (Number.isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= activeBallot.options.length) {
      setStatus("vote-status", "Pick a valid choice.", "fail");
      return;
    }
    resetEligStages();
    setEligStage("bind", "is-active", "…");
    await pause(350);
    const bind = await sha256(`${DOMAIN}|bind|${secret}`);
    setEligStage("bind", "is-done", short(bind, 5));
    logTo("vote-log", `bind · ${short(bind)}`);

    setEligStage("elig", "is-active", "…");
    await pause(400);
    // Teaching: any secret is "eligible" if we have eligSalt; real systems use membership proofs
    const eligOk = Boolean(activeBallot.eligSalt || activeBallot.eligCommit);
    if (!eligOk) {
      setEligStage("elig", "is-fail", "reject");
      setStatus("vote-status", "Eligibility gate failed (sim).", "fail");
      toast("Not eligible");
      return;
    }
    setEligStage("elig", "is-done", "ok");
    logTo("vote-log", "elig · membership ok (sim)");

    setEligStage("null", "is-active", "…");
    await pause(400);
    const eligMaterial = activeBallot.eligSalt || activeBallot.eligCommit;
    const nullifier = await sha256(`${DOMAIN}|null|${activeBallot.id}|${secret}|${eligMaterial}`);
    const dup = votes.some(
      (v) => v.ballotId === activeBallot.id && v.nullifier === nullifier && !v.rejected
    );
    if (dup) {
      setEligStage("null", "is-fail", "DUP");
      rejectCount += 1;
      const rejected = {
        id: await randomHex(6),
        ballotId: activeBallot.id,
        choiceIdx,
        choiceLabel: activeBallot.options[choiceIdx],
        commit: "",
        nullifier,
        salt: "",
        secret: "",
        at: new Date().toISOString(),
        rejected: true,
        rejectReason: "duplicate nullifier — double-vote",
      };
      votes.unshift(rejected);
      votes = votes.slice(0, 80);
      renderBoard();
      save();
      setStatus("vote-status", "REJECTED — duplicate nullifier (double-vote).", "fail");
      logTo("vote-log", `null FAIL · duplicate ${short(nullifier)}`);
      announce("Double-vote rejected");
      toast("Double-vote rejected");
      syncRails(95, 40);
      return;
    }
    setEligStage("null", "is-done", short(nullifier, 5));
    logTo("vote-log", `null · ${short(nullifier)}`);

    setEligStage("ballot", "is-active", "…");
    await pause(400);
    const salt = (saltEl?.value || "").trim() || (await randomHex(12));
    if (saltEl && !saltEl.value) saltEl.value = salt;
    const commit = await sha256(
      `${DOMAIN}|ballot|${activeBallot.id}|${choiceIdx}|${salt}|${secret}`
    );
    setEligStage("ballot", "is-done", short(commit, 5));

    const vote = {
      id: await randomHex(6),
      ballotId: activeBallot.id,
      choiceIdx,
      choiceLabel: activeBallot.options[choiceIdx],
      commit,
      nullifier,
      salt,
      secret,
      at: new Date().toISOString(),
    };
    // When saving board-facing list we keep openings in memory for local tally only
    votes.unshift(vote);
    votes = votes.slice(0, 80);
    // Invalidate prior certification if new vote arrives
    if (activeBallot.certified) {
      activeBallot.certified = false;
      activeBallot.tally = undefined;
      activeBallot.tallyPi = undefined;
      const bi = ballots.findIndex((b) => b.id === activeBallot.id);
      if (bi >= 0) {
        ballots[bi].certified = false;
        delete ballots[bi].tally;
        delete ballots[bi].tallyPi;
      }
    }
    renderBoard();
    updatePreview();
    save();
    setJourney("voting", "Phase: voting — sealed ballot + nullifier on the board.");
    syncRails(92, 42);
    setStatus("vote-status", "Sealed vote cast (sim). Choice veiled.", "ok");
    logTo("vote-log", `ballot · commit=${short(commit)} · choice veiled`);
    announce("Sealed vote cast");
    toast("Vote sealed");
    if (secretEl) secretEl.value = "";
  }

  async function proveEligOnly() {
    if (!activeBallot) {
      toast("Seal a ballot first");
      return;
    }
    const secret = (document.getElementById("vote-secret")?.value || "").trim();
    if (!secret) {
      toast("Enter voter secret");
      return;
    }
    resetEligStages();
    setEligStage("bind", "is-active", "…");
    await sleep(300);
    const bind = await sha256(`${DOMAIN}|bind|${secret}`);
    setEligStage("bind", "is-done", short(bind, 5));
    setEligStage("elig", "is-active", "…");
    await sleep(350);
    setEligStage("elig", "is-done", "ok");
    const eligMaterial = activeBallot.eligSalt || activeBallot.eligCommit;
    const nullifier = await sha256(`${DOMAIN}|null|${activeBallot.id}|${secret}|${eligMaterial}`);
    setEligStage("null", "is-done", short(nullifier, 5));
    setEligStage("ballot", "", "skipped");
    logTo("vote-log", `elig-only · nullifier preview ${short(nullifier)} (no ballot sealed)`);
    setStatus("vote-status", "Eligibility proven (sim) — identity veiled.", "ok");
    toast("Eligible (sim)");
    announce("Eligibility proven without revealing identity");
    syncRails(98, 28);
  }

  function resetTallyStages() {
    document.querySelectorAll("#tally-stages li").forEach((li) => {
      li.classList.remove("is-active", "is-done", "is-fail");
      const meta = li.querySelector("[data-stage-meta]");
      if (meta) meta.textContent = "—";
    });
  }

  function setTallyStage(stage, cls, meta) {
    const li = document.querySelector(`#tally-stages li[data-stage="${stage}"]`);
    if (!li) return;
    li.classList.remove("is-active", "is-done", "is-fail");
    if (cls) li.classList.add(cls);
    const m = li.querySelector("[data-stage-meta]");
    if (m && meta != null) m.textContent = meta;
  }

  function setMeter(pct, label) {
    const fill = document.getElementById("tally-meter-fill");
    const meter = document.getElementById("tally-meter");
    const lab = document.getElementById("tally-meter-label");
    if (fill) fill.style.width = pct + "%";
    if (meter) meter.setAttribute("aria-valuenow", String(pct));
    if (lab) lab.textContent = label;
  }

  function setTallyCard(title, hash, note, cls) {
    const card = document.getElementById("tally-result-card");
    const t = document.getElementById("tally-result-title");
    const h = document.getElementById("tally-result-hash");
    const n = document.getElementById("tally-result-note");
    if (t) t.textContent = title;
    if (h) h.textContent = hash;
    if (n) n.textContent = note;
    if (card) {
      card.classList.remove("is-ok", "is-fail");
      if (cls) card.classList.add(cls);
    }
  }

  function activeVotes() {
    if (!activeBallot) return [];
    return votes.filter((v) => v.ballotId === activeBallot.id && !v.rejected);
  }

  function renderTallyBars(tally, options) {
    const host = document.getElementById("tally-bars");
    if (!host) return;
    if (!tally || !options?.length) {
      host.innerHTML = '<p class="empty">Seal votes, then run tally to see aggregate bars.</p>';
      return;
    }
    const total = options.reduce((s, o) => s + (tally[o] || 0), 0) || 1;
    const max = Math.max(...options.map((o) => tally[o] || 0), 1);
    host.innerHTML = options
      .map((o) => {
        const n = tally[o] || 0;
        const pct = Math.round((n / total) * 100);
        const w = Math.round((n / max) * 100);
        const win = n === max && n > 0 ? " is-winner" : "";
        return `<div class="tally-row">
          <div class="tally-row-head"><strong>${escapeHtml(o)}</strong><span>${n} · ${pct}%</span></div>
          <div class="tally-bar"><div class="tally-bar-fill${win}" style="width:${w}%"></div></div>
        </div>`;
      })
      .join("");
  }

  async function runTally() {
    if (tallying) return;
    if (!activeBallot) {
      toast("Seal a ballot first");
      return;
    }
    const av = activeVotes();
    if (!av.length) {
      toast("Cast at least one vote");
      setStatus("vote-status", "Need sealed votes before tally.", "warn");
      return;
    }
    tallying = true;
    try {
      resetTallyStages();
      setJourney("tallying", "Phase: tallying — aggregating without publishing openings…");
      setTallyStage("collect", "is-active", "…");
      setMeter(15, "15% — collecting commits");
      await sleep(450);
      setTallyStage("collect", "is-done", String(av.length));
      logTo("tally-log", `collect · ${av.length} ballot commit(s)`);

      setTallyStage("check-null", "is-active", "…");
      setMeter(40, "40% — checking nullifiers");
      await sleep(450);
      const seen = new Set();
      let dup = false;
      for (const v of av) {
        if (seen.has(v.nullifier)) {
          dup = true;
          break;
        }
        seen.add(v.nullifier);
      }
      if (dup) {
        setTallyStage("check-null", "is-fail", "DUP");
        setMeter(40, "40% — nullifier collision");
        setTallyCard("Tally rejected", "—", "Duplicate nullifier in set", "is-fail");
        lastTallyOk = false;
        logTo("tally-log", "null FAIL · duplicate in set");
        toast("Nullifier collision");
        announce("Tally rejected — duplicate nullifier");
        return;
      }
      setTallyStage("check-null", "is-done", "unique");
      logTo("tally-log", `null · ${seen.size} unique`);

      setTallyStage("aggregate", "is-active", "…");
      setMeter(70, "70% — aggregating counts");
      await sleep(500);
      /** Local openings used only for teaching tally — would be ZK in real system */
      const tally = {};
      activeBallot.options.forEach((o) => {
        tally[o] = 0;
      });
      for (const v of av) {
        // Re-verify commit binds to choice (tamper detect)
        const expect = await sha256(
          `${DOMAIN}|ballot|${activeBallot.id}|${v.choiceIdx}|${v.salt}|${v.secret}`
        );
        if (expect !== v.commit) {
          setTallyStage("aggregate", "is-fail", "tamper");
          setMeter(70, "70% — commit mismatch");
          setTallyCard("Tally rejected", short(v.commit), "Ballot commit does not open", "is-fail");
          lastTallyOk = false;
          logTo("tally-log", `aggregate FAIL · commit mismatch ${short(v.commit)}`);
          toast("Commit mismatch");
          announce("Tally rejected — tampered ballot");
          return;
        }
        tally[v.choiceLabel] = (tally[v.choiceLabel] || 0) + 1;
      }
      setTallyStage("aggregate", "is-done", "ok");
      logTo(
        "tally-log",
        "aggregate · " +
          activeBallot.options.map((o) => `${o}=${tally[o]}`).join(", ")
      );

      setTallyStage("certify", "is-active", "…");
      setMeter(90, "90% — certifying π");
      await sleep(500);
      const pi = await sha256(
        `${DOMAIN}|tally|${activeBallot.id}|${JSON.stringify(tally)}|${av.map((v) => v.commit).join(",")}`
      );
      setTallyStage("certify", "is-done", short(pi, 6));
      setMeter(100, "100% — certified (sim)");

      activeBallot.certified = true;
      activeBallot.tally = tally;
      activeBallot.tallyPi = pi;
      const bi = ballots.findIndex((b) => b.id === activeBallot.id);
      if (bi >= 0) {
        ballots[bi].certified = true;
        ballots[bi].tally = tally;
        ballots[bi].tallyPi = pi;
      }
      lastTallyOk = true;
      renderTallyBars(tally, activeBallot.options);
      setTallyCard("Certified tally ✓ (simulated)", pi, "LOCAL STUB · SHA-256 stand-in · openings stayed local", "is-ok");
      setJourney("certified", "Phase: certified — aggregate counts + simulated π.");
      syncRails(activeBallot.disclosed ? 35 : 88, activeBallot.disclosed ? 85 : 55);
      save();
      renderBoard();
      updatePreview();
      logTo("tally-log", `certify · π=${short(pi)}`);
      announce("Tally certified");
      toast("Tally certified");
    } finally {
      tallying = false;
    }
  }

  function selectiveDisclose() {
    if (!activeBallot) {
      toast("Seal a ballot first");
      return;
    }
    const av = activeVotes();
    if (!av.length) {
      toast("No votes to disclose");
      return;
    }
    const ok = window.confirm(
      "Selective disclose will reveal individual choices on this local board (teaching warn). Continue?"
    );
    if (!ok) return;
    activeBallot.disclosed = true;
    const bi = ballots.findIndex((b) => b.id === activeBallot.id);
    if (bi >= 0) ballots[bi].disclosed = true;
    syncRails(30, 90);
    renderBoard();
    save();
    setStatus("vote-status", "WARN — choices disclosed on local board.", "warn");
    toast("Choices disclosed (local)");
    announce("Selective disclose — privacy reduced");
    logTo("tally-log", "disclose · individual choices now visible on board (warn)");
  }

  function tamperTally() {
    if (!activeBallot?.tally) {
      toast("Run tally first");
      return;
    }
    const opts = activeBallot.options;
    if (!opts.length) return;
    const victim = opts[0];
    activeBallot.tally[victim] = (activeBallot.tally[victim] || 0) + 99;
    // Break π bind
    activeBallot.tallyPi = "TAMPERED_" + (activeBallot.tallyPi || "").slice(0, 12);
    activeBallot.certified = false;
    const bi = ballots.findIndex((b) => b.id === activeBallot.id);
    if (bi >= 0) {
      ballots[bi].tally = { ...activeBallot.tally };
      ballots[bi].tallyPi = activeBallot.tallyPi;
      ballots[bi].certified = false;
    }
    renderTallyBars(activeBallot.tally, opts);
    setTallyCard("Tally tampered — re-run to reject", activeBallot.tallyPi, "Public counts no longer match π bind", "is-fail");
    setTallyStage("certify", "is-fail", "tamper");
    lastTallyOk = false;
    save();
    renderBoard();
    logTo("tally-log", `tamper · inflated "${victim}" + mutated π (demo fail)`);
    toast("Tally tampered");
    announce("Tally tampered for demo fail");
    syncRails(70, 70);
  }

  function renderBoard() {
    const bl = document.getElementById("ballot-list");
    const vl = document.getElementById("vote-list");
    const sb = document.getElementById("stat-ballots");
    const sv = document.getElementById("stat-votes");
    const sr = document.getElementById("stat-reject");
    const sc = document.getElementById("stat-cert");
    if (sb) sb.textContent = String(ballots.length);
    if (sv) sv.textContent = String(votes.filter((v) => !v.rejected).length);
    if (sr) sr.textContent = String(rejectCount + votes.filter((v) => v.rejected).length);
    if (sc) sc.textContent = String(ballots.filter((b) => b.certified).length);

    if (bl) {
      if (!ballots.length) {
        bl.innerHTML = '<li class="empty">No ballots yet — seal one above.</li>';
      } else {
        bl.innerHTML = ballots
          .map((b) => {
            const n = votes.filter((v) => v.ballotId === b.id && !v.rejected).length;
            const tags = [
              `<span class="pledge-tag sealed">sealed</span>`,
              b.certified ? `<span class="pledge-tag certified">certified</span>` : "",
              b.disclosed ? `<span class="pledge-tag full">disclosed</span>` : "",
            ]
              .filter(Boolean)
              .join("");
            const active = activeBallot && activeBallot.id === b.id ? " · active" : "";
            return `<li class="pledge-item">
              <div class="pledge-meta">${tags}<span>${n} votes${active}</span></div>
              <p class="pledge-body"><strong>${escapeHtml(b.question)}</strong></p>
              <div class="pledge-commit">elig ${short(b.eligCommit, 10)}</div>
              <div class="pledge-actions btn-row">
                <button type="button" class="btn ghost small" data-activate="${b.id}">Make active</button>
              </div>
            </li>`;
          })
          .join("");
        bl.querySelectorAll("[data-activate]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-activate");
            const found = ballots.find((b) => b.id === id);
            if (!found) return;
            // Restore working eligSalt if this was the active sealed one
            let salt = activeBallot?.id === found.id ? activeBallot.eligSalt : null;
            try {
              const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
              if (!salt && prev.vault && prev.vault[found.id]?.eligSalt) {
                salt = prev.vault[found.id].eligSalt;
              }
            } catch (_) {}
            activeBallot = {
              ...found,
              eligSalt: salt || found.eligCommit,
            };
            updateChoiceSelect();
            updatePreview();
            if (found.tally) renderTallyBars(found.tally, found.options);
            else renderTallyBars(null, null);
            setJourney(
              found.certified ? "certified" : nVotes(found.id) ? "voting" : "sealed",
              found.certified
                ? "Phase: certified — viewing prior tally."
                : "Phase: sealed — ballot activated."
            );
            toast("Ballot activated");
            announce("Ballot activated");
          });
        });
      }
    }

    if (vl) {
      const show = votes.slice(0, 24);
      if (!show.length) {
        vl.innerHTML = '<li class="empty">No sealed votes yet.</li>';
      } else {
        vl.innerHTML = show
          .map((v) => {
            const b = ballots.find((x) => x.id === v.ballotId);
            const disclosed = b?.disclosed;
            const tags = v.rejected
              ? `<span class="pledge-tag rejected">rejected</span>`
              : `<span class="pledge-tag sealed">sealed</span><span class="pledge-tag nullifier">nullifier</span>`;
            const body = v.rejected
              ? escapeHtml(v.rejectReason || "rejected")
              : disclosed
                ? `Choice: <strong>${escapeHtml(v.choiceLabel)}</strong>`
                : "Choice veiled · commit only";
            return `<li class="pledge-item${v.rejected ? " is-rejected" : disclosed ? " is-disclosed" : ""}">
              <div class="pledge-meta">${tags}<span>${escapeHtml(b?.question?.slice(0, 40) || "ballot")}</span></div>
              <p class="pledge-body">${body}</p>
              <div class="pledge-commit">${v.commit ? "commit " + short(v.commit, 10) : ""} · null ${short(v.nullifier, 8)}</div>
            </li>`;
          })
          .join("");
      }
    }
  }

  function nVotes(ballotId) {
    return votes.filter((v) => v.ballotId === ballotId && !v.rejected).length;
  }

  async function seedDemo() {
    const q = document.getElementById("poll-question");
    const o = document.getElementById("poll-options");
    const e = document.getElementById("poll-elig");
    if (q) q.value = "Ship Private Ballot as the next Midnight flagship studio?";
    if (o) o.value = "Yes — ship it\nHold for Compact atelier\nAbstain";
    if (e) e.value = "";
    const qc = document.getElementById("q-count");
    if (qc && q) qc.textContent = String(q.value.length);
    await sealBallot();
    const secrets = ["aurora-voter", "nebula-voter", "velvet-voter"];
    const choices = [0, 0, 1];
    for (let i = 0; i < secrets.length; i++) {
      const se = document.getElementById("vote-secret");
      const ce = document.getElementById("vote-choice");
      const sa = document.getElementById("vote-salt");
      if (se) se.value = secrets[i];
      if (ce) ce.value = String(choices[i]);
      if (sa) sa.value = "";
      await castVote({ fast: true });
      await sleep(40);
    }
    toast("Demo poll + 3 votes seeded");
  }

  async function seedBoard() {
    await seedDemo();
    await runTally();
  }

  function resetStudio() {
    if (!window.confirm("Reset Private Ballot Studio? Clears localStorage for this app.")) return;
    ballots = [];
    votes = [];
    rejectCount = 0;
    activeBallot = null;
    lastTallyOk = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    updateChoiceSelect();
    updatePreview();
    renderTallyBars(null, null);
    renderBoard();
    resetEligStages();
    resetTallyStages();
    setMeter(0, "0% — idle");
    setTallyCard("No tally yet", "—", "LOCAL STUB · simulated certification only.", "");
    setJourney("idle", "Phase: idle — compose a ballot to begin.");
    syncRails(100, 0);
    const vl = document.getElementById("vote-log");
    const tl = document.getElementById("tally-log");
    if (vl) vl.textContent = "Awaiting cast…";
    if (tl) tl.textContent = "Awaiting tally…";
    setStatus("compose-status", "", "");
    setStatus("vote-status", "", "");
    toast("Studio reset");
    announce("Studio reset");
  }

  async function copyAddr(btnId, statusId) {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      setStatus(statusId, "Copied Cardano donation address.", "ok");
      toast("Donate address copied");
      announce("Donation address copied");
      const btn = document.getElementById(btnId);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1600);
      }
    } catch (_) {
      setStatus(statusId, "Copy failed — select the address manually.", "warn");
      toast("Copy failed");
    }
  }

  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];

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
      if (!reduced) requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", () => {
      resize();
      if (reduced) frame(0);
    });
    requestAnimationFrame(frame);
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
      if (overlay) overlay.hidden = true;
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
    updateChoiceSelect();
    updatePreview();
    if (activeBallot?.tally) renderTallyBars(activeBallot.tally, activeBallot.options);
    renderBoard();
    if (activeBallot?.certified) {
      setJourney("certified", "Phase: certified — restored from localStorage.");
      syncRails(activeBallot.disclosed ? 35 : 88, activeBallot.disclosed ? 85 : 55);
    } else if (activeBallot && nVotes(activeBallot.id)) {
      setJourney("voting", "Phase: voting — restored from localStorage.");
      syncRails(92, 42);
    } else if (activeBallot) {
      setJourney("sealed", "Phase: sealed — restored from localStorage.");
      syncRails(100, 30);
    } else {
      syncRails(100, 0);
    }

    initStarfield();
    initReveal();
    initNav();

    const q = document.getElementById("poll-question");
    const qc = document.getElementById("q-count");
    q?.addEventListener("input", () => {
      if (qc) qc.textContent = String(q.value.length);
    });
    if (q && qc) qc.textContent = String(q.value.length);

    document.getElementById("btn-seal")?.addEventListener("click", () => {
      sealBallot().catch(console.error);
    });
    document.getElementById("btn-seed")?.addEventListener("click", () => {
      seedDemo().catch(console.error);
    });
    document.getElementById("btn-cast")?.addEventListener("click", () => {
      castVote().catch(console.error);
    });
    document.getElementById("btn-elig")?.addEventListener("click", () => {
      proveEligOnly().catch(console.error);
    });
    document.getElementById("btn-tally")?.addEventListener("click", () => {
      runTally().catch(console.error);
    });
    document.getElementById("btn-disclose")?.addEventListener("click", selectiveDisclose);
    document.getElementById("btn-tamper")?.addEventListener("click", tamperTally);
    document.getElementById("btn-seed-board")?.addEventListener("click", () => {
      seedBoard().catch(console.error);
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
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;
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
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        document.getElementById("poll-question")?.focus();
        document.getElementById("compose")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        document.getElementById("vote-secret")?.focus();
        document.getElementById("vote")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        runTally().catch(console.error);
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
