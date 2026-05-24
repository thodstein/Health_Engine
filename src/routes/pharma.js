import express from "express";
import { listCompounds, getCompound, calcInjection } from "../engines/pharma_engine.js";

const router = express.Router();

// GET /pharma/list
router.get("/list", async (req, res) => {
  res.json(await listCompounds());
});

// GET /pharma/compound?id=test_e
router.get("/compound", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "id is required" });
  const c = await getCompound(id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});

// POST /pharma/calc
// { compound_id, weekly_dose_mg, injections_per_week, syringe_volume_ml, syringe_units }
router.post("/calc", async (req, res) => {
  try {
    const result = await calcInjection(req.body);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
