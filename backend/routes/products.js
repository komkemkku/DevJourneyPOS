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

// GET /api/products (รองรับ search และ category_id)
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
  if (category_id && category_id !== "all") {
    where.push(`p.category_id = $${idx}`);
    params.push(category_id);
    idx++;
  }
  const whereStr = where.length ? "WHERE " + where.join(" AND ") : "";

  // นับจำนวนทั้งหมด
  const countQ = `SELECT COUNT(*) FROM products p ${whereStr}`;
  const countRes = await db.query(countQ, params);
  const total = parseInt(countRes.rows[0].count);

  // ดึงข้อมูลตามหน้า + JOIN product_categories
  const offset = (page - 1) * pageSize;
  const q = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.id
    ${whereStr}
    ORDER BY p.id DESC
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

// GET /api/products/barcode/:barcode
router.get("/barcode/:barcode", authGuard, async (req, res) => {
  const { barcode } = req.params;
  const excludeId = req.query.exclude;
  try {
    let result;
    if (excludeId) {
      result = await db.query(
        "SELECT id FROM products WHERE barcode = $1 AND id != $2",
        [barcode, excludeId]
      );
    } else {
      result = await db.query("SELECT id FROM products WHERE barcode = $1", [
        barcode,
      ]);
    }
    res.json({ duplicate: result.rows.length > 0 });
  } catch {
    res.status(500).json({ message: "เช็คบาร์โค้ดล้มเหลว" });
  }
});

// POST /api/products
router.post("/", authGuard, async (req, res) => {
  const {
    barcode,
    name,
    category_id,
    unit,
    cost_price,
    sell_price,
    stock_qty,
    image_url,
    is_active,
  } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO products
        (barcode, name, category_id, unit, cost_price, sell_price, stock_qty, image_url, is_active, created_at, updated_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        barcode || null,
        name,
        category_id || null,
        unit,
        cost_price,
        sell_price,
        stock_qty,
        image_url,
        is_active,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "บาร์โค้ดนี้มีในระบบแล้ว" });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/products/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const {
    barcode,
    name,
    category_id,
    unit,
    cost_price,
    sell_price,
    stock_qty,
    image_url,
    is_active,
  } = req.body;
  try {
    const result = await db.query(
      `UPDATE products SET
        barcode = $1,
        name = $2,
        category_id = $3,
        unit = $4,
        cost_price = $5,
        sell_price = $6,
        stock_qty = $7,
        image_url = $8,
        is_active = $9,
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        barcode || null,
        name,
        category_id || null,
        unit,
        cost_price,
        sell_price,
        stock_qty,
        image_url,
        is_active,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "บาร์โค้ดนี้มีในระบบแล้ว" });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "ลบสินค้าแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;
