import fs from "fs";
import path from "path";

const NORM_ROOT = path.join(process.cwd(), "norms", "model");

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function listNormPanels() {
  const files = fs.readdirSync(NORM_ROOT).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const full = path.join(NORM_ROOT, f);
    const data = loadJSON(full);
    return {
      id: f.replace(".json", ""),
      panel: data.panel,
      markers: Object.keys(data.markers).length
    };
  });
}

export async function getNormPanel(id) {
  const file = path.join(NORM_ROOT, id + ".json");
  if (!fs.existsSync(file)) return null;
  return loadJSON(file);
}
