import express from "express";
import { buildReport } from "../engines/reports_engine.js";

const router = express.Router();

// GET /reports/summary?user_id=1
router.get("/summary", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  const report = await buildReport(user_id);
  res.json(report);
});

export default router;
