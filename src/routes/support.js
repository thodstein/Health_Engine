import express from "express";
import { getSupportLevel, setSupportLevel } from "../engines/support_engine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  res.json(await getSupportLevel(user_id));
});

router.post("/", async (req, res) => {
  const { user_id, level } = req.body;
  res.json(await setSupportLevel(user_id, level));
});

export default router;
