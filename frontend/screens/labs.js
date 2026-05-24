
async function loadIndices() {
  const res = await fetch("/labs/indices?user_id=1");
  if (!res.ok) {
    console.error("Failed to load lab indices");
    return;
  }
  const data = await res.json();
  renderIndices(data);
}

function renderIndices(idx) {
  const root = document.getElementById("labs-indices");
  if (!root) return;

  const map = [
    { key: "metabolic", label: "Метаболический риск" },
    { key: "liver", label: "Печень" },
    { key: "kidney", label: "Почки" },
    { key: "inflammation", label: "Воспаление" },
    { key: "hormonal", label: "Гормональный профиль" }
  ];

  root.innerHTML = map.map(item => {
    const v = idx[item.key] ?? 50;
    return `
      <div class="card">
        <div class="row">
          <div>${item.label}</div>
          <div><b>${v}</b>/100</div>
        </div>
        <div class="bar">
          <div class="bar-fill" style="width:${v}%;"></div>
        </div>
      </div>
    `;
  }).join("");
}

loadIndices();
