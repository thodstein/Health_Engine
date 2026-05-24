import express from "express";
import { calculateRisks } from "../engines/risk_engine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  const result = await calculateRisks(user_id);
  res.json(result);
});

export default router;
