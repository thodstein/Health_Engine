import fs from "fs";
import path from "path";

const SUPPORT_ROOT = path.join(process.cwd(), "support", "levels");

export async function getSupportLevel(user_id) {
  const file = path.join(SUPPORT_ROOT, "base.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export async function setSupportLevel(user_id, level) {
  const file = path.join(SUPPORT_ROOT, level + ".json");
  if (!fs.existsSync(file)) return { error: "invalid level" };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
