// Маппинг систем → читаемые названия
const SYSTEM_LABELS = {
  liver: "Печень",
  kidney: "Почки",
  heart: "Сердце",
  vessels: "Сосуды",
  lungs: "Лёгкие",
  gut: "ЖКТ",
  pancreas: "Поджелудочная",
  thyroid: "Щитовидная железа",
  hormones: "Половые гормоны",
  immunity: "Иммунитет",
  inflammation: "Воспаление",
  metabolism: "Метаболизм",
  bones: "Кости",
  joints: "Суставы",
  ligaments: "Связки",
  eyes: "Глаза",
  skin: "Кожа",
  cns: "ЦНС",
  pns: "ПНС",
  sleep: "Сон",
  stress: "Стресс"
};

// Заглушка: в реальном приложении сюда прилетит JSON с бэка
// Сейчас — пример структуры, аналогичной mechanisms/*.json
const MOCK_DATA = {
  liver: [
    { name: "Детоксикация (фаза I/II)", before: 78, after: 42 },
    { name: "Антиоксидантная защита", before: 65, after: 40 }
  ],
  cns: [
    { name: "Оксидативный стресс", before: 78, after: 42 },
    { name: "Митохондрии", before: 72, after: 55 },
    { name: "Глутаматная токсичность", before: 55, after: 40 }
  ],
  joints: [
    { name: "Хрящ", before: 65, after: 55 },
    { name: "Воспаление", before: 70, after: 50 }
  ],
  eyes: [
    { name: "Сетчатка", before: 70, after: 50 },
    { name: "Оксидативный стресс", before: 75, after: 40 }
  ]
  // ... остальные системы подхватятся автоматически, когда прилетят с бэка
};

function riskColor(value) {
  if (value >= 80) return "#ff4d4f";
  if (value >= 60) return "#faad14";
  if (value >= 40) return "#52c41a";
  return "#36cfc9";
}

function renderMechanismCard(mech) {
  const diff = mech.before - mech.after;
  const sign = diff > 0 ? "-" : diff < 0 ? "+" : "0";
  const diffAbs = Math.abs(diff);

  return `
    <div class="mech-card">
      <div class="mech-header">
        <div class="mech-title">${mech.name}</div>
      </div>
      <div class="mech-body">
        <div class="mech-risk-row">
          <span class="label">До:</span>
          <span class="value" style="color:${riskColor(mech.before)}">${mech.before}</span>
        </div>
        <div class="mech-risk-row">
          <span class="label">После:</span>
          <span class="value" style="color:${riskColor(mech.after)}">${mech.after}</span>
        </div>
        <div class="mech-diff">
          Δ риск: <span class="chip ${diff > 0 ? "chip-good" : diff < 0 ? "chip-bad" : ""}">
            ${sign}${diffAbs}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderSystemBlock(key, mechanisms) {
  const title = SYSTEM_LABELS[key] || key;

  const cards = mechanisms.map(renderMechanismCard).join("\n");

  return `
    <section class="system-block">
      <div class="system-header">
        <h2>${title}</h2>
        <span class="badge">${mechanisms.length} механизм(ов)</span>
      </div>
      <div class="system-body">
        ${cards}
      </div>
    </section>
  `;
}

function renderAllMechanisms(data) {
  const root = document.getElementById("mechanisms-root");
  if (!root) return;

  const blocks = Object.entries(data)
    .map(([key, mechanisms]) => renderSystemBlock(key, mechanisms))
    .join("\n");

  root.innerHTML = blocks;
}

// TODO: заменить MOCK_DATA на реальный fetch:
// fetch("/mechanisms?user_id=...")
//   .then(r => r.json())
//   .then(renderAllMechanisms);

renderAllMechanisms(MOCK_DATA);
