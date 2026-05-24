/**
 * Striver SDE Sheet page — render 184 problems with step visualizations
 */
(function () {
  "use strict";

  const sheet = window.STRIVER_SHEET;
  if (!sheet) return;

  const root = document.getElementById("striver-root");
  const nav = document.getElementById("striver-section-nav");
  const countEl = document.getElementById("striver-count");
  const visualCountEl = document.getElementById("striver-visual-links");
  const searchEl = document.getElementById("striver-search");
  const levelEl = document.getElementById("striver-level");
  const visibleEl = document.getElementById("striver-visible");

  if (countEl) countEl.textContent = String(sheet.problems.length);

  const linked = sheet.problems.filter(p => p.visualLink).length;
  if (visualCountEl) visualCountEl.textContent = String(linked);

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderNav() {
    if (!nav) return;
    nav.innerHTML = sheet.sections.map(sec => {
      const n = sheet.problems.filter(p => p.section === sec).length;
      return `<a href="#striver-sec-${slug(sec)}">${sec} <span class="sec-count">${n}</span></a>`;
    }).join("");
  }

  function renderProblem(p) {
    const stepsHtml = p.approach.map((s, i) =>
      `<li class="striver-step-item${i === 0 ? " active" : ""}" data-step="${i}"><strong>Step ${i + 1}.</strong> ${escapeHtml(s)}</li>`
    ).join("");

    const linkHtml = p.visualLink
      ? `<p class="striver-full-visual"><a href="dsa-visuals.html#${p.visualLink}" class="visual-link">Open full interactive demo → <code>${escapeHtml(p.visualLink)}</code></a></p>`
      : "";

    return `
      <details class="striver-card qa-card" data-id="${p.id}" data-level="${p.level}" data-title="${escapeHtml(p.title.toLowerCase())}">
        <summary class="striver-summary">
          <span class="striver-num">${String(p.num).padStart(3, "0")}</span>
          <span class="striver-title">${escapeHtml(p.title)}</span>
          <span class="level level-${p.level}">${p.level}</span>
          ${p.visualLink ? '<span class="striver-has-visual" title="Has full demo">🎬</span>' : ""}
        </summary>
        <div class="striver-body">
          <p class="simple-terms"><strong>In simple terms:</strong> ${escapeHtml(p.simple)}</p>
          <h4 class="striver-approach-heading">Answer approach</h4>
          <ol class="striver-approach-list">${stepsHtml}</ol>
          ${linkHtml}
          <section class="striver-step-visual visual-card diagram-card" aria-label="Step visualization for ${escapeHtml(p.title)}">
            <h4 class="striver-viz-heading">Step-by-step visualization</h4>
            <div class="visual-stage striver-stage"><canvas class="striver-canvas visual-canvas" aria-hidden="true"></canvas></div>
            <p class="visual-status" aria-live="polite"></p>
            <div class="visual-controls">
              <button type="button" class="btn" data-action="reset">Reset</button>
              <button type="button" class="btn btn-primary" data-action="next">Next step</button>
              <button type="button" class="btn" data-action="play" aria-pressed="false">Auto play</button>
            </div>
          </section>
        </div>
      </details>`;
  }

  function renderAll() {
    if (!root) return;
    root.innerHTML = sheet.sections.map(sec => {
      const probs = sheet.problems.filter(p => p.section === sec);
      return `
        <section class="topic-section striver-section" id="striver-sec-${slug(sec)}">
          <h2>${escapeHtml(sec)}</h2>
          <p class="section-desc">${probs.length} problems — expand any card for approach + step visualization</p>
          <div class="qa-list striver-list">${probs.map(renderProblem).join("")}</div>
        </section>`;
    }).join("");

    window.StriverVisuals?.observeCards(root);
    updateVisible();
  }

  function updateVisible() {
    if (!visibleEl) return;
    const q = (searchEl?.value || "").trim().toLowerCase();
    const lvl = levelEl?.value || "all";
    let n = 0;
    root.querySelectorAll(".striver-card").forEach(card => {
      const matchQ = !q || card.dataset.title.includes(q);
      const matchL = lvl === "all" || card.dataset.level === lvl;
      const show = matchQ && matchL;
      card.style.display = show ? "" : "none";
      if (show) n++;
    });
    visibleEl.textContent = String(n);
    root.querySelectorAll(".striver-section").forEach(sec => {
      const any = sec.querySelector('.striver-card:not([style*="none"])');
      sec.style.display = any ? "" : "none";
    });
  }

  renderNav();
  renderAll();

  searchEl?.addEventListener("input", updateVisible);
  levelEl?.addEventListener("change", updateVisible);

  document.getElementById("striver-expand")?.addEventListener("click", () => {
    root.querySelectorAll(".striver-card:not([style*='none'])").forEach(d => { d.open = true; });
  });
  document.getElementById("striver-collapse")?.addEventListener("click", () => {
    root.querySelectorAll(".striver-card").forEach(d => { d.open = false; });
  });
})();
