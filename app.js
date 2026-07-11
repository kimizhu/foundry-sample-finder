/* Foundry Hosted-Agent Sample Finder — vanilla JS, no build step.
 *
 * Data loading: prefers window.HA_SAMPLES / window.HA_TREE injected by the
 * generated data/*.js shims (so the page works when opened via file://).
 * Falls back to fetching data/*.json when served over http(s).
 */

const SHORT_FRAMEWORK = {
  "agent-framework": "Agent Framework",
  "langgraph": "LangGraph",
  "bring-your-own": "Bring Your Own",
};
const SHORT_PROTOCOL = {
  "responses": "Responses",
  "invocations": "Invocations",
  "invocations_ws": "Invocations WS",
  "a2a": "A2A",
  "activity": "Activity",
};
const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];
const PROTOCOL_ORDER = ["responses", "invocations", "invocations_ws", "a2a", "activity"];

/* ---------- tiny DOM helper ---------- */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

/* ---------- app state ---------- */
const state = {
  meta: null,
  samples: [],
  byId: new Map(),
  tree: null,
  view: "guide",
  history: [], // node ids, last is current
};

async function loadData() {
  let samplesDoc = window.HA_SAMPLES;
  let treeDoc = window.HA_TREE;
  if (!samplesDoc || !treeDoc) {
    // Served over http(s): fetch the canonical JSON.
    const [s, t] = await Promise.all([
      fetch("data/samples.json").then((r) => r.json()),
      fetch("data/tree.json").then((r) => r.json()),
    ]);
    samplesDoc = s;
    treeDoc = t;
  }
  state.meta = samplesDoc.meta;
  state.samples = samplesDoc.samples;
  state.byId = new Map(state.samples.map((s) => [s.id, s]));
  state.tree = treeDoc;
}

function repoUrl(sample) {
  return state.meta.repoBaseUrl + sample.path;
}

/* ---------- header + footer ---------- */
function renderHeader() {
  const agents = state.samples.filter((s) => s.kind !== "client").length;
  const fw = Object.keys(state.meta.frameworks).length;
  const proto = Object.keys(state.meta.protocols).length;
  const stats = document.getElementById("headerStats");
  stats.innerHTML = "";
  const items = [
    [agents, "samples"],
    [fw, "frameworks"],
    [proto, "protocols"],
  ];
  for (const [n, label] of items) {
    stats.appendChild(el("div", { class: "stat" }, [el("b", { text: String(n) }), el("span", { text: label })]));
  }
  document.getElementById("sourceRepo").textContent = state.meta.source;
  const rootLink = document.getElementById("rootLink");
  rootLink.href = state.meta.repoBaseUrl;
}

/* ---------- sample card ---------- */
function sampleCard(sample) {
  if (!sample) return null;
  const badges = el("div", { class: "badge-row" }, [
    el("span", { class: `badge framework fw-${sample.framework}`, text: SHORT_FRAMEWORK[sample.framework] || sample.framework }),
    el("span", { class: "badge protocol", text: SHORT_PROTOCOL[sample.protocol] || sample.protocol }),
    el("span", { class: "badge category", text: state.meta.categories[sample.category] || sample.category }),
  ]);
  const tags = el(
    "div",
    { class: "tags" },
    (sample.tags || []).map((t) => el("span", { class: "tag", text: t }))
  );
  const foot = el("div", { class: "card-foot" }, [
    el("span", { class: "path", title: sample.path, text: sample.path }),
    el("a", { class: "open-link", href: repoUrl(sample), target: "_blank", rel: "noopener", text: "Open on GitHub ↗" }),
  ]);
  return el("article", { class: "sample-card" }, [
    el("h3", { text: sample.title + (sample.kind === "client" ? " (client)" : "") }),
    badges,
    el("p", { class: "desc", text: sample.description || "" }),
    tags,
    foot,
  ]);
}

/* ---------- guide (decision tree) ---------- */
function currentNodeId() {
  return state.history[state.history.length - 1];
}

function go(nodeId) {
  state.history.push(nodeId);
  renderGuide();
}

function jumpTo(index) {
  state.history = state.history.slice(0, index + 1);
  renderGuide();
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    renderGuide();
  }
}

function restart() {
  state.history = [state.tree.meta.rootId];
  renderGuide();
}

function renderBreadcrumbs() {
  const bc = document.getElementById("breadcrumbs");
  bc.innerHTML = "";
  state.history.forEach((nid, i) => {
    const node = state.tree.nodes[nid];
    const label = node ? node.breadcrumb || node.title : nid;
    const isCurrent = i === state.history.length - 1;
    if (i > 0) bc.appendChild(el("span", { class: "sep", text: "›" }));
    bc.appendChild(
      el("span", {
        class: "crumb" + (isCurrent ? " current" : ""),
        text: label,
        onclick: isCurrent ? null : () => jumpTo(i),
      })
    );
  });
}

function renderGuide() {
  renderBreadcrumbs();
  const host = document.getElementById("guideNode");
  host.innerHTML = "";

  const node = state.tree.nodes[currentNodeId()];
  if (!node) {
    host.appendChild(el("div", { class: "empty", text: "That path isn't wired up yet." }));
    return;
  }

  if (node.type === "question") {
    const options = el(
      "div",
      { class: "options" },
      node.options.map((opt) =>
        el("button", { class: "option", onclick: () => go(opt.next) }, [
          el("span", { class: "opt-arrow", text: "→" }),
          el("span", { class: "opt-body" }, [
            el("b", { text: opt.label }),
            opt.description ? el("span", { text: opt.description }) : null,
          ]),
        ])
      )
    );
    host.appendChild(
      el("div", { class: "question-card" }, [
        el("div", { class: "step-label", text: node.breadcrumb || "Question" }),
        el("h2", { text: node.title }),
        node.help ? el("p", { class: "help", text: node.help }) : null,
        options,
      ])
    );
  } else if (node.type === "result") {
    const samples = (node.sampleIds || []).map((id) => state.byId.get(id)).filter(Boolean);
    host.appendChild(
      el("div", { class: "result-head" }, [
        el("div", { class: "step-label", text: samples.length === 1 ? "Recommended sample" : `Recommended samples (${samples.length})` }),
        el("h2", { text: node.breadcrumb || "Your match" }),
        node.intro ? el("p", { text: node.intro }) : null,
      ])
    );
    const grid = el("div", { class: "card-grid" }, samples.map(sampleCard));
    if (!samples.length) grid.appendChild(el("div", { class: "empty", text: "No samples mapped to this result." }));
    host.appendChild(grid);
  }

  document.getElementById("btnBack").disabled = state.history.length <= 1;
}

/* ---------- browse ---------- */
const browseState = { q: "", framework: "", protocol: "", category: "", level: "" };

function populateFilters() {
  const mk = (id, entries, allLabel) => {
    const sel = document.getElementById(id);
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "", text: allLabel }));
    for (const [value, label] of entries) sel.appendChild(el("option", { value, text: label }));
  };
  mk(
    "f-framework",
    Object.keys(state.meta.frameworks).map((k) => [k, SHORT_FRAMEWORK[k] || k]),
    "All frameworks"
  );
  mk(
    "f-protocol",
    PROTOCOL_ORDER.filter((k) => state.meta.protocols[k]).map((k) => [k, SHORT_PROTOCOL[k] || k]),
    "All protocols"
  );
  mk(
    "f-category",
    Object.entries(state.meta.categories),
    "All categories"
  );
  mk(
    "f-level",
    LEVEL_ORDER.map((k) => [k, k[0].toUpperCase() + k.slice(1)]),
    "All levels"
  );
}

function filterSamples() {
  const q = browseState.q.trim().toLowerCase();
  return state.samples.filter((s) => {
    if (browseState.framework && s.framework !== browseState.framework) return false;
    if (browseState.protocol && s.protocol !== browseState.protocol) return false;
    if (browseState.category && s.category !== browseState.category) return false;
    if (browseState.level && s.level !== browseState.level) return false;
    if (q) {
      const hay = [s.title, s.description, s.path, (s.tags || []).join(" ")].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderBrowse() {
  const grid = document.getElementById("browseGrid");
  const count = document.getElementById("browseCount");
  const results = filterSamples();
  grid.innerHTML = "";
  count.textContent = `${results.length} of ${state.samples.length} samples`;
  if (!results.length) {
    grid.appendChild(el("div", { class: "empty", text: "No samples match those filters." }));
    return;
  }
  for (const s of results) grid.appendChild(sampleCard(s));
}

function wireBrowse() {
  document.getElementById("search").addEventListener("input", (e) => {
    browseState.q = e.target.value;
    renderBrowse();
  });
  const bind = (id, key) =>
    document.getElementById(id).addEventListener("change", (e) => {
      browseState[key] = e.target.value;
      renderBrowse();
    });
  bind("f-framework", "framework");
  bind("f-protocol", "protocol");
  bind("f-category", "category");
  bind("f-level", "level");
  document.getElementById("btnClearFilters").addEventListener("click", () => {
    Object.assign(browseState, { q: "", framework: "", protocol: "", category: "", level: "" });
    document.getElementById("search").value = "";
    for (const id of ["f-framework", "f-protocol", "f-category", "f-level"]) document.getElementById(id).value = "";
    renderBrowse();
  });
}

/* ---------- tabs ---------- */
function setView(view) {
  state.view = view;
  document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.view === view)));
  document.getElementById("view-guide").hidden = view !== "guide";
  document.getElementById("view-browse").hidden = view !== "browse";
  if (view === "browse") renderBrowse();
}

function wireTabs() {
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));
}

/* ---------- boot ---------- */
async function main() {
  try {
    await loadData();
  } catch (err) {
    document.getElementById("guideNode").appendChild(
      el("div", { class: "empty", html: `Could not load data. If you opened this file directly and see this, run <code>python -m http.server</code> in this folder and reload.<br><br>${String(err)}` })
    );
    return;
  }
  renderHeader();
  populateFilters();
  wireBrowse();
  wireTabs();
  document.getElementById("btnBack").addEventListener("click", back);
  document.getElementById("btnRestart").addEventListener("click", restart);
  state.history = [state.tree.meta.rootId];
  renderGuide();
  setView("guide");
}

document.addEventListener("DOMContentLoaded", main);
