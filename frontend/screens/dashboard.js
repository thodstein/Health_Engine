
async function loadDash() {
  const res = await fetch("/dashboard?user_id=1");
  const d = await res.json();
  renderDash(d);
}

function renderDash(d) {
  document.getElementById("dash-global").innerHTML = `
    <div class="card">
      <h2>Глобальный риск</h2>
      <div>До: ${d.global.risk_before}</div>
      <div>После: ${d.global.risk_after}</div>
    </div>
  `;

  document.getElementById("dash-indices").innerHTML = `
    <h2>Индексы систем</h2>
    <div class="card">Метаболизм: ${d.indices.metabolic}</div>
    <div class="card">Печень: ${d.indices.liver}</div>
    <div class="card">Почки: ${d.indices.kidney}</div>
    <div class="card">Воспаление: ${d.indices.inflammation}</div>
    <div class="card">Гормоны: ${d.indices.hormonal}</div>
  `;

  const worst = d.mechanisms.worst.map(m => `
    <div class="card">
      <b>${m.name}</b> (${m.system})<br>
      Δ: ${m.delta}
    </div>
  `).join("");

  const best = d.mechanisms.best.map(m => `
    <div class="card">
      <b>${m.name}</b> (${m.system})<br>
      Δ: ${m.delta}
    </div>
  `).join("");

  document.getElementById("dash-mech").innerHTML = `
    <h2>Механизмы</h2>
    <h3>Худшие</h3>
    ${worst}
    <h3>Лучшие</h3>
    ${best}
  `;

  document.getElementById("dash-pharma").innerHTML = `
    <h2>Фарма</h2>
    ${d.pharma.map(p => `<div class="card">${p.name} (${p.group})</div>`).join("")}
  `;

  document.getElementById("dash-support").innerHTML = `
    <h2>Поддержка</h2>
    <div class="card">${d.support.name || d.support.id}</div>
  `;

  document.getElementById("dash-training").innerHTML = `
    <h2>Тренинг</h2>
    <div class="card">
      ${d.training.name || "-"}<br>
      Фаза: ${d.training.phase || "-"}<br>
      Частота: ${d.training.freq || "-"}<br>
      Сегодня: ${d.training.today?.focus || "-"}
    </div>
  `;

  document.getElementById("dash-nutrition").innerHTML = `
    <h2>Питание</h2>
    <div class="card">
      Калории: ${d.nutrition.calories || "-"}<br>
      Белки: ${d.nutrition.protein || "-"}<br>
      Жиры: ${d.nutrition.fat || "-"}<br>
      Углеводы: ${d.nutrition.carbs || "-"}
    </div>
  `;

  document.getElementById("dash-sleep").innerHTML = `
    <h2>Сон и стресс</h2>
    <div class="card">
      Сон: ${d.sleep.sleep_score || "-"}<br>
      Стресс: ${d.sleep.stress_score || "-"}
    </div>
  `;
}

loadDash();
