
async function loadPanels() {
  const res = await fetch("/norms/panels");
  if (!res.ok) return;
  const data = await res.json();
  renderPanels(data);
}

function renderPanels(list) {
  const root = document.getElementById("norms-root");
  if (!root) return;

  root.innerHTML = list.map(p => `
    <div class="card norm-panel" data-id="${p.id}">
      <div class="row">
        <div>${p.panel}</div>
        <div>${p.markers} показателей</div>
      </div>
    </div>
  `).join("");

  root.querySelectorAll(".norm-panel").forEach(el => {
    el.addEventListener("click", () => openPanel(el.getAttribute("data-id")));
  });
}

async function openPanel(id) {
  const res = await fetch("/norms/panel?id=" + encodeURIComponent(id));
  if (!res.ok) return;
  const data = await res.json();
  const root = document.getElementById("norms-root");
  root.innerHTML = `
    <div class="card">
      <h2>${data.panel}</h2>
      <div class="markers">
        ${Object.entries(data.markers).map(([key, m]) => `
          <div class="marker-row">
            <div class="marker-name">${m.name}</div>
            <div class="marker-range">
              ${m.min ?? ""}–${m.max ?? ""} ${m.unit || ""}
              ${m.optimal ? `(опт: ${m.optimal[0]}–${m.optimal[1]})` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

loadPanels();
