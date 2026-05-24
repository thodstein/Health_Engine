import fs from "fs";
import path from "path";

const MODEL_ROOT = path.join(process.cwd(), "risk", "model");
const SUPPORT_ROOT = path.join(process.cwd(), "support", "levels");
const MECH_ROOT = path.join(process.cwd(), "mechanisms");

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function calculateRisks(user_id) {
  const systems = loadJSON(path.join(MODEL_ROOT, "systems.json"));
  const mechWeights = loadJSON(path.join(MODEL_ROOT, "mechanism_weights.json"));

  const supportLevel = loadSupport(user_id);

  const systemScores = {};

  for (const sys of Object.keys(systems)) {
    const mechFile = path.join(MECH_ROOT, sys + ".json");
    if (!fs.existsSync(mechFile)) continue;

    const mechData = loadJSON(mechFile).mechanisms;

    let scoreBefore = 0;
    let scoreAfter = 0;

    for (const m of mechData) {
      const w = mechWeights[getKey(m.name)] || 0.1;

      const before = m.before * w;
      const after = m.after * w * (1 - (supportLevel.reduction[getKey(m.name)] || 0));

      scoreBefore += before;
      scoreAfter += after;
    }

    systemScores[sys] = {
      before: Math.round(scoreBefore),
      after: Math.round(scoreAfter)
    };
  }

  const globalBefore = Object.values(systemScores).reduce((a, b) => a + b.before, 0);
  const globalAfter = Object.values(systemScores).reduce((a, b) => a + b.after, 0);

  return {
    user_id,
    global: {
      before: Math.round(globalBefore / 10),
      after: Math.round(globalAfter / 10)
    },
    systems: systemScores,
    support: supportLevel
  };
}

function getKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zа-я0-9]/gi, "")
    .replace("оксидативныйстресс", "oxidative")
    .replace("воспаление", "inflammation")
    .replace("митохондрии", "mitochondria")
    .replace("детоксикацияфаза iii", "detox")
    .replace("сонвосстановление", "sleep")
    .replace("стресс", "stress");
}

function loadSupport(user_id) {
  const file = path.join(SUPPORT_ROOT, "base.json");
  return loadJSON(file);
}
