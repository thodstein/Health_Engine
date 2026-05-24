
// ======================================================================
// FRONTEND ROUTER
// ======================================================================

const screens = {
  dashboard: "screens/dashboard.html",
  nutrition: "screens/nutrition.html",
  sleep: "screens/sleep.html",
  labs: "screens/labs.html",
  pharma: "screens/pharma.html",
  training: "screens/training.html",
  mechanisms: "screens/mechanisms.html",
  risks: "screens/risks.html",
  support: "screens/support.html",
  reports: "screens/reports.html"
};

async function loadScreen(name) {
  const root = document.getElementById("app-root");
  if (!root) return;

  const url = screens[name];
  if (!url) {
    root.innerHTML = "<div class='card'>Экран не найден</div>";
    return;
  }

  const html = await fetch(url).then(r => r.text());
  root.innerHTML = html;
}

function initNavbar() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      loadScreen(target);
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  loadScreen("dashboard");
});
