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
    redeem_point = 0, // รับค่าจากหน้าบ้าน
    redeem_discount = 0, // รับค่าจากหน้าบ้าน
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "ต้องมีสินค้าอย่างน้อย 1 รายการ" });

  const user_id = req.user.id;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const nowTs = Math.floor(Date.now() / 1000);
    const receiptNo = "R" + nowTs;

    // --- ป้องกัน foreign key error promotion_id ---
    let promoIdToUse = promotion_id || null;

    // Insert sales (เพิ่ม redeem_point, redeem_discount)
    const saleResult = await client.query(
      `INSERT INTO sales
        (receipt_no, sale_datetime, user_id, customer_id, total_amount, payment_method, received_amount, change_amount, remark, discount_id, discount_amount, redeem_point, redeem_discount, created_at)
       VALUES
        ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
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
        promoIdToUse,
        discount_amount || 0,
        redeem_point || 0,
        redeem_discount || 0,
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
    if (promoIdToUse) {
      const promo = await client.query(
        `SELECT name FROM promotions WHERE id=$1`,
        [promoIdToUse]
      );
      await client.query(
        `INSERT INTO sale_promotions (sale_id, promotion_id, promotion_name, amount)
         VALUES ($1, $2, $3, $4)`,
        [sale_id, promoIdToUse, promo.rows[0]?.name || "", discount_amount || 0]
      );
    }

    // --- เพิ่ม/ตัดพ้อยท์ให้ลูกค้า ---
    if (customer_id) {
      // ดึงค่า point_rate จาก settings (key-value)
      let pointRate = 50; // default fallback
      try {
        const settingsRes = await client.query(
          `SELECT value FROM settings WHERE key = 'point_rate' LIMIT 1`
        );
        if (settingsRes.rows.length > 0) {
          pointRate = parseInt(settingsRes.rows[0].value) || 50;
        }
      } catch (e) {
        pointRate = 50;
      }

      // 1. ตัดพ้อยท์ (ถ้ามีการใช้)
      if (redeem_point > 0) {
        // ดึงพ้อยท์ปัจจุบัน
        const custRes = await client.query(
          `SELECT point FROM customers WHERE id = $1`,
          [customer_id]
        );
        let currentPoint = custRes.rows[0]?.point || 0;
        let newPoint = Math.max(0, currentPoint - redeem_point);
        await client.query(
          `UPDATE customers SET point = $1 WHERE id = $2`,
          [newPoint, customer_id]
        );
        // log ลง point_transactions
        await client.query(
          `INSERT INTO point_transactions (customer_id, type, points, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [customer_id, "redeem", -redeem_point, `ใช้พ้อยท์แลกส่วนลด #${sale_id}`]
        );
      }

      // 2. เพิ่มพ้อยท์ที่ได้รับจากยอดขาย
      const earnPoints = Math.floor(total_amount / pointRate);
      if (earnPoints > 0) {
        await client.query(
          `UPDATE customers SET point = point + $1 WHERE id = $2`,
          [earnPoints, customer_id]
        );
        await client.query(
          `INSERT INTO point_transactions (customer_id, type, points, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [customer_id, "earn", earnPoints, `ได้รับจากการซื้อขาย #${sale_id}`]
        );
      }
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
    // 1. รายละเอียดบิล (เพิ่ม redeem_point, redeem_discount)
    const saleRes = await db.query(
      `SELECT s.*, c.name AS customer_name, c.phone, c.point AS point_total, u.name AS user_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1`,
      [sale_id]
    );
    if (saleRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบใบเสร็จ" });
    }
    const sale = saleRes.rows[0];

    // 2. รายการสินค้า
    const items = await db.query(
      `SELECT si.*, p.name AS product_name, p.barcode
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [sale_id]
    );

    // 3. Settings ร้านค้า (ดึงทั้งหมดแบบ key-value)
    const settingsRes = await db.query(`SELECT * FROM settings`);
    let settings = {};
    if (settingsRes.rows.length > 0) {
      settingsRes.rows.forEach((row) => {
        if (row.key && row.value !== undefined) {
          settings[row.key] = row.value;
        }
      });
    }

    // 4. ดึงชื่อโปรโมชัน (ถ้ามี)
    let promotion_name = null;
    if (sale.discount_id) {
      const promoRes = await db.query(
        `SELECT name FROM promotions WHERE id = $1`,
        [sale.discount_id]
      );
      promotion_name = promoRes.rows[0]?.name || null;
    }

    // 5. คำนวณพ้อยท์ที่ได้รับ (ตาม point_rate)
    let earn_point = 0;
    let pointRate = 50;
    if (settings.point_rate) {
      pointRate = parseInt(settings.point_rate) || 50;
    }
    earn_point = Math.floor(Number(sale.total_amount) / pointRate);

    res.json({
      sale: {
        ...sale,
        promotion_name: promotion_name,
        point: earn_point,
        point_total: sale.point_total || 0,
        redeem_point: sale.redeem_point || 0,
        redeem_discount: sale.redeem_discount || 0
      },
      items: items.rows,
      settings: settings,
    });
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด", error: err.message });
  }
});

// --- ดึงประวัติการขายทั้งหมด (สำหรับตารางหน้า sales.html) ---
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          s.id, 
          s.sale_datetime, 
          s.receipt_no, 
          s.total_amount, 
          s.customer_id,
          c.name AS customer_name, 
          u.name AS user_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.sale_datetime DESC
        LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "ผิดพลาด", error: err.message });
  }
});

module.exports = router;
