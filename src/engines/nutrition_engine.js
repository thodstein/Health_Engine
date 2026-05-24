import fs from "fs";
import path from "path";

const NUTR_MODEL_ROOT = path.join(process.cwd(), "nutrition", "model");
const NUTR_DATA_ROOT = path.join(process.cwd(), "nutrition", "data");
const LAB_DATA_ROOT = path.join(process.cwd(), "labs", "data");

if (!fs.existsSync(NUTR_DATA_ROOT)) fs.mkdirSync(NUTR_DATA_ROOT, { recursive: true });

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function safeLoadJSON(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function getNutritionConfig(user_id) {
  const goals = loadJSON(path.join(NUTR_MODEL_ROOT, "goals.json"));
  const userFile = path.join(NUTR_DATA_ROOT, user_id + ".json");
  const userData = safeLoadJSON(userFile) || {
    goal: "recomp",
    weight_kg: 80,
    height_cm: 180,
    age: 30,
    sex: "m",
    activity: "moderate"
  };

  const plan = calcPlan(userData, goals);
  const deficits = detectDeficits(user_id);

  return {
    user: userData,
    goals: goals.goals,
    current_goal: userData.goal,
    plan,
    deficits
  };
}

export async function saveNutritionConfig(user_id, payload) {
  const file = path.join(NUTR_DATA_ROOT, user_id + ".json");
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return { status: "ok" };
}

function calcPlan(user, goalsModel) {
  const { weight_kg, height_cm, age, sex, goal } = user;
  const activity = user.activity || "moderate";

  const s = sex === "f" ? -161 : 5;
  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + s;

  const activityFactor =
    activity === "low" ? 1.2 :
    activity === "high" ? 1.6 :
    1.4;

  const maintenance = Math.round(bmr * activityFactor);

  const goalCfg = goalsModel.goals[goal] || goalsModel.goals.recomp;
  let targetCalories = maintenance;

  if (goalCfg.deficit_pct) {
    targetCalories = Math.round(maintenance * (1 - goalCfg.deficit_pct));
  } else if (goalCfg.surplus_pct) {
    targetCalories = Math.round(maintenance * (1 + goalCfg.surplus_pct));
  }

  const macroTpl = goalsModel.macros_templates[goal] || goalsModel.macros_templates.recomp;

  const protein = Math.round(macroTpl.protein_g_kg * weight_kg);
  const fatCalories = Math.round(targetCalories * macroTpl.fat_pct);
  const fat = Math.round(fatCalories / 9);
  const carbsCalories = targetCalories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbsCalories / 4));

  return {
    maintenance,
    targetCalories,
    protein,
    fat,
    carbs
  };
}

function detectDeficits(user_id) {
  const deficitsModel = loadJSON(path.join(NUTR_MODEL_ROOT, "deficits.json"));
  const labsFile = path.join(LAB_DATA_ROOT, user_id + ".json");
  const labs = safeLoadJSON(labsFile) || {};

  const result = [];

  for (const [key, d] of Object.entries(deficitsModel)) {
    const val = labs[d.marker];
    if (val == null) continue;
    if (val < d.low_threshold) {
      result.push({
        id: key,
        label: d.label,
        marker: d.marker,
        value: val,
        threshold: d.low_threshold,
        effect: d.effect,
        recommendation: d.recommendation
      });
    }
  }

  return result;
}
