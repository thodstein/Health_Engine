
async function loadRisks() {
  const res = await fetch("/risks?user_id=1");
  const data = await res.json();
  renderRisks(data);
}

function renderRisks(data) {
  document.getElementById("risk-global").innerHTML = `
    <div class="card">
      <h2>Глобальный риск</h2>
      <div>До: ${data.global.before}</div>
      <div>После: ${data.global.after}</div>
    </div>
  `;

  const systems = Object.entries(data.systems)
    .map(([sys, v]) => `
      <div class="card">
        <h3>${sys}</h3>
        <div>До: ${v.before}</div>
        <div>После: ${v.after}</div>
      </div>
    `)
    .join("");

  document.getElementById("risk-systems").innerHTML = systems;
}

loadRisks();
