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

// GET /api/promotions
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM promotions ORDER BY id DESC");
    res.json({ promotions: result.rows });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/promotions
router.post("/", authGuard, async (req, res) => {
  const { name, detail, start_date, end_date, is_active } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO promotions (name, detail, start_date, end_date, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [name, detail, start_date, end_date, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/promotions/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const { name, detail, start_date, end_date, is_active } = req.body;
  try {
    const result = await db.query(
      `UPDATE promotions SET
        name = $1,
        detail = $2,
        start_date = $3,
        end_date = $4,
        is_active = $5,
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, detail, start_date, end_date, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// DELETE /api/promotions/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM promotions WHERE id=$1", [id]);
    res.json({ message: "ลบโปรโมชั่นแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;
