import fs from "fs";
import path from "path";

const MODEL_ROOT = path.join(process.cwd(), "sleep", "model");
const DATA_ROOT = path.join(process.cwd(), "sleep", "data");

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function safeLoadJSON(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function getSleepStress(user_id) {
  const sleepModel = loadJSON(path.join(MODEL_ROOT, "sleep.json"));
  const stressModel = loadJSON(path.join(MODEL_ROOT, "stress.json"));

  const userFile = path.join(DATA_ROOT, user_id + ".json");
  const userData = safeLoadJSON(userFile) || {
    duration_hours: 6,
    deep_pct: 12,
    rem_pct: 18,
    light_pct: 70,
    stress_score: 55,
    caffeine_mg: 200,
    workload: 6,
    emotional: 5
  };

  const sleepScore = calcSleepScore(userData, sleepModel);
  const stressScore = calcStressScore(userData, stressModel);

  return {
    user: userData,
    sleep_score: sleepScore,
    stress_score: stressScore,
    recommendations: {
      sleep: sleepRecommendations(userData, sleepModel),
      stress: stressRecommendations(stressScore, stressModel)
    }
  };
}

export async function saveSleepStress(user_id, payload) {
  const file = path.join(DATA_ROOT, user_id + ".json");
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return { status: "ok" };
}

function calcSleepScore(u, m) {
  let score = 100;

  if (u.duration_hours < m.duration.optimal_hours[0]) score -= 20;
  if (u.deep_pct < m.stages.deep.optimal_pct[0]) score -= 20;
  if (u.rem_pct < m.stages.rem.optimal_pct[0]) score -= 15;

  return Math.max(0, score);
}

function calcStressScore(u, m) {
  let score = 0;
  score += (100 - u.duration_hours * 10) * m.factors.sleep;
  score += u.workload * 10 * m.factors.workload;
  score += (u.caffeine_mg / 10) * m.factors.caffeine;
  score += u.emotional * 10 * m.factors.emotional;
  return Math.min(100, Math.round(score));
}

function sleepRecommendations(u, m) {
  const rec = [];
  if (u.duration_hours < m.duration.optimal_hours[0]) rec.push(m.recommendations.low_duration);
  if (u.deep_pct < m.stages.deep.optimal_pct[0]) rec.push(m.recommendations.low_deep);
  if (u.rem_pct < m.stages.rem.optimal_pct[0]) rec.push(m.recommendations.low_rem);
  return rec;
}

function stressRecommendations(score, m) {
  if (score >= m.scale.high[0]) return m.recommendations.high;
  if (score >= m.scale.medium[0]) return m.recommendations.medium;
  return m.recommendations.low;
}
