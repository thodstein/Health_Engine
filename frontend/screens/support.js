
async function loadSupport() {
  const res = await fetch("/support?user_id=1");
  const data = await res.json();
  renderSupport(data);
}

function renderSupport(data) {
  document.getElementById("support-current").innerHTML = `
    <div class="card">
      <h2>Текущий уровень</h2>
      <div>${data.name}</div>
    </div>
  `;

  const levels = ["base", "medium", "maximum"]
    .map(l => `
      <button class="btn" onclick="setLevel('${l}')">${l}</button>
    `)
    .join("");

  document.getElementById("support-levels").innerHTML = levels;
}

async function setLevel(level) {
  await fetch("/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: 1, level })
  });
  loadSupport();
}

loadSupport();
