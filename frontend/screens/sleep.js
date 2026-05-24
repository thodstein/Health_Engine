
async function loadSleep() {
  const res = await fetch("/sleep?user_id=1");
  const d = await res.json();
  renderSleep(d);
}

function renderSleep(d) {
  const u = d.user;

  document.getElementById("sleep-block").innerHTML = `
    <div class="card">
      <h2>Сон</h2>
      <div class="row"><span>Длительность:</span><b>${u.duration_hours} ч</b></div>
      <div class="row"><span>Глубокий сон:</span><b>${u.deep_pct}%</b></div>
      <div class="row"><span>REM:</span><b>${u.rem_pct}%</b></div>
      <div class="row"><span>Оценка сна:</span><b>${d.sleep_score}/100</b></div>
    </div>
  `;

  document.getElementById("stress-block").innerHTML = `
    <div class="card">
      <h2>Стресс</h2>
      <div class="row"><span>Стресс‑оценка:</span><b>${d.stress_score}/100</b></div>
      <div class="row"><span>Кофеин:</span><b>${u.caffeine_mg} мг</b></div>
      <div class="row"><span>Нагрузка:</span><b>${u.workload}/10</b></div>
      <div class="row"><span>Эмоциональный фон:</span><b>${u.emotional}/10</b></div>
    </div>
  `;

  document.getElementById("sleep-rec").innerHTML = `
    <h2>Рекомендации по сну</h2>
    ${d.recommendations.sleep.map(r => `<div class="card">${r}</div>`).join("")}
  `;

  document.getElementById("stress-rec").innerHTML = `
    <h2>Рекомендации по стрессу</h2>
    <div class="card">${d.recommendations.stress}</div>
  `;
}

loadSleep();
