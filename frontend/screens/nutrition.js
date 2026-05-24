
let currentConfig = null;

async function loadNutrition() {
  const res = await fetch("/nutrition?user_id=1");
  if (!res.ok) {
    console.error("Failed to load nutrition");
    return;
  }
  const data = await res.json();
  currentConfig = data.user;
  renderNutrition(data);
}

function renderNutrition(d) {
  const u = d.user;
  const goals = d.goals;
  const plan = d.plan;
  const deficits = d.deficits || [];

  document.getElementById("nutr-user").innerHTML = `
    <h2>Профиль</h2>
    <div class="row"><span>Вес:</span><b>${u.weight_kg} кг</b></div>
    <div class="row"><span>Рост:</span><b>${u.height_cm} см</b></div>
    <div class="row"><span>Возраст:</span><b>${u.age}</b></div>
    <div class="row"><span>Пол:</span><b>${u.sex === "f" ? "Ж" : "М"}</b></div>
    <div class="row"><span>Активность:</span><b>${mapActivity(u.activity)}</b></div>
  `;

  const goalOptions = Object.values(goals)
    .map(g => `<option value="${g.id}" ${g.id === d.current_goal ? "selected" : ""}>${g.name}</option>`)
    .join("");

  document.getElementById("nutr-goal").innerHTML = `
    <h2>Цель</h2>
    <label>Цель питания</label>
    <select id="nutr-goal-select">
      ${goalOptions}
    </select>
    <button id="nutr-save-btn">Сохранить и пересчитать</button>
  `;

  document.getElementById("nutr-plan").innerHTML = `
    <h2>План</h2>
    <div class="row"><span>Поддержка:</span><b>${plan.maintenance} ккал</b></div>
    <div class="row"><span>Цель:</span><b>${plan.targetCalories} ккал</b></div>
    <div class="row"><span>Белки:</span><b>${plan.protein} г</b></div>
    <div class="row"><span>Жиры:</span><b>${plan.fat} г</b></div>
    <div class="row"><span>Углеводы:</span><b>${plan.carbs} г</b></div>
  `;

  const defRoot = document.getElementById("nutr-deficits");
  if (!deficits.length) {
    defRoot.innerHTML = "<div class='card'><h2>Дефициты по анализам</h2><div>Явных дефицитов не выявлено или нет данных по анализам.</div></div>";
  } else {
    defRoot.innerHTML = `
      <h2>Дефициты по анализам</h2>
      ${deficits.map(d => `
        <div class="card">
          <div class="row">
            <div><b>${d.label}</b></div>
            <div>${d.value} (порог ${d.threshold})</div>
          </div>
          <div class="row small">
            <span>Влияние: ${d.effect.join(", ")}</span>
          </div>
          <div class="row small">
            <span>Рекомендация: ${d.recommendation}</span>
          </div>
        </div>
      `).join("")}
    `;
  }

  document.getElementById("nutr-goal-select").addEventListener("change", e => {
    currentConfig.goal = e.target.value;
  });
  document.getElementById("nutr-save-btn").addEventListener("click", saveNutritionConfig);
}

function mapActivity(a) {
  if (a === "low") return "Низкая";
  if (a === "high") return "Высокая";
  return "Умеренная";
}

async function saveNutritionConfig() {
  if (!currentConfig) return;
  const payload = {
    user_id: 1,
    config: currentConfig
  };
  const res = await fetch("/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    console.error("Failed to save nutrition config");
    return;
  }
  // после сохранения — перезагрузить, чтобы пересчитать план
  loadNutrition();
}

loadNutrition();
