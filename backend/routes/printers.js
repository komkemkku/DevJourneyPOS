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

// GET /api/printers
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM printers ORDER BY id DESC");
    res.json({ printers: result.rows });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/printers
router.post("/", authGuard, async (req, res) => {
  const { name, type, connection, is_active } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO printers (name, type, connection, is_active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, type, connection, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/printers/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const { name, type, connection, is_active } = req.body;
  try {
    const result = await db.query(
      `UPDATE printers SET name=$1, type=$2, connection=$3, is_active=$4 WHERE id=$5 RETURNING *`,
      [name, type, connection, is_active, id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "ไม่พบเครื่องพิมพ์" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// DELETE /api/printers/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM printers WHERE id=$1", [id]);
    res.json({ message: "ลบเครื่องพิมพ์แล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;
