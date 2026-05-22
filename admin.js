(function () {
  "use strict";

  const storageKey = "first100days-admin-draft";
  const adminPassword = "win07050";
  const statuses = ["Completed", "In Progress", "Planned", "Not Started"];
  const originalData = clone(window.First100DaysMetricsData || { summary: {}, commitments: [] });
  let data = clone(originalData);

  const loginForm = document.querySelector("[data-login-form]");
  const passwordInput = document.querySelector("[data-password]");
  const loginError = document.querySelector("[data-login-error]");
  const summaryForm = document.querySelector("[data-summary-form]");
  const addForm = document.querySelector("[data-add-form]");
  const commitmentsNode = document.querySelector("[data-commitments]");
  const previewNode = document.querySelector("#first-100-days-admin-preview");

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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

  function slug(value) {
    return String(value || "commitment")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `commitment-${Date.now()}`;
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function dataScriptText() {
    return `window.First100DaysMetricsData = ${JSON.stringify(data, null, 2)};\nwindow.dispatchEvent(new CustomEvent("first100days:data-ready", {\n  detail: window.First100DaysMetricsData\n}));\n`;
  }

  function saveDraft() {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function loadDraft() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      data = JSON.parse(raw);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  function unlock() {
    document.body.classList.remove("locked");
    loadDraft();
    renderAll();
  }

  function summaryFields() {
    const s = data.summary;
    summaryForm.innerHTML = `
      <label>Title <input name="title" value="${esc(s.title)}"></label>
      <label>Headline <textarea name="eyebrow">${esc(s.eyebrow)}</textarea></label>
      <label>Description <textarea name="description">${esc(s.description)}</textarea></label>
      <label>Start date <input name="startDate" type="date" value="${esc(s.startDate)}"></label>
      <label>Total days <input name="totalDays" type="number" min="1" value="${esc(s.totalDays)}"></label>
      <label>Days elapsed <input name="daysElapsed" type="number" min="0" value="${esc(s.daysElapsed)}"></label>
      <label>Overall progress % <input name="overallProgress" type="number" min="0" max="100" value="${esc(s.overallProgress)}"></label>
      <label>Completed key actions <input name="completedKeyActions" type="number" min="0" value="${esc(s.completedKeyActions)}"></label>
      <label>Total key actions <input name="totalKeyActions" type="number" min="0" value="${esc(s.totalKeyActions)}"></label>
      <label>Completed % <input name="statusCompleted" type="number" min="0" max="100" value="${esc(s.statusBreakdown?.[0]?.percent ?? 0)}"></label>
      <label>In progress % <input name="statusInProgress" type="number" min="0" max="100" value="${esc(s.statusBreakdown?.[1]?.percent ?? 0)}"></label>
      <label>Planned % <input name="statusPlanned" type="number" min="0" max="100" value="${esc(s.statusBreakdown?.[2]?.percent ?? 0)}"></label>
      <label>Not started % <input name="statusNotStarted" type="number" min="0" max="100" value="${esc(s.statusBreakdown?.[3]?.percent ?? 0)}"></label>
      <button type="submit">Apply summary</button>
    `;
  }

  function blankCommitment() {
    return {
      priority: data.commitments.length + 1,
      title: "",
      description: "",
      status: "Not Started",
      progress: 0,
      lastUpdateDate: "",
      lastUpdate: "",
      nextStep: "",
      documents: []
    };
  }

  function commitmentFields(item, prefix = "") {
    return `
      <div class="form-grid">
        <label>Priority <input name="${prefix}priority" type="number" min="1" value="${esc(item.priority)}"></label>
        <label>Status
          <select name="${prefix}status">
            ${statuses.map(status => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label class="full">Title <input name="${prefix}title" value="${esc(item.title)}" required></label>
        <label class="full">Description <textarea name="${prefix}description">${esc(item.description)}</textarea></label>
        <label>Progress % <input name="${prefix}progress" type="number" min="0" max="100" value="${esc(item.progress)}"></label>
        <label>Last update date <input name="${prefix}lastUpdateDate" type="date" value="${esc(item.lastUpdateDate)}"></label>
        <label class="full">Last update <textarea name="${prefix}lastUpdate">${esc(item.lastUpdate)}</textarea></label>
        <label class="full">Next step <textarea name="${prefix}nextStep">${esc(item.nextStep)}</textarea></label>
      </div>
    `;
  }

  function renderAddForm() {
    addForm.innerHTML = `
      ${commitmentFields(blankCommitment(), "new")}
      <button type="submit">Add commitment</button>
    `;
  }

  function renderDocuments(item) {
    return `
      <div class="documents">
        ${(item.documents || []).map((document, index) => `
          <div class="document-row">
            <a href="${esc(document.url)}" target="_blank" rel="noopener">${esc(document.title)}</a>
            <span>${esc(document.url)}</span>
            <button class="danger" type="button" data-delete-doc="${index}">Remove</button>
          </div>
        `).join("") || "<span>No documents attached.</span>"}
      </div>
      <div class="form-grid">
        <label>Document title <input name="docTitle" placeholder="Draft legislation"></label>
        <label>Document URL <input name="docUrl" placeholder="https://..."></label>
      </div>
      <button class="secondary" type="button" data-add-doc>Add document link</button>
    `;
  }

  function renderCommitments() {
    data.summary.commitmentsTracked = data.commitments.length;
    commitmentsNode.innerHTML = data.commitments
      .sort((a, b) => number(a.priority) - number(b.priority))
      .map(item => `
        <form class="commitment-card" data-id="${esc(item.id)}">
          <div class="commitment-head">
            <span class="commitment-title">${esc(item.priority)}. ${esc(item.title || "Untitled commitment")}</span>
            <div class="actions">
              <button type="submit">Apply</button>
              <button class="danger" type="button" data-delete>Delete</button>
            </div>
          </div>
          ${commitmentFields(item)}
          <h3>Documents</h3>
          ${renderDocuments(item)}
        </form>
      `).join("");
  }

  function readCommitment(form, existing = {}) {
    const values = formToObject(form);
    const title = values.title ?? values.newtitle ?? existing.title ?? "";
    return {
      id: existing.id || slug(title),
      priority: number(values.priority ?? values.newpriority, 1),
      title: String(title).trim(),
      description: String(values.description ?? values.newdescription ?? "").trim(),
      status: String(values.status ?? values.newstatus ?? "Not Started"),
      progress: Math.max(0, Math.min(100, number(values.progress ?? values.newprogress, 0))),
      lastUpdateDate: String(values.lastUpdateDate ?? values.newlastUpdateDate ?? "").trim(),
      lastUpdate: String(values.lastUpdate ?? values.newlastUpdate ?? "").trim(),
      nextStep: String(values.nextStep ?? values.newnextStep ?? "").trim(),
      documents: Array.isArray(existing.documents) ? existing.documents : []
    };
  }

  function renderPreview() {
    previewNode.innerHTML = "";
    const script = document.createElement("script");
    window.First100DaysMetricsData = clone(data);
    script.src = "./embed.js?admin-preview=" + Date.now();
    script.dataset.target = "#first-100-days-admin-preview";
    previewNode.appendChild(script);
  }

  function renderAll() {
    summaryFields();
    renderAddForm();
    renderCommitments();
    renderPreview();
  }

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    if (passwordInput.value === adminPassword) {
      unlock();
      return;
    }
    loginError.style.display = "block";
    passwordInput.select();
  });

  summaryForm.addEventListener("submit", event => {
    event.preventDefault();
    const values = formToObject(summaryForm);
    data.summary = {
      ...data.summary,
      title: values.title.trim(),
      eyebrow: values.eyebrow.trim(),
      description: values.description.trim(),
      startDate: values.startDate,
      totalDays: number(values.totalDays, 100),
      daysElapsed: number(values.daysElapsed, 0),
      overallProgress: number(values.overallProgress, 0),
      completedKeyActions: number(values.completedKeyActions, 0),
      totalKeyActions: number(values.totalKeyActions, 0),
      commitmentsTracked: data.commitments.length,
      statusBreakdown: [
        { status: "Completed", percent: number(values.statusCompleted, 0) },
        { status: "In Progress", percent: number(values.statusInProgress, 0) },
        { status: "Planned", percent: number(values.statusPlanned, 0) },
        { status: "Not Started", percent: number(values.statusNotStarted, 0) }
      ]
    };
    saveDraft();
    renderAll();
  });

  addForm.addEventListener("submit", event => {
    event.preventDefault();
    const item = readCommitment(addForm);
    if (!item.title) return;
    item.id = slug(item.title);
    while (data.commitments.some(existing => existing.id === item.id)) {
      item.id = `${item.id}-${Date.now().toString(36)}`;
    }
    data.commitments.push(item);
    saveDraft();
    renderAll();
  });

  commitmentsNode.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target.closest("form[data-id]");
    const index = data.commitments.findIndex(item => item.id === form.dataset.id);
    if (index === -1) return;
    data.commitments[index] = readCommitment(form, data.commitments[index]);
    saveDraft();
    renderAll();
  });

  commitmentsNode.addEventListener("click", event => {
    const form = event.target.closest("form[data-id]");
    if (!form) return;
    const item = data.commitments.find(commitment => commitment.id === form.dataset.id);
    if (!item) return;

    if (event.target.matches("[data-delete]")) {
      data.commitments = data.commitments.filter(commitment => commitment.id !== item.id);
      saveDraft();
      renderAll();
    }

    if (event.target.matches("[data-add-doc]")) {
      const title = form.querySelector("[name=docTitle]").value.trim();
      const url = form.querySelector("[name=docUrl]").value.trim();
      if (!url) return;
      item.documents = item.documents || [];
      item.documents.push({ title: title || url, url });
      saveDraft();
      renderAll();
    }

    if (event.target.matches("[data-delete-doc]")) {
      const index = number(event.target.dataset.deleteDoc, -1);
      item.documents.splice(index, 1);
      saveDraft();
      renderAll();
    }
  });

  document.querySelector("[data-save-local]").addEventListener("click", () => {
    saveDraft();
  });

  document.querySelector("[data-download-data]").addEventListener("click", () => {
    download("metrics-data.js", dataScriptText());
  });

  document.querySelector("[data-download-json]").addEventListener("click", () => {
    download("metrics.json", `${JSON.stringify(data, null, 2)}\n`);
  });

  document.querySelector("[data-reset]").addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    data = clone(originalData);
    renderAll();
  });
}());
