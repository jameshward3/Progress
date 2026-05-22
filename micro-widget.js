(function () {
  "use strict";

  const script = document.currentScript;
  const targetSelector = script?.dataset.target || "#first-100-days-micro-widget";
  const mount = document.querySelector(targetSelector) || document.createElement("div");
  const dashboardUrl = script?.dataset.dashboardUrl || "./widget.html";

  if (!mount.parentNode && script?.parentNode) {
    script.parentNode.insertBefore(mount, script);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function percent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function calculated(data) {
    const commitments = Array.isArray(data.commitments) ? data.commitments : [];
    const totalProgress = commitments.reduce((sum, item) => sum + percent(item.progress), 0);
    const overallProgress = commitments.length ? Math.round(totalProgress / commitments.length) : 0;
    const totalKeyActions = Number(data.summary?.totalKeyActions) || 0;
    const completedKeyActions = totalKeyActions ? Math.round((overallProgress / 100) * totalKeyActions) : 0;
    const activeCommitments = commitments.filter(item => item.status !== "Completed").length;

    return {
      overallProgress,
      totalKeyActions,
      completedKeyActions,
      activeCommitments,
      commitmentsTracked: commitments.length
    };
  }

  function sparkline(points) {
    return points.map((point, index) => `${index * 14},${34 - point}`).join(" ");
  }

  function render(data) {
    const metrics = calculated(data || {});
    mount.innerHTML = `
      <style>
        .jw-micro {
          background:#fff;
          border:1px solid #e2e6ed;
          border-radius:8px;
          box-shadow:0 10px 26px rgba(6,27,58,.10);
          color:#071831;
          font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow:hidden;
          width:100%;
        }

        .jw-micro-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
        }

        .jw-micro-card {
          border-right:1px solid #e2e6ed;
          color:#071831;
          min-height:124px;
          padding:14px;
          text-decoration:none;
        }

        .jw-micro-card:last-child {
          border-right:0;
        }

        .jw-micro-label {
          color:#34445c;
          display:block;
          font-size:11px;
          font-weight:850;
          line-height:1.15;
          min-height:28px;
        }

        .jw-micro-value {
          display:block;
          font-size:30px;
          font-weight:900;
          letter-spacing:0;
          line-height:1;
          margin-top:10px;
        }

        .jw-micro-note {
          color:#607086;
          display:block;
          font-size:10px;
          font-weight:700;
          margin-top:5px;
        }

        .jw-micro-visual {
          display:block;
          height:38px;
          margin-top:8px;
          width:100%;
        }

        .jw-mini-donut {
          background:conic-gradient(#1957c2 var(--progress), #e3e8f0 0);
          border-radius:50%;
          display:block;
          height:38px;
          margin-left:auto;
          position:relative;
          width:38px;
        }

        .jw-mini-donut::after {
          background:#fff;
          border-radius:50%;
          content:"";
          inset:10px;
          position:absolute;
        }

        .jw-spark path,
        .jw-spark polyline {
          fill:none;
          stroke:#1957c2;
          stroke-linecap:round;
          stroke-linejoin:round;
          stroke-width:2;
        }

        .jw-spark .axis {
          stroke:#dce3ec;
          stroke-width:1;
        }

        .jw-micro-footer {
          align-items:center;
          border-top:1px solid #e2e6ed;
          color:#1957c2;
          display:flex;
          font-size:12px;
          font-weight:850;
          gap:8px;
          min-height:42px;
          padding:0 14px;
          text-decoration:none;
        }

        .jw-micro-card:hover,
        .jw-micro-footer:hover {
          background:#f8fbff;
        }

        @media (max-width:520px) {
          .jw-micro-grid {
            grid-template-columns:1fr;
          }

          .jw-micro-card {
            border-bottom:1px solid #e2e6ed;
            border-right:0;
          }
        }
      </style>

      <section class="jw-micro" aria-label="First 100 Days dashboard summary">
        <div class="jw-micro-grid">
          <a class="jw-micro-card" href="${esc(dashboardUrl)}" target="_top">
            <span class="jw-micro-label">First 100 Days<br>Progress</span>
            <span class="jw-micro-value">${metrics.overallProgress}%</span>
            <span class="jw-micro-note">of commitments</span>
            <span class="jw-micro-visual">
              <span class="jw-mini-donut" style="--progress:${metrics.overallProgress}%"></span>
            </span>
          </a>

          <a class="jw-micro-card" href="${esc(dashboardUrl)}" target="_top">
            <span class="jw-micro-label">Commitments<br>In Progress</span>
            <span class="jw-micro-value">${metrics.activeCommitments}</span>
            <span class="jw-micro-note">active priorities</span>
            <svg class="jw-micro-visual jw-spark" viewBox="0 0 88 38" aria-hidden="true">
              <path class="axis" d="M2 32H86"></path>
              <polyline points="${sparkline([3, 5, 8, 7, 12, 10, 18])}"></polyline>
            </svg>
          </a>

          <a class="jw-micro-card" href="${esc(dashboardUrl)}" target="_top">
            <span class="jw-micro-label">Key Actions<br>Completed</span>
            <span class="jw-micro-value">${metrics.completedKeyActions}</span>
            <span class="jw-micro-note">of ${metrics.totalKeyActions} total</span>
            <svg class="jw-micro-visual jw-spark" viewBox="0 0 88 38" aria-hidden="true">
              <path class="axis" d="M2 32H86"></path>
              <polyline points="${sparkline([4, 6, 9, 11, 14, 17, 22])}"></polyline>
            </svg>
          </a>
        </div>

        <a class="jw-micro-footer" href="${esc(dashboardUrl)}" target="_top">
          Explore all dashboards <span aria-hidden="true">→</span>
        </a>
      </section>
    `;
  }

  function showError() {
    mount.innerHTML = `<div style="border:1px solid #e2e6ed;border-radius:8px;color:#071831;font-family:system-ui;padding:14px;">Dashboard summary unavailable.</div>`;
  }

  if (window.First100DaysMetricsData) {
    render(window.First100DaysMetricsData);
  } else {
    window.addEventListener("first100days:data-ready", event => render(event.detail), { once: true });
    window.setTimeout(() => {
      if (!window.First100DaysMetricsData) showError();
    }, 3000);
  }
}());
