(function () {
  "use strict";

  const script = document.currentScript;
  const targetSelector = script?.dataset.target || "#first-100-days-metrics";
  const mount = document.querySelector(targetSelector) || document.createElement("div");
  const dataUrl = script?.dataset.json;
  const dataScriptUrl = script?.dataset.dataScript;

  if (!mount.parentNode && script?.parentNode) {
    script.parentNode.insertBefore(mount, script);
  }

  const statusClasses = {
    "Completed": "completed",
    "In Progress": "progress",
    "Planned": "planned",
    "Not Started": "notstarted"
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function percent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function renderDocuments(item) {
    const documents = item.documents || [];
    if (!documents.length) return "";
    return `
      <div class="jw-docs">
        <span>Documents</span>
        ${documents.map(document => `
          <a href="${esc(document.url)}" target="_blank" rel="noopener">${esc(document.title)}</a>
        `).join("")}
      </div>
    `;
  }

  function styles() {
    return `
      .jw-widget { background:#fff; border:1px solid #dce3ec; border-radius:8px; box-shadow:0 14px 35px rgba(6,27,58,.12); color:#071831; font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow:hidden; width:100%; }
      .jw-top { background:#061b3a; color:#fff; padding:24px; }
      .jw-top p { color:#f4ad3d; font-weight:800; margin:0 0 8px; }
      .jw-top h2 { color:#fff; font-family:Georgia, "Times New Roman", serif; font-size:34px; line-height:1.05; margin:0; }
      .jw-top span { color:rgba(255,255,255,.82); display:block; line-height:1.45; margin-top:12px; max-width:720px; }
      .jw-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border-bottom:1px solid #dce3ec; }
      .jw-stat { border-right:1px solid #dce3ec; min-height:132px; padding:20px; }
      .jw-stat:last-child { border-right:0; }
      .jw-stat-head { align-items:center; display:flex; gap:10px; }
      .jw-icon { align-items:center; background:#061b3a; border-radius:50%; color:white; display:inline-flex; flex:0 0 auto; font-size:10px; font-weight:900; height:34px; justify-content:center; width:34px; }
      .jw-label { color:#607086; display:block; font-size:12px; font-weight:850; text-transform:uppercase; }
      .jw-value { color:#071831; display:block; font-size:34px; font-weight:900; line-height:1; margin-top:18px; }
      .jw-note { color:#607086; display:block; font-size:12px; line-height:1.35; margin-top:8px; }
      .jw-stat-bar { background:#dce0e6; border-radius:999px; height:7px; margin-top:14px; overflow:hidden; width:100%; }
      .jw-stat-bar span { background:#f4ad3d; border-radius:inherit; display:block; height:100%; }
      .jw-stat-bar .jw-key-fill { background:#1957c2; }
      .jw-stat-visual { align-items:center; display:grid; gap:16px; grid-template-columns:1fr 70px; }
      .jw-donut { background:conic-gradient(#1957c2 var(--progress), #e3e8f0 0); border-radius:50%; height:70px; position:relative; width:70px; }
      .jw-donut::after { background:white; border-radius:50%; content:""; inset:16px; position:absolute; }
      .jw-table-wrap { overflow-x:auto; }
      .jw-table { border-collapse:collapse; min-width:760px; width:100%; }
      .jw-table th { background:#fbfcfe; border-bottom:1px solid #dce3ec; color:#061b3a; font-size:12px; padding:12px; text-align:left; text-transform:uppercase; }
      .jw-table td { border-bottom:1px solid #dce3ec; padding:12px; vertical-align:middle; }
      .jw-table tr:last-child td { border-bottom:0; }
      .jw-table strong { color:#071831; font-weight:850; }
      .jw-table small { color:#607086; display:block; line-height:1.35; margin-top:3px; }
      .jw-rank { align-items:center; background:#061b3a; border-radius:5px; color:white; display:inline-flex; font-weight:850; height:28px; justify-content:center; width:28px; }
      .jw-pill { border-radius:5px; display:inline-block; font-size:11px; font-weight:850; margin-bottom:8px; padding:4px 7px; text-transform:uppercase; white-space:nowrap; }
      .completed { background:#dff3e8; color:#108747; }
      .progress { background:#e6eefc; color:#1957c2; }
      .planned { background:#fff0dc; color:#d68615; }
      .notstarted { background:#eceff3; color:#5c6570; }
      .jw-bar { background:#dce0e6; border-radius:999px; height:7px; min-width:120px; overflow:hidden; }
      .jw-bar span { display:block; height:100%; }
      .jw-bar .completed { background:#108747; }
      .jw-bar .progress { background:#1957c2; }
      .jw-bar .planned { background:#d68615; }
      .jw-bar .notstarted { background:#7b8491; }
      .jw-docs { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
      .jw-docs span { color:#607086; font-size:11px; font-weight:850; text-transform:uppercase; width:100%; }
      .jw-docs a { background:#eef4ff; border:1px solid #cbdcf8; border-radius:5px; color:#1957c2; font-size:11px; font-weight:800; padding:4px 7px; text-decoration:none; }
      @media (max-width:720px) {
        .jw-stats { grid-template-columns:1fr 1fr; }
        .jw-stat:nth-child(2) { border-right:0; }
        .jw-stat:nth-child(1), .jw-stat:nth-child(2) { border-bottom:1px solid #dce3ec; }
        .jw-stat-visual { grid-template-columns:1fr; }
      }
      @media (max-width:520px) {
        .jw-stats { grid-template-columns:1fr; }
        .jw-stat { border-right:0; border-bottom:1px solid #dce3ec; }
        .jw-stat:last-child { border-bottom:0; }
        .jw-top h2 { font-size:28px; }
      }
    `;
  }

  function render(data) {
    const summary = data.summary || {};
    const commitments = Array.isArray(data.commitments) ? data.commitments : [];
    const tracked = summary.commitmentsTracked || commitments.length;
    const dayPercent = percent((Number(summary.daysElapsed) / Number(summary.totalDays)) * 100);
    const keyPercent = summary.totalKeyActions
      ? percent((Number(summary.completedKeyActions) / Number(summary.totalKeyActions)) * 100)
      : 0;

    const rows = commitments.map(item => {
      const statusClass = statusClasses[item.status] || "notstarted";
      return `
        <tr>
          <td><span class="jw-rank">${esc(item.priority)}</span></td>
          <td>
            <strong>${esc(item.title)}</strong>
            <small>${esc(item.description)}</small>
            ${renderDocuments(item)}
          </td>
          <td>
            <span class="jw-pill ${statusClass}">${esc(item.status)}</span>
            <div class="jw-bar"><span class="${statusClass}" style="width:${percent(item.progress)}%"></span></div>
          </td>
          <td><strong>${esc(item.progress)}%</strong></td>
          <td><small>${formatDate(item.lastUpdateDate)}<br>${esc(item.nextStep)}</small></td>
        </tr>
      `;
    }).join("");

    mount.innerHTML = `
      <style>${styles()}</style>
      <section class="jw-widget" aria-label="${esc(summary.title)} metrics">
        <div class="jw-top">
          <p>${esc(summary.title)}</p>
          <h2>${esc(summary.eyebrow)}</h2>
          <span>${esc(summary.description)}</span>
        </div>
        <div class="jw-stats">
          <div class="jw-stat">
            <div class="jw-stat-head"><span class="jw-icon">DAY</span><span class="jw-label">Days elapsed</span></div>
            <span class="jw-value">${esc(summary.daysElapsed)} / ${esc(summary.totalDays)}</span>
            <span class="jw-note">Started ${formatDate(summary.startDate)}</span>
            <div class="jw-stat-bar" aria-hidden="true"><span style="width:${dayPercent}%"></span></div>
          </div>
          <div class="jw-stat">
            <div class="jw-stat-head"><span class="jw-icon">PRG</span><span class="jw-label">Overall progress</span></div>
            <div class="jw-stat-visual">
              <div>
                <span class="jw-value">${esc(summary.overallProgress)}%</span>
                <span class="jw-note">${esc(summary.completedKeyActions)} of ${esc(summary.totalKeyActions)} key actions complete</span>
              </div>
              <span class="jw-donut" style="--progress:${percent(summary.overallProgress)}%" aria-hidden="true"></span>
            </div>
          </div>
          <div class="jw-stat">
            <div class="jw-stat-head"><span class="jw-icon">KEY</span><span class="jw-label">Key actions</span></div>
            <span class="jw-value">${esc(summary.completedKeyActions)} / ${esc(summary.totalKeyActions)}</span>
            <span class="jw-note">${keyPercent}% complete</span>
            <div class="jw-stat-bar" aria-hidden="true"><span class="jw-key-fill" style="width:${keyPercent}%"></span></div>
          </div>
          <div class="jw-stat">
            <div class="jw-stat-head"><span class="jw-icon">COM</span><span class="jw-label">Commitments</span></div>
            <span class="jw-value">${esc(tracked)}</span>
            <span class="jw-note">Priority commitments being tracked</span>
          </div>
        </div>
        <div class="jw-table-wrap">
          <table class="jw-table">
            <thead><tr><th>Priority</th><th>Commitment</th><th>Status</th><th>Progress</th><th>Next step</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  function showError(message) {
    mount.innerHTML = `<div style="border:1px solid #dce3ec;border-radius:8px;color:#071831;font-family:system-ui;padding:16px;">${esc(message)}</div>`;
  }

  function loadDataScript(src) {
    return new Promise((resolve, reject) => {
      const loader = document.createElement("script");
      loader.src = src;
      loader.async = true;
      loader.onload = () => resolve(window.First100DaysMetricsData);
      loader.onerror = () => reject(new Error("Could not load metrics-data.js."));
      document.head.appendChild(loader);
    });
  }

  async function init() {
    if (window.First100DaysMetricsData) {
      render(window.First100DaysMetricsData);
      return;
    }

    if (dataScriptUrl) {
      const data = await loadDataScript(dataScriptUrl);
      render(data);
      return;
    }

    if (dataUrl) {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load metrics.json.");
      render(await response.json());
      return;
    }

    showError("Metrics data was not found. Load metrics-data.js before embed.js, or add data-json/data-data-script.");
  }

  init().catch(error => showError(error.message || "Metrics unavailable."));
}());
