import fs from "fs";
import path from "path";

const LAB_DATA_ROOT = path.join(process.cwd(), "labs", "data");
const MECH_ROOT = path.join(process.cwd(), "mechanisms");
const PHARMA_ROOT = path.join(process.cwd(), "pharma", "compounds");
const SUPPORT_ROOT = path.join(process.cwd(), "support", "levels");
const RISK_MODEL_ROOT = path.join(process.cwd(), "risk", "model");

function safeLoadJSON(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function buildReport(user_id) {
  const labs = safeLoadJSON(path.join(LAB_DATA_ROOT, user_id + ".json")) || {};
  const support = safeLoadJSON(path.join(SUPPORT_ROOT, "base.json")) || { id: "base", name: "Base Support" };
  const systemsModel = safeLoadJSON(path.join(RISK_MODEL_ROOT, "systems.json")) || {};

  const mechanisms = loadMechanisms();
  const pharma = loadPharma();

  const indices = estimateIndicesFromLabs(labs);
  const riskSummary = estimateRiskFromMechanisms(mechanisms, systemsModel, support);

  return {
    user_id,
    summary: {
      global_risk_before: riskSummary.global.before,
      global_risk_after: riskSummary.global.after,
      metabolic_index: indices.metabolic,
      liver_index: indices.liver,
      kidney_index: indices.kidney,
      inflammation_index: indices.inflammation,
      hormonal_index: indices.hormonal
    },
    blocks: {
      labs: {
        raw: labs,
        indices
      },
      mechanisms: riskSummary.systems,
      pharma,
      support
    }
  };
}

function loadMechanisms() {
  if (!fs.existsSync(MECH_ROOT)) return {};
  const files = fs.readdirSync(MECH_ROOT).filter(f => f.endsWith(".json"));
  const res = {};
  for (const f of files) {
    const full = path.join(MECH_ROOT, f);
    const data = safeLoadJSON(full);
    if (!data) continue;
    res[f.replace(".json", "")] = data;
  }
  return res;
}

function loadPharma() {
  if (!fs.existsSync(PHARMA_ROOT)) return [];
  const files = fs.readdirSync(PHARMA_ROOT).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const full = path.join(PHARMA_ROOT, f);
    const data = safeLoadJSON(full);
    return {
      id: data.id,
      name: data.name,
      group: data.group,
      route: data.route,
      typical_dose_mg_week: data.typical_dose_mg_week,
      typical_dose_mcg_day: data.typical_dose_mcg_day,
      typical_dose_mg_day: data.typical_dose_mg_day
    };
  });
}

function estimateIndicesFromLabs(labs) {
  function val(k, def = 50) {
    return labs[k] != null ? labs[k] : def;
  }
  return {
    metabolic: 70,   // можно заменить на реальный расчёт, если labs_engine уже есть
    liver: 65,
    kidney: 68,
    inflammation: 60,
    hormonal: 62
  };
}

function estimateRiskFromMechanisms(mech, systemsModel, support) {
  const systems = {};
  for (const [sys, data] of Object.entries(mech)) {
    const arr = data.mechanisms || [];
    let before = 0;
    let after = 0;
    for (const m of arr) {
      before += m.before || 0;
      after += m.after || 0;
    }
    systems[sys] = {
      before: Math.round(before / Math.max(arr.length || 1, 1)),
      after: Math.round(after / Math.max(arr.length || 1, 1))
    };
  }

  const globalBefore = Object.values(systems).reduce((a, b) => a + b.before, 0);
  const globalAfter = Object.values(systems).reduce((a, b) => a + b.after, 0);

  return {
    global: {
      before: Math.round(globalBefore / Math.max(Object.keys(systems).length || 1, 1)),
      after: Math.round(globalAfter / Math.max(Object.keys(systems).length || 1, 1))
    },
    systems
  };
}
