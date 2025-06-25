const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");
const router = express.Router();

function authGuard(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwtUtil.verify(token);
    next();
  } catch {
    return res.status(403).json({ message: "Forbidden" });
  }
}

// GET: ดึง settings ทั้งหมด
router.get("/", authGuard, async (req, res) => {
  const result = await db.query("SELECT * FROM settings");
  // คืนค่าเป็น object {key: value, ...}
  const settings = {};
  result.rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  res.json({ settings });
});

// PUT: อัปเดตค่าทั้งหมด (แบบยกเซ็ต)
router.put("/", authGuard, async (req, res) => {
  const settings = req.body.settings || {};
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const key in settings) {
      // upsert (update ถ้ามี, insert ถ้าไม่มี)
      await client.query(
        `
        INSERT INTO settings (key, value) VALUES ($1, $2)
        ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value
      `,
        [key, settings[key]]
      );
    }
    await client.query("COMMIT");
    res.json({ message: "บันทึกสำเร็จ" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
