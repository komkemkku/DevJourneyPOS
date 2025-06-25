const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");
const router = express.Router();

// Auth middleware
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

// POST เพิ่ม/ปรับ/ถอน
router.post("/", authGuard, async (req, res) => {
  const { product_id, quantity, change_type, note } = req.body;
  const user_id = req.user.id;
  try {
    // อัปเดตสต็อคสินค้า
    await db.query(
      "UPDATE products SET stock_qty = stock_qty + $1 WHERE id=$2",
      [quantity, product_id]
    );
    // บันทึกลง stock_movements
    await db.query(
      `INSERT INTO stock_movements (product_id, change_type, quantity, user_id, note, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())`,
      [product_id, change_type, quantity, user_id, note]
    );
    res.json({ message: "OK" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

// GET ประวัติ
router.get("/", authGuard, async (req, res) => {
  const { product_id } = req.query;
  try {
    const q = `
      SELECT sm.*, u.name AS user_name
      FROM stock_movements sm
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE ($1::int IS NULL OR sm.product_id = $1)
      ORDER BY sm.created_at DESC LIMIT 100
    `;
    const result = await db.query(q, [product_id || null]);
    res.json({ movements: result.rows });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;
