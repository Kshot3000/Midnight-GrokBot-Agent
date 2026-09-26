(function () {
  const btn = document.getElementById("copy-addr");
  const addr = document.getElementById("donation-addr");
  if (!btn || !addr) return;

  btn.addEventListener("click", async () => {
    const text = addr.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = "Copied";
      btn.style.borderColor = "var(--ok)";
      setTimeout(() => {
        btn.textContent = prev;
        btn.style.borderColor = "";
      }, 1600);
    } catch {
      btn.textContent = "Select & copy";
    }
  });
})();
