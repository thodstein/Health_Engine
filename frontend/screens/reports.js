
async function loadReport() {
  const res = await fetch("/reports/summary?user_id=1");
  if (!res.ok) {
    console.error("Failed to load report");
    return;
  }
  const data = await res.json();
  renderReport(data);
}

function renderReport(r) {
  const s = r.summary || {};
  document.getElementById("report-summary").innerHTML = `
    <div class="card">
      <h2>Глобальная сводка</h2>
      <div class="row"><span>Глобальный риск (до):</span><b>${s.global_risk_before ?? "-"}</b></div>
      <div class="row"><span>Глобальный риск (после):</span><b>${s.global_risk_after ?? "-"}</b></div>
      <div class="row"><span>Метаболический индекс:</span><b>${s.metabolic_index ?? "-"}</b></div>
      <div class="row"><span>Печень:</span><b>${s.liver_index ?? "-"}</b></div>
      <div class="row"><span>Почки:</span><b>${s.kidney_index ?? "-"}</b></div>
      <div class="row"><span>Воспаление:</span><b>${s.inflammation_index ?? "-"}</b></div>
      <div class="row"><span>Гормоны:</span><b>${s.hormonal_index ?? "-"}</b></div>
    </div>
  `;

  const blocks = r.blocks || {};
  const mech = blocks.mechanisms || {};
  const pharma = blocks.pharma || [];
  const support = blocks.support || {};

  const mechHtml = Object.entries(mech)
    .map(([sys, v]) => `
      <div class="card">
        <div class="row">
          <div>${sys}</div>
          <div>до: ${v.before} • после: ${v.after}</div>
        </div>
      </div>
    `).join("");

  const pharmaHtml = pharma.map(p => `
    <div class="card">
      <div class="row">
        <div>${p.name}</div>
        <div>${p.group || ""}</div>
      </div>
      <div class="row small">
        <span>Маршрут: ${p.route || "-"}</span>
      </div>
    </div>
  `).join("");

  const supportHtml = `
    <div class="card">
      <h2>Поддержка</h2>
      <div>${support.name || support.id || "—"}</div>
    </div>
  `;

  document.getElementById("report-sections").innerHTML = `
    <h2>Механизмы</h2>
    ${mechHtml || "<div class='card'>Нет данных по механизмам</div>"}
    <h2>Фарма</h2>
    ${pharmaHtml || "<div class='card'>Нет фармы</div>"}
    <h2>Поддержка</h2>
    ${supportHtml}
  `;
}

loadReport();
