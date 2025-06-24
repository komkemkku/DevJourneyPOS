const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");
const router = express.Router();

// Auth
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

// สร้างการขาย (พร้อมสินค้า)
router.post("/", authGuard, async (req, res) => {
  const {
    customer_id,
    user_id,
    payment_method,
    received_amount,
    change_amount,
    total_amount,
    sale_items, // array: [{ product_id, quantity, unit_price, cost_price, total_price }]
    remark,
  } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // 1. Insert sales
    const saleResult = await client.query(
      `INSERT INTO sales
        (receipt_no, sale_datetime, user_id, customer_id, total_amount, payment_method, received_amount, change_amount, remark)
       VALUES
        (concat('R', extract(epoch from now())::int), NOW(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user_id,
        customer_id,
        total_amount,
        payment_method,
        received_amount,
        change_amount,
        remark,
      ]
    );
    const sale_id = saleResult.rows[0].id;

    // 2. Insert sale_items
    for (const item of sale_items) {
      await client.query(
        `INSERT INTO sale_items
          (sale_id, product_id, quantity, unit_price, cost_price, total_price, remark)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sale_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.cost_price,
          item.total_price,
          item.remark || null,
        ]
      );
      // 3. อัปเดต stock ที่ product (ลดสต็อก)
      await client.query(
        `UPDATE products SET stock_qty = stock_qty - $1 WHERE id=$2`,
        [item.quantity, item.product_id]
      );
    }
    await client.query("COMMIT");
    res.json({ sale_id, message: "ขายสินค้าสำเร็จ" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "ผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

// ประวัติการขาย (ทุกบิล)
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, c.name AS customer_name, u.name AS user_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.sale_datetime DESC`
    );
    res.json({ sales: result.rows });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

// ดูสินค้าในบิล
router.get("/:sale_id/items", authGuard, async (req, res) => {
  const { sale_id } = req.params;
  try {
    const result = await db.query(
      `SELECT si.*, p.name AS product_name
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [sale_id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
});

module.exports = router;
