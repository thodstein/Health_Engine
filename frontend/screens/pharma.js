
let currentCompound = null;

async function loadCompounds() {
  const res = await fetch("/pharma/list");
  if (!res.ok) {
    console.error("Failed to load compounds");
    return;
  }
  const data = await res.json();
  renderCompounds(data);
}

function renderCompounds(list) {
  const root = document.getElementById("pharma-list");
  if (!root) return;

  root.innerHTML = list.map(c => `
    <div class="card compound-card" data-id="${c.id}">
      <div class="compound-header">
        <div class="title">${c.name}</div>
        <div class="group">${c.group}</div>
      </div>
      <div class="meta">
        ${c.ester ? `Эфир: ${c.ester} • ` : ""}Маршрут: ${c.route || "-"}
      </div>
    </div>
  `).join("");

  root.querySelectorAll(".compound-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      openCompound(id);
    });
  });
}

async function openCompound(id) {
  const res = await fetch("/pharma/compound?id=" + encodeURIComponent(id));
  if (!res.ok) return;
  const c = await res.json();
  currentCompound = c;

  const card = document.getElementById("pharma-calc-card");
  const nameEl = document.getElementById("pharma-calc-name");
  const resultEl = document.getElementById("pharma-calc-result");

  if (!card || !nameEl || !resultEl) return;

  nameEl.textContent = c.name + (c.concentration_mg_ml ? ` (${c.concentration_mg_ml} мг/мл)` : "");
  resultEl.innerHTML = "";
  card.style.display = "block";
}

async function runCalc() {
  if (!currentCompound) return;

  const weekly_dose_mg = parseFloat(document.getElementById("weekly_dose_mg").value || "0");
  const injections_per_week = parseInt(document.getElementById("injections_per_week").value || "0", 10);
  const syringe_volume_ml = parseFloat(document.getElementById("syringe_volume_ml").value || "1");
  const syringe_units = parseInt(document.getElementById("syringe_units").value || "100", 10);

  const payload = {
    compound_id: currentCompound.id,
    weekly_dose_mg,
    injections_per_week,
    syringe_volume_ml,
    syringe_units
  };

  const res = await fetch("/pharma/calc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const resultEl = document.getElementById("pharma-calc-result");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    resultEl.innerHTML = "<div class='error'>Ошибка: " + (err.error || "неизвестно") + "</div>";
    return;
  }

  const data = await res.json();

  resultEl.innerHTML = `
    <div class="calc-line">Доза за инъекцию: <b>${data.dose_per_injection_mg.toFixed(1)} мг</b></div>
    <div class="calc-line">Объём за инъекцию: <b>${data.ml_per_injection.toFixed(3)} мл</b></div>
    <div class="calc-line">Делений на шприце: <b>${data.units_per_injection.toFixed(1)}</b></div>
  `;
}

document.addEventListener("click", e => {
  if (e.target && e.target.id === "pharma-calc-run") {
    runCalc();
  }
});

loadCompounds();
