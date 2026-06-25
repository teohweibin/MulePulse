// =============================================
// CLEARCURRENT AI — DASHBOARD APP
// =============================================

const clusters = [
  {
    id: "MN-042",
    name: "Bukit Jalil split chain",
    risk: 91,
    accounts: 18,
    amount: 482000,
    window: "22 min",
    recommendation: "Freeze",
    selectedNode: "A104",
    explanation:
      "Account A104 received funds from 14 distinct sources within 18 minutes, then forwarded 92% of the balance to three downstream accounts. Two downstream nodes are within one hop of a known mule account.",
    features: [
      ["Many senders at once", "14 sources / 18 min"],
      ["Money moved quickly", "92% forwarded / 11 min"],
      ["Near a known mule", "1 hop"],
      ["Network tightness", "0.74"],
    ],
  },
  {
    id: "MN-031",
    name: "Johor device overlap ring",
    risk: 84,
    accounts: 11,
    amount: 216000,
    window: "47 min",
    recommendation: "Escalate",
    selectedNode: "B221",
    explanation:
      "Several accounts share device and recipient overlap while distributing funds to the same cash-out endpoints. The pattern looks like staged layering below normal transaction thresholds.",
    features: [
      ["Shared devices", "5 accounts"],
      ["Unusual spreading", "6.3x baseline"],
      ["Little money left behind", "8% median"],
      ["Repeated recipients", "4 endpoints"],
    ],
  },
  {
    id: "MN-027",
    name: "Klang rapid pass-through",
    risk: 76,
    accounts: 9,
    amount: 155000,
    window: "1h 12m",
    recommendation: "Escalate",
    selectedNode: "C088",
    explanation:
      "Inbound DuitNow transfers move through a short chain with unusually low waiting time. The cluster has no confirmed mule account yet, but the money-flow behavior is above the escalation level.",
    features: [
      ["Typical waiting time", "17 min"],
      ["Chain depth", "4 hops"],
      ["Split transfers", "21 transfers"],
      ["New account share", "67%"],
    ],
  },
  {
    id: "MN-019",
    name: "Penang watch cluster",
    risk: 63,
    accounts: 7,
    amount: 86000,
    window: "2h 4m",
    recommendation: "Monitor",
    selectedNode: "D014",
    explanation:
      "This cluster shows early collection behavior and many new accounts, but the pass-through pattern is not yet strong enough for a freeze recommendation. Continued monitoring is recommended.",
    features: [
      ["Sender count", "6 accounts"],
      ["Money movement speed", "38 min"],
      ["Known mule distance", "3 hops"],
      ["Network tightness", "0.41"],
    ],
  },
];

const nodes = [
  { id: "V001", label: "Sender A", x: 70,  y: 100, type: "source", risk: 38 },
  { id: "V002", label: "Sender B", x: 80,  y: 210, type: "source", risk: 31 },
  { id: "V003", label: "Sender C", x: 95,  y: 325, type: "source", risk: 34 },
  { id: "A104", label: "A104",    x: 280,  y: 215, type: "risk",   risk: 94 },
  { id: "A118", label: "A118",    x: 445,  y: 105, type: "watch",  risk: 74 },
  { id: "A173", label: "A173",    x: 455,  y: 230, type: "risk",   risk: 89 },
  { id: "A199", label: "A199",    x: 440,  y: 345, type: "watch",  risk: 69 },
  { id: "K777", label: "K777",    x: 640,  y: 165, type: "known",  risk: 98 },
  { id: "CASH", label: "Cash-out",x: 650,  y: 315, type: "cashout",risk: 82 },
];

const edges = [
  ["V001", "A104", "RM42k", true],
  ["V002", "A104", "RM31k", true],
  ["V003", "A104", "RM28k", true],
  ["A104", "A118", "RM92k", true],
  ["A104", "A173", "RM84k", true],
  ["A104", "A199", "RM67k", true],
  ["A118", "K777", "RM73k", false],
  ["A173", "K777", "RM81k", true],
  ["A199", "CASH", "RM55k", false],
];

const guideContent = {
  1: ["Spot the urgent case", "MulePulse sorts suspicious clusters by network risk so a non-technical reviewer can start with the most urgent case first."],
  2: ["Follow the flow", "The money-flow map shows how funds move from senders into a hub account, then out toward linked mule and cash-out accounts."],
  3: ["Read the reason", "The explanation avoids model jargon and tells the reviewer what triggered concern: many sources, fast forwarding, and known mule proximity."],
  4: ["Approve action", "The AI can recommend an action, but a person must choose monitor, escalate, or freeze. Every decision is logged for accountability."],
};

// --- Node colors ---------------------------------
function nodeColor(type) {
  return {
    source:  "#3b82f6",
    risk:    "#ef4444",
    watch:   "#f59e0b",
    known:   "#8b5cf6",
    cashout: "#06b6d4",
  }[type] || "#4b5563";
}

// --- Money formatter -----------------------------
function money(value) {
  if (value >= 1000000) return `RM ${(value / 1e6).toFixed(2)}M`;
  return `RM ${(value / 1000).toFixed(0)}k`;
}

// --- State ---------------------------------------
let threshold    = 70;
let activeCluster = clusters[0];
let activeNode    = activeCluster.selectedNode;
let logItems = [
  ["09:42", "MulePulse reviewed 214 recent DuitNow transfers."],
  ["09:44", "One money-flow cluster became urgent enough for review."],
  ["09:46", "AI prepared a plain-language case file for human approval."],
];

// --- DOM refs ------------------------------------
const graph         = document.querySelector("#networkGraph");
const queue         = document.querySelector("#clusterQueue");
const thresholdRange= document.querySelector("#thresholdRange");
const thresholdValue= document.querySelector("#thresholdValue");
const flaggedCount  = document.querySelector("#flaggedCount");
const networkRisk   = document.querySelector("#networkRisk");
const alertVolume   = document.querySelector("#alertVolume");
const modelTradeoff = document.querySelector("#modelTradeoff");
const caseDetails   = document.querySelector("#caseDetails");
const caseBadge     = document.querySelector("#caseBadge");
const explanationText = document.querySelector("#explanationText");
const featureList   = document.querySelector("#featureList");
const activityLog   = document.querySelector("#activityLog");
const guidedTitle   = document.querySelector("#guidedTitle");
const guidedText    = document.querySelector("#guidedText");

// --- Log -----------------------------------------
function appendLog(text) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  logItems.push([time, text]);
}

// --- Render graph --------------------------------
function renderGraph() {
  if (!graph) return;

  graph.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10z" fill="rgba(41,141,255,0.8)"/>
      </marker>
    </defs>
  `;

  // Draw edges
  edges.forEach(([from, to, label, hot]) => {
    const src = nodes.find(n => n.id === from);
    const tgt = nodes.find(n => n.id === to);
    if (!src || !tgt) return;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", src.x);
    line.setAttribute("y1", src.y);
    line.setAttribute("x2", tgt.x);
    line.setAttribute("y2", tgt.y);
    line.setAttribute("class", hot ? "edge hot" : "edge");
    graph.appendChild(line);

    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", (src.x + tgt.x) / 2);
    txt.setAttribute("y", (src.y + tgt.y) / 2 - 7);
    txt.setAttribute("fill", "#4b6380");
    txt.setAttribute("font-size", "10");
    txt.setAttribute("font-weight", "600");
    txt.setAttribute("text-anchor", "middle");
    txt.textContent = label;
    graph.appendChild(txt);
  });

  // Draw nodes
  nodes.forEach(node => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `node ${node.id === activeNode ? "selected" : ""}`);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `${node.label}, risk score ${node.risk}`);
    g.addEventListener("click", () => {
      activeNode = node.id;
      appendLog(`Reviewer selected account ${node.id} on the money-flow map.`);
      renderAll();
    });

    const r = node.id === activeNode ? 26 : 21;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", nodeColor(node.type));
    g.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + 4);
    label.textContent = node.label;
    g.appendChild(label);

    graph.appendChild(g);
  });
}

// --- Render queue --------------------------------
function renderQueue() {
  if (!queue) return;
  const visible = clusters.filter(c => c.risk >= threshold);
  queue.innerHTML = "";

  if (!visible.length) {
    queue.innerHTML = `<p class="no-cases">No cases at this comfort level.</p>`;
    return;
  }

  visible.forEach(c => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cluster-item ${c.id === activeCluster.id ? "active" : ""}`;
    btn.setAttribute("role", "listitem");
    btn.innerHTML = `
      <div class="cluster-top">
        <strong>${c.id}</strong>
        <span class="risk-score">${c.risk}</span>
      </div>
      <div class="cluster-name">${c.name}</div>
      <div class="cluster-meta">
        <span>${c.accounts} accounts</span>
        <span>${money(c.amount)}</span>
        <span>${c.window}</span>
      </div>
    `;
    btn.addEventListener("click", () => {
      activeCluster = c;
      activeNode    = c.selectedNode;
      appendLog(`Opened case ${c.id}: ${c.name}.`);
      renderAll();
    });
    queue.appendChild(btn);
  });
}

// --- Render case file ----------------------------
function renderCase() {
  if (!caseDetails || !caseBadge) return;
  const selected = nodes.find(n => n.id === activeNode);

  const recColor = {
    Freeze:   "#ef4444",
    Escalate: "#f59e0b",
    Monitor:  "#22c87a",
  }[activeCluster.recommendation] || "#298DFF";

  caseBadge.textContent = activeCluster.recommendation;
  caseBadge.style.background = recColor + "22";
  caseBadge.style.color      = recColor;
  caseBadge.style.border     = `1px solid ${recColor}44`;

  caseDetails.innerHTML = `
    <p class="case-summary">${activeCluster.name} looks like a coordinated mule network with urgency score ${activeCluster.risk}. Account ${selected ? selected.id : activeNode} is the key node selected for review.</p>
    <div class="case-stat-row"><span>Case ID</span><strong>${activeCluster.id}</strong></div>
    <div class="case-stat-row"><span>Accounts involved</span><strong>${activeCluster.accounts}</strong></div>
    <div class="case-stat-row"><span>Money exposed</span><strong>${money(activeCluster.amount)}</strong></div>
    <div class="case-stat-row"><span>Activity window</span><strong>${activeCluster.window}</strong></div>
    <div class="case-stat-row"><span>Suggested action</span><strong style="color:${recColor}">${activeCluster.recommendation}</strong></div>
  `;

  if (explanationText) explanationText.textContent = activeCluster.explanation;
  if (featureList) {
    featureList.innerHTML = activeCluster.features
      .map(([lbl, val]) => `<div class="feature"><span>${lbl}</span><strong>${val}</strong></div>`)
      .join("");
  }
}

// --- Render metrics ------------------------------
function renderMetrics() {
  const visible    = clusters.filter(c => c.risk >= threshold);
  const highest    = visible.length ? Math.max(...visible.map(c => c.risk)) : 0;
  const totalAmt   = visible.reduce((sum, c) => sum + c.amount, 0);

  if (networkRisk)  networkRisk.textContent  = highest;
  if (flaggedCount) flaggedCount.textContent  = visible.length;
  const fundsEl = document.querySelector("#fundsAtRisk");
  if (fundsEl) fundsEl.textContent = money(totalAmt);

  const alertEst = Math.max(8, Math.round(76 - threshold * 0.48));
  const recall   = Math.max(55, Math.round(109 - threshold * 0.33));
  const precision= Math.min(92, Math.round(36 + threshold * 0.5));
  if (alertVolume)   alertVolume.textContent   = `${alertEst} cases/day`;
  if (modelTradeoff) modelTradeoff.textContent  = recall > 84 ? "Catches more fraud · more cases" : precision > 76 ? "Fewer cases · stricter list" : "Balanced coverage · manageable";
}

// --- Render log ----------------------------------
function renderLog() {
  if (!activityLog) return;
  activityLog.innerHTML = logItems
    .slice(-6)
    .reverse()
    .map(([t, txt]) => `<li><time>${t}</time><span>${txt}</span></li>`)
    .join("");
}

// --- Render all ----------------------------------
function renderAll() {
  if (thresholdValue) thresholdValue.textContent = threshold;
  renderMetrics();
  renderQueue();
  renderGraph();
  renderCase();
  renderLog();
}

// =============================================
// EVENT LISTENERS
// =============================================

if (thresholdRange) {
  thresholdRange.addEventListener("input", e => {
    threshold = Number(e.target.value);
    renderAll();
  });
}

const runAgentBtn = document.querySelector("#runAgent");
if (runAgentBtn) {
  runAgentBtn.addEventListener("click", () => {
    const visible = clusters.filter(c => c.risk >= threshold);
    activeCluster = visible.sort((a, b) => b.risk - a.risk)[0] || clusters[0];
    activeNode    = activeCluster.selectedNode;
    appendLog(`MulePulse refreshed the case file for ${activeCluster.id}.`);
    renderAll();

    // button feedback
    runAgentBtn.textContent = "Refreshed ✓";
    runAgentBtn.style.color = "#22c87a";
    setTimeout(() => {
      runAgentBtn.textContent = "Refresh AI case file";
      runAgentBtn.style.color = "";
    }, 1500);
  });
}

document.querySelectorAll(".decision-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    appendLog(`Human reviewer selected ${btn.dataset.action} for ${activeCluster.id}.`);
    renderLog();

    // Flash highlight
    btn.style.opacity = "0.5";
    setTimeout(() => { btn.style.opacity = ""; }, 300);
  });
});

document.querySelectorAll(".guide-step").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".guide-step").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    const [title, text] = guideContent[btn.dataset.step];
    if (guidedTitle) guidedTitle.textContent = title;
    if (guidedText)  guidedText.textContent  = text;
    appendLog(`Demo guide step ${btn.dataset.step}: ${title}.`);
    renderLog();
  });
});

// =============================================
// INIT
// =============================================
renderAll();
