import express from "express";
import { buildDashboard } from "../engines/dashboard_engine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  res.json(await buildDashboard(user_id));
});

export default router;
