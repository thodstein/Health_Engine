import fs from "fs";
import path from "path";

const LAB_DATA = path.join(process.cwd(), "labs", "data");
const MECH_ROOT = path.join(process.cwd(), "mechanisms");
const PHARMA_ROOT = path.join(process.cwd(), "pharma", "compounds");
const SUPPORT_ROOT = path.join(process.cwd(), "support", "levels");
const TRAIN_ROOT = path.join(process.cwd(), "training", "presets");
const NUTR_ROOT = path.join(process.cwd(), "nutrition", "data");
const SLEEP_ROOT = path.join(process.cwd(), "sleep", "data");

function safeLoad(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function buildDashboard(user_id) {
  const labs = safeLoad(path.join(LAB_DATA, user_id + ".json")) || {};
  const nutrition = safeLoad(path.join(NUTR_ROOT, user_id + ".json")) || {};
  const sleep = safeLoad(path.join(SLEEP_ROOT, user_id + ".json")) || {};

  const mechanisms = loadMechanisms();
  const pharma = loadPharma();
  const support = loadSupport();
  const training = loadTraining();

  const indices = estimateIndices(labs);
  const risk = estimateRisk(mechanisms, support);

  return {
    user_id,
    global: {
      risk_before: risk.global.before,
      risk_after: risk.global.after
    },
    indices,
    mechanisms: pickMechanismHighlights(mechanisms),
    pharma,
    support,
    training,
    nutrition,
    sleep
  };
}

function loadMechanisms() {
  const files = fs.readdirSync(MECH_ROOT).filter(f => f.endsWith(".json"));
  const res = {};
  for (const f of files) {
    const data = safeLoad(path.join(MECH_ROOT, f));
    if (!data) continue;
    res[f.replace(".json", "")] = data.mechanisms;
  }
  return res;
}

function loadPharma() {
  const files = fs.readdirSync(PHARMA_ROOT).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const d = safeLoad(path.join(PHARMA_ROOT, f));
    return { id: d.id, name: d.name, group: d.group, route: d.route };
  });
}

function loadSupport() {
  return safeLoad(path.join(SUPPORT_ROOT, "base.json")) || { id: "base" };
}

function loadTraining() {
  const files = fs.readdirSync(TRAIN_ROOT).filter(f => f.endsWith(".json"));
  if (!files.length) return {};
  const d = safeLoad(path.join(TRAIN_ROOT, files[0]));
  return {
    name: d.name,
    phase: d.phase,
    freq: d.freq_per_week,
    today: d.days?.[0] || null
  };
}

function estimateIndices(labs) {
  return {
    metabolic: 70,
    liver: 65,
    kidney: 68,
    inflammation: 60,
    hormonal: 62
  };
}

function estimateRisk(mech, support) {
  const systems = {};
  for (const [sys, arr] of Object.entries(mech)) {
    let b = 0, a = 0;
    for (const m of arr) {
      b += m.before;
      a += m.after;
    }
    systems[sys] = {
      before: Math.round(b / arr.length),
      after: Math.round(a / arr.length)
    };
  }
  const gb = Object.values(systems).reduce((s, v) => s + v.before, 0);
  const ga = Object.values(systems).reduce((s, v) => s + v.after, 0);
  return {
    global: {
      before: Math.round(gb / Object.keys(systems).length),
      after: Math.round(ga / Object.keys(systems).length)
    },
    systems
  };
}

function pickMechanismHighlights(mech) {
  const flat = [];
  for (const [sys, arr] of Object.entries(mech)) {
    for (const m of arr) {
      flat.push({
        system: sys,
        name: m.name,
        before: m.before,
        after: m.after,
        delta: m.after - m.before
      });
    }
  }
  const worst = [...flat].sort((a, b) => b.delta - a.delta).slice(0, 5);
  const best = [...flat].sort((a, b) => a.delta - b.delta).slice(0, 5);
  return { worst, best };
}
