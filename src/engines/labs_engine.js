import fs from "fs";
import path from "path";

const LAB_DATA_ROOT = path.join(process.cwd(), "labs", "data");
const MODEL_ROOT = path.join(process.cwd(), "labs", "model");
const PANELS_ROOT = path.join(MODEL_ROOT, "panels");

if (!fs.existsSync(LAB_DATA_ROOT)) fs.mkdirSync(LAB_DATA_ROOT, { recursive: true });

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function saveLabs(user_id, data) {
  const file = path.join(LAB_DATA_ROOT, user_id + ".json");
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

export async function getLabs(user_id) {
  const file = path.join(LAB_DATA_ROOT, user_id + ".json");
  if (!fs.existsSync(file)) return null;
  return loadJSON(file);
}

export async function getLabIndices(user_id) {
  const weights = loadJSON(path.join(MODEL_ROOT, "weights.json"));
  const panels = loadPanels();
  const labs = (await getLabs(user_id)) || {};

  function scoreMarker(value, optimal) {
    if (value == null || !optimal) return 50;
    const [min, max] = optimal;
    if (value >= min && value <= max) return 90;
    const dist = value < min ? min - value : value - max;
    const penalty = Math.min(dist * 10, 60);
    return 90 - penalty;
  }

  function calcIndex(groupName, markersWeights) {
    let sum = 0;
    let wsum = 0;
    for (const [marker, w] of Object.entries(markersWeights)) {
      const panel = findPanelByMarker(marker, panels);
      if (!panel) continue;
      const optimal = panel.markers[marker].optimal;
      const value = labs[marker];
      const s = scoreMarker(value, optimal);
      sum += s * w;
      wsum += w;
    }
    if (!wsum) return 50;
    return Math.round(sum / wsum);
  }

  return {
    metabolic: calcIndex("metabolic", weights.metabolic),
    liver: calcIndex("liver", weights.liver),
    kidney: calcIndex("kidney", weights.kidney),
    inflammation: calcIndex("inflammation", weights.inflammation),
    hormonal: calcIndex("hormonal", weights.hormonal)
  };
}

function loadPanels() {
  const files = fs.readdirSync(PANELS_ROOT).filter(f => f.endsWith(".json"));
  const result = {};
  for (const f of files) {
    const full = path.join(PANELS_ROOT, f);
    const data = loadJSON(full);
    result[data.id] = data;
  }
  return result;
}

function findPanelByMarker(marker, panels) {
  for (const p of Object.values(panels)) {
    if (p.markers[marker]) return p;
  }
  return null;
}
