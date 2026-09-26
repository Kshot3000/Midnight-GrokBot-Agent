(function () {
  const btn = document.getElementById("copy-addr");
  const addr = document.getElementById("donation-addr");
  if (btn && addr) {
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
  }

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
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }
})();
