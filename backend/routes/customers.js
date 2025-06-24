const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");

const router = express.Router();

// Auth Guard
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

// --- CRUD ลูกค้า ---
// GET /api/customers
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json({ customers: result.rows });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/customers
router.post("/", authGuard, async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO customers (name, phone, email, point, created_at)
       VALUES ($1, $2, $3, 0, NOW()) RETURNING *`,
      [name, phone, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เพิ่มลูกค้าไม่สำเร็จ" });
  }
});

// PUT /api/customers/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, point } = req.body;
  try {
    const result = await db.query(
      `UPDATE customers SET name=$1, phone=$2, email=$3, point=$4 WHERE id=$5 RETURNING *`,
      [name, phone, email, point ?? 0, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "ไม่พบลูกค้า" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "แก้ไขลูกค้าไม่สำเร็จ" });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM customers WHERE id=$1", [id]);
    res.json({ message: "ลบลูกค้าแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "ลบลูกค้าไม่สำเร็จ" });
  }
});

// --- แต้มสะสม/แลกแต้ม ---
// POST /api/customers/earn
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
    // อัปเดตแต้มลูกค้ากลับ
    const updated = await db.query("SELECT * FROM customers WHERE id = $1", [
      customer_id,
    ]);
    res.json({ message: "เพิ่มแต้มสำเร็จ", customer: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

// POST /api/customers/redeem
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
    // อัปเดตแต้มลูกค้ากลับ
    const updated = await db.query("SELECT * FROM customers WHERE id = $1", [
      customer_id,
    ]);
    res.json({ message: "ใช้แต้มสำเร็จ", customer: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

// GET /api/customers/history/:customer_id
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
