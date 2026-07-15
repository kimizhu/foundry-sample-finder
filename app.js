/* Foundry Hosted-Agent Sample Finder — vanilla JS, no build step.
 *
 * Guide view: a "Foundry base + building blocks" stack. The base is the minimal
 * getting-started agent; each block is a capability you stack on top. Every block
 * shows colored SDK dots (solid = an SDK already has a sample for it, hollow = not
 * yet), mapped in the legend. Opening a block lists its samples grouped by SDK.
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
  open: new Set(["base"]), // expanded block ids
};

async function loadData() {
  let samplesDoc = window.HA_SAMPLES;
  let treeDoc = window.HA_TREE;
  if (!samplesDoc || !treeDoc) {
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

/* ---------- SDK helpers ---------- */
function sdkMeta(key) {
  return (state.meta.sdks && state.meta.sdks[key]) || { label: key, short: key, color: "#888888" };
}
function sdkOrder() {
  return (state.tree.meta && state.tree.meta.sdkOrder) || Object.keys(state.meta.sdks || {});
}
function sdkDot(key, solid, title) {
  const c = sdkMeta(key).color;
  const style = solid ? `background:${c};border-color:${c}` : `background:transparent;border-color:${c}`;
  return el("span", {
    class: "dot" + (solid ? "" : " hollow"),
    style,
    title: title || sdkMeta(key).label,
    "aria-hidden": "true",
  });
}
function countLabel(n) {
  return `${n} ${n === 1 ? "sample" : "samples"}`;
}
function sdkCounts(node) {
  const m = new Map();
  for (const id of node.sampleIds || []) {
    const s = state.byId.get(id);
    if (!s || !s.sdk) continue;
    m.set(s.sdk, (m.get(s.sdk) || 0) + 1);
  }
  return m;
}

/* ---------- sample card ---------- */
function sampleCard(sample) {
  if (!sample) return null;
  const sdkBadge = sample.sdk
    ? el("span", { class: "badge sdk" }, [sdkDot(sample.sdk, true), " " + sdkMeta(sample.sdk).label])
    : el("span", { class: `badge framework fw-${sample.framework}`, text: SHORT_FRAMEWORK[sample.framework] || sample.framework });
  const badges = el("div", { class: "badge-row" }, [
    sdkBadge,
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

/* ---------- guide: Foundry base + stackable building blocks ---------- */
function toggleBlock(id) {
  if (state.open.has(id)) state.open.delete(id);
  else state.open.add(id);
  renderGuide();
}

function dotRow(node) {
  const counts = sdkCounts(node);
  const row = el("div", { class: "dot-row" });
  for (const key of sdkOrder()) {
    const n = counts.get(key) || 0;
    const label = sdkMeta(key).label;
    row.appendChild(sdkDot(key, n > 0, n > 0 ? `${label}: ${countLabel(n)}` : `${label}: no sample yet`));
  }
  return row;
}

function blockPanel(node) {
  const panel = el("div", { class: "block-panel" });
  if (node.description) panel.appendChild(el("p", { class: "block-longdesc", text: node.description }));
  let any = false;
  for (const key of sdkOrder()) {
    const ids = (node.sampleIds || []).filter((id) => {
      const s = state.byId.get(id);
      return s && s.sdk === key;
    });
    if (!ids.length) continue;
    any = true;
    panel.appendChild(
      el("div", { class: "sdk-group" }, [
        el("div", { class: "sdk-group-head" }, [
          sdkDot(key, true),
          el("b", { text: sdkMeta(key).label }),
          el("span", { class: "sdk-group-count", text: countLabel(ids.length) }),
        ]),
        el("div", { class: "card-grid" }, ids.map((id) => sampleCard(state.byId.get(id)))),
      ])
    );
  }
  if (!any) panel.appendChild(el("div", { class: "empty", text: "No samples mapped to this block." }));
  return panel;
}

function blockCard(node, opts = {}) {
  const isOpen = state.open.has(node.id);
  const n = (node.sampleIds || []).length;
  const row = el(
    "button",
    { class: "block-row", "aria-expanded": String(isOpen), onclick: () => toggleBlock(node.id) },
    [
      el("span", { class: "caret" + (isOpen ? " open" : ""), "aria-hidden": "true", text: "▸" }),
      el("span", { class: "block-main" }, [
        el("span", { class: "block-title-row" }, [
          opts.base ? el("span", { class: "base-tag", text: "BASE" }) : null,
          el("b", { class: "block-title", text: node.title }),
          node.tagline ? el("span", { class: "block-tagline", text: node.tagline }) : null,
        ]),
        !isOpen && node.description ? el("span", { class: "block-desc", text: node.description }) : null,
      ]),
      el("span", { class: "block-right" }, [dotRow(node), el("span", { class: "block-count", text: countLabel(n) })]),
    ]
  );
  const card = el("section", { class: "block-card" + (opts.base ? " base" : ""), dataset: { open: String(isOpen) } }, [row]);
  if (isOpen) card.appendChild(blockPanel(node));
  return card;
}

function sdkLegend() {
  const items = sdkOrder().map((key) =>
    el("li", { class: "legend-item" }, [sdkDot(key, true), el("span", { text: sdkMeta(key).label })])
  );
  return el("div", { class: "sdk-legend" }, [
    el("span", { class: "legend-title", text: "SDK legend" }),
    el("ul", { class: "legend-list" }, items),
  ]);
}

function renderGuide() {
  const host = document.getElementById("guideTree");
  host.innerHTML = "";
  if (!state.tree || !state.tree.base) {
    host.appendChild(el("div", { class: "empty", text: "Guide failed to load." }));
    return;
  }
  host.appendChild(
    el("div", { class: "blocks-head" }, [
      el("div", { class: "blocks-head-text" }, [
        el("h2", { text: "Start with the Foundry base, then stack building blocks" }),
        el("p", {
          class: "blocks-sub",
          text: "Each block’s dots show which SDKs already have a sample for it. Open a block to see the samples, grouped by SDK.",
        }),
      ]),
      sdkLegend(),
    ])
  );

  const stack = el("div", { class: "stack" });
  stack.appendChild(blockCard(state.tree.base, { base: true }));
  stack.appendChild(el("div", { class: "stack-caption", text: "Stack building blocks on top ↓" }));
  (state.tree.blocks || []).forEach((b) => stack.appendChild(blockCard(b)));
  host.appendChild(stack);
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
  mk("f-framework", Object.keys(state.meta.frameworks).map((k) => [k, SHORT_FRAMEWORK[k] || k]), "All frameworks");
  mk("f-protocol", PROTOCOL_ORDER.filter((k) => state.meta.protocols[k]).map((k) => [k, SHORT_PROTOCOL[k] || k]), "All protocols");
  mk("f-category", Object.entries(state.meta.categories), "All categories");
  mk("f-level", LEVEL_ORDER.map((k) => [k, k[0].toUpperCase() + k.slice(1)]), "All levels");
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

/* ---------- footer ---------- */
function setupFooter() {
  document.getElementById("sourceRepo").textContent = state.meta.source;
  document.getElementById("rootLink").href = state.meta.repoBaseUrl;
}

/* ---------- boot ---------- */
async function main() {
  try {
    await loadData();
  } catch (err) {
    document.getElementById("guideTree").appendChild(
      el("div", { class: "empty", html: `Could not load data. If you opened this file directly and see this, run <code>python -m http.server</code> in this folder and reload.<br><br>${String(err)}` })
    );
    return;
  }
  setupFooter();
  populateFilters();
  wireBrowse();
  wireTabs();
  renderGuide();
  setView("guide");
}

document.addEventListener("DOMContentLoaded", main);
