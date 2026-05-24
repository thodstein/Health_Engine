
async function loadPresets() {
  const res = await fetch("/training/presets");
  if (!res.ok) {
    console.error("Failed to load presets");
    return;
  }
  const data = await res.json();
  renderPresets(data);
}

function renderPresets(list) {
  const root = document.getElementById("training-root");
  if (!root) return;

  root.innerHTML = list.map(p => `
    <div class="card preset-card" data-id="${p.id}">
      <div class="preset-header">
        <div class="title">${p.name}</div>
        <div class="phase">${p.phase.toUpperCase()}</div>
      </div>
      <div class="meta">
        ${p.weeks} нед • ${p.freq_per_week} трен/нед
      </div>
    </div>
  `).join("");

  root.querySelectorAll(".preset-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      openPreset(id);
    });
  });
}

async function openPreset(id) {
  const res = await fetch("/training/preset?id=" + encodeURIComponent(id));
  if (!res.ok) return;
  const preset = await res.json();
  renderPresetDetail(preset);
}

function renderPresetDetail(p) {
  const root = document.getElementById("training-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="preset-header">
        <div class="title">${p.name}</div>
        <div class="phase">${p.phase.toUpperCase()}</div>
      </div>
      <div class="meta">${p.weeks} недель • ${p.freq_per_week} трен/нед</div>
      <div class="notes">${p.notes || ""}</div>
    </div>
    <div class="days">
      ${(p.days || []).map(d => `
        <div class="card day-card">
          <div class="day-header">
            <div>День ${d.day}</div>
            <div class="focus">${d.focus}</div>
          </div>
          <div class="blocks">
            ${(d.blocks || []).map(b => `
              <div class="block">
                <div class="block-main">
                  <span class="block-type">${b.type}</span>
                  <span class="block-name">${b.name}</span>
                </div>
                <div class="block-meta">
                  ${b.sets ? `${b.sets}×${b.reps}` : ""} 
                  ${b.rir ? ` • RIR ${b.rir}` : ""} 
                  ${b.intensity ? ` • ${b.intensity}` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

loadPresets();
