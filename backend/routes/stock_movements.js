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

// GET ประวัติ (รองรับ pagination)
router.get("/", authGuard, async (req, res) => {
  const { product_id } = req.query;
  let page = parseInt(req.query.page) || 1;
  let pageSize = parseInt(req.query.pageSize) || 10;
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;

  try {
    let where = "";
    let params = [];
    if (product_id) {
      where = "WHERE sm.product_id = $1";
      params = [product_id];
    }
    // นับจำนวนทั้งหมด
    const countQ = `SELECT COUNT(*) FROM stock_movements sm ${where}`;
    const countRes = await db.query(countQ, params);
    const total = parseInt(countRes.rows[0].count);

    // ดึงข้อมูลตามหน้า
    const offset = (page - 1) * pageSize;
    let q = `
      SELECT sm.*, u.name AS user_name, p.name AS product_name, p.barcode
      FROM stock_movements sm
      LEFT JOIN users u ON sm.user_id = u.id
      LEFT JOIN products p ON sm.product_id = p.id
      ${where}
      ORDER BY sm.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(pageSize, offset);
    const result = await db.query(q, params);

    res.json({
      movements: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

// ตัวอย่าง backend (Node.js/Express)
router.get("/", authGuard, async (req, res) => {
  let { page = 1, pageSize = 10, search = "", category_id = "" } = req.query;
  page = parseInt(page);
  pageSize = parseInt(pageSize);

  let where = [];
  let params = [];
  let idx = 1;

  if (search) {
    where.push(`(p.name ILIKE $${idx} OR p.barcode ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (category_id) {
    where.push(`p.category_id = $${idx}`);
    params.push(category_id);
    idx++;
  }
  const whereStr = where.length ? "WHERE " + where.join(" AND ") : "";

  // นับจำนวนทั้งหมด
  const countQ = `SELECT COUNT(*) FROM products p ${whereStr}`;
  const countRes = await db.query(countQ, params);
  const total = parseInt(countRes.rows[0].count);

  // ดึงข้อมูลตามหน้า
  const offset = (page - 1) * pageSize;
  const q = `
    SELECT * FROM products p
    ${whereStr}
    ORDER BY id DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  params.push(pageSize, offset);
  const result = await db.query(q, params);

  res.json({
    products: result.rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

module.exports = router;
