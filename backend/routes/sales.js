const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");
const router = express.Router();

// Auth Middleware
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

// --- สร้างบิลขายใหม่ (และลด stock อัตโนมัติ) ---
router.post("/", authGuard, async (req, res) => {
  const {
    customer_id,
    payment_method,
    received_amount,
    change_amount,
    total_amount,
    remark,
    sale_items, // array [{ product_id, quantity, unit_price, cost_price, total_price }]
  } = req.body;

  const user_id = req.user.id;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const nowTs = Math.floor(Date.now() / 1000);
    const receiptNo = "R" + nowTs;

    // Insert sales
    const saleResult = await client.query(
      `INSERT INTO sales
        (receipt_no, sale_datetime, user_id, customer_id, total_amount, payment_method, received_amount, change_amount, remark)
       VALUES
        ($1, NOW(), $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        receiptNo,
        user_id,
        customer_id || null,
        total_amount,
        payment_method,
        received_amount,
        change_amount,
        remark || null,
      ]
    );
    const sale = saleResult.rows[0];
    const sale_id = sale.id;

    // Insert sale_items
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
      // อัปเดต stock
      await client.query(
        `UPDATE products SET stock_qty = stock_qty - $1 WHERE id=$2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");
    res.json({
      ...sale,
      id: sale.id,
      sale_id: sale.id,
      message: "ขายสินค้าสำเร็จ",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "ผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

// --- ดูสินค้าในบิลเดียว + ใบเสร็จ + settings ---
router.get("/:sale_id/receipt", authGuard, async (req, res) => {
  const { sale_id } = req.params;
  try {
    // 1. รายละเอียดบิล
    const sale = await db.query(
      `SELECT s.*, c.name AS customer_name, c.phone, u.name AS user_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1`,
      [sale_id]
    );
    if (sale.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบใบเสร็จ" });
    }
    // 2. รายการสินค้า (!!! ไม่มี p.code เปลี่ยนเป็น p.barcode)
    const items = await db.query(
      `SELECT si.*, p.name AS product_name, p.barcode
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [sale_id]
    );
    // 3. Settings ร้านค้า (ดึงแค่ row เดียว)
    const settings = await db.query(
      `SELECT * FROM settings ORDER BY id LIMIT 1`
    );
    res.json({
      sale: sale.rows[0],
      items: items.rows,
      settings: settings.rows[0] || {},
    });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด", error: err.message });
  }
});

module.exports = router;
