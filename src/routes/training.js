import express from "express";
import { listPresets, getPreset } from "../engines/training_engine.js";

const router = express.Router();

// GET /training/presets
router.get("/presets", async (req, res) => {
  res.json(await listPresets());
});

// GET /training/preset?id=recomp_base
router.get("/preset", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "id is required" });
  const preset = await getPreset(id);
  if (!preset) return res.status(404).json({ error: "not found" });
  res.json(preset);
});

export default router;
