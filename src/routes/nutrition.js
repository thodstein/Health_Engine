import express from "express";
import { getNutritionConfig, saveNutritionConfig } from "../engines/nutrition_engine.js";

const router = express.Router();

// GET /nutrition?user_id=1 — получить текущую конфигурацию и план
router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  const cfg = await getNutritionConfig(user_id);
  res.json(cfg);
});

// POST /nutrition — сохранить конфиг (goal, weight, height, age, sex, activity)
router.post("/", async (req, res) => {
  const { user_id, config } = req.body;
  if (!user_id || !config) return res.status(400).json({ error: "user_id and config required" });
  const r = await saveNutritionConfig(user_id, config);
  res.json(r);
});

export default router;
