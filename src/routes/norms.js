import express from "express";
import { listNormPanels, getNormPanel } from "../engines/norms_engine.js";

const router = express.Router();

// GET /norms/panels
router.get("/panels", async (req, res) => {
  res.json(await listNormPanels());
});

// GET /norms/panel?id=lipids
router.get("/panel", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "id required" });
  const panel = await getNormPanel(id);
  if (!panel) return res.status(404).json({ error: "not found" });
  res.json(panel);
});

export default router;
