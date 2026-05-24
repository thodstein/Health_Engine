import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "training", "presets");

export async function listPresets() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const full = path.join(ROOT, f);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    return {
      id: data.id,
      name: data.name,
      phase: data.phase,
      weeks: data.weeks,
      freq_per_week: data.freq_per_week
    };
  });
}

export async function getPreset(id) {
  const file = path.join(ROOT, id + ".json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
