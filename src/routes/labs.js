import express from "express";
import { saveLabs, getLabs, getLabIndices } from "../engines/labs_engine.js";

const router = express.Router();

// POST /labs  — сохранить сырые значения
router.post("/", async (req, res) => {
  const { user_id, data } = req.body;
  if (!user_id || !data) return res.status(400).json({ error: "user_id and data required" });
  await saveLabs(user_id, data);
  res.json({ status: "ok" });
});

// GET /labs?user_id=1 — получить сырые значения
router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  const labs = await getLabs(user_id);
  res.json(labs || {});
});

// GET /labs/indices?user_id=1 — индексы систем
router.get("/indices", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  const indices = await getLabIndices(user_id);
  res.json(indices);
});

export default router;
