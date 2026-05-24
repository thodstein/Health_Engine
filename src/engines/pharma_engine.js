import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "pharma", "compounds");

function loadAll() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const full = path.join(ROOT, f);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    return data;
  });
}

export async function listCompounds() {
  return loadAll().map(c => ({
    id: c.id,
    name: c.name,
    group: c.group,
    ester: c.ester,
    route: c.route
  }));
}

export async function getCompound(id) {
  const file = path.join(ROOT, id + ".json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// calcInjection:
// - compound_id: string
// - weekly_dose_mg: number
// - injections_per_week: number
// - syringe_volume_ml: number (например 1 мл)
// - syringe_units: number (например 100 делений)
export async function calcInjection(payload) {
  const { compound_id, weekly_dose_mg, injections_per_week, syringe_volume_ml, syringe_units } = payload;

  if (!compound_id) throw new Error("compound_id required");
  if (!weekly_dose_mg || !injections_per_week) throw new Error("weekly_dose_mg and injections_per_week required");

  const compound = await getCompound(compound_id);
  if (!compound) throw new Error("compound not found");
  if (!compound.concentration_mg_ml) throw new Error("compound has no concentration_mg_ml");

  const dose_per_injection_mg = weekly_dose_mg / injections_per_week;
  const ml_per_injection = dose_per_injection_mg / compound.concentration_mg_ml;

  const unit_per_ml = syringe_units / syringe_volume_ml;
  const units_per_injection = ml_per_injection * unit_per_ml;

  return {
    compound: {
      id: compound.id,
      name: compound.name,
      concentration_mg_ml: compound.concentration_mg_ml
    },
    weekly_dose_mg,
    injections_per_week,
    dose_per_injection_mg,
    ml_per_injection,
    units_per_injection
  };
}
