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

// --- สร้างบิลขายใหม่ (ลด stock, ใส่โปรโมชัน, log stock) ---
router.post("/", authGuard, async (req, res) => {
  const {
    customer_id,
    payment_method,
    received_amount,
    change_amount,
    total_amount,
    remark,
    items, // [{ product_id, qty, unit_price, remark }]
    promotion_id,
    discount_amount, // number
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "ต้องมีสินค้าอย่างน้อย 1 รายการ" });

  const user_id = req.user.id;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const nowTs = Math.floor(Date.now() / 1000);
    const receiptNo = "R" + nowTs;

    // Insert sales
    const saleResult = await client.query(
      `INSERT INTO sales
        (receipt_no, sale_datetime, user_id, customer_id, total_amount, payment_method, received_amount, change_amount, remark, discount_id, discount_amount, created_at)
       VALUES
        ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
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
        promotion_id || null,
        discount_amount || 0,
      ]
    );
    const sale = saleResult.rows[0];
    const sale_id = sale.id;

    // Insert sale_items + ลด stock + log
    for (const item of items) {
      // Get cost price
      const prod = await client.query(
        `SELECT cost_price FROM products WHERE id=$1`,
        [item.product_id]
      );
      const cost_price = prod.rows[0]?.cost_price || 0;
      const total_price = item.qty * item.unit_price;
      await client.query(
        `INSERT INTO sale_items
          (sale_id, product_id, quantity, unit_price, cost_price, total_price, remark)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sale_id,
          item.product_id,
          item.qty,
          item.unit_price,
          cost_price,
          total_price,
          item.remark || null,
        ]
      );
      // อัปเดต stock (ใน products)
      await client.query(
        `UPDATE products SET stock_qty = stock_qty - $1 WHERE id=$2`,
        [item.qty, item.product_id]
      );
      // log การเคลื่อนไหว stock
      await client.query(
        `INSERT INTO stock_movements
          (product_id, change_type, quantity, user_id, ref_id, note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [item.product_id, "sell", -item.qty, user_id, sale_id, "ขายสินค้า"]
      );
    }

    // ถ้ามีโปรโมชัน
    if (promotion_id) {
      const promo = await client.query(
        `SELECT name FROM promotions WHERE id=$1`,
        [promotion_id]
      );
      await client.query(
        `INSERT INTO sale_promotions (sale_id, promotion_id, promotion_name, amount)
         VALUES ($1, $2, $3, $4)`,
        [sale_id, promotion_id, promo.rows[0]?.name || "", discount_amount || 0]
      );
    }

    await client.query("COMMIT");
    res.json({
      ...sale,
      sale_id,
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
    // 2. รายการสินค้า
    const items = await db.query(
      `SELECT si.*, p.name AS product_name, p.barcode
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [sale_id]
    );
    // 3. Settings ร้านค้า (ดึง row เดียว)
    const settings = await db.query(`SELECT * FROM settings LIMIT 1`);
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
