import express from "express";
import { getSleepStress, saveSleepStress } from "../engines/sleep_engine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  res.json(await getSleepStress(user_id));
});

router.post("/", async (req, res) => {
  const { user_id, data } = req.body;
  if (!user_id || !data) return res.status(400).json({ error: "user_id and data required" });
  res.json(await saveSleepStress(user_id, data));
});

export default router;
