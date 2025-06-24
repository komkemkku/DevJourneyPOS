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

// เพิ่มแต้ม (หลังขายสำเร็จ)
router.post("/earn", authGuard, async (req, res) => {
  const { customer_id, points, description } = req.body;
  try {
    await db.query("UPDATE customers SET point = point + $1 WHERE id = $2", [
      points,
      customer_id,
    ]);
    await db.query(
      `INSERT INTO point_transactions (customer_id, type, points, description)
             VALUES ($1, 'earn', $2, $3)`,
      [customer_id, points, description || "รับแต้ม"]
    );
    res.json({ message: "เพิ่มแต้มสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

// ใช้แต้มเป็นส่วนลด (redeem)
router.post("/redeem", authGuard, async (req, res) => {
  const { customer_id, points, description } = req.body;
  try {
    // ตรวจสอบแต้มคงเหลือ
    const c = await db.query("SELECT point FROM customers WHERE id=$1", [
      customer_id,
    ]);
    if (!c.rows.length || c.rows[0].point < points)
      return res.status(400).json({ message: "แต้มไม่พอ" });

    await db.query("UPDATE customers SET point = point - $1 WHERE id = $2", [
      points,
      customer_id,
    ]);
    await db.query(
      `INSERT INTO point_transactions (customer_id, type, points, description)
             VALUES ($1, 'redeem', -$2, $3)`,
      [customer_id, points, description || "แลกแต้ม"]
    );
    res.json({ message: "ใช้แต้มสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

// ดูประวัติการใช้แต้ม
router.get("/history/:customer_id", authGuard, async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await db.query(
      `SELECT * FROM point_transactions WHERE customer_id = $1 ORDER BY created_at DESC`,
      [customer_id]
    );
    res.json({ history: result.rows });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

module.exports = router;
