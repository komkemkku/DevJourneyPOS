const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");

const router = express.Router();

// Middleware: Auth Guard
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

// GET /api/products
router.get("/", authGuard, async (req, res) => {
  try {
    // join กับ category_name ตัวอย่าง (กรณีมีหมวดหมู่)
    const result = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json({ products: result.rows });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/products
router.post("/", authGuard, async (req, res) => {
  const { name, category, sell_price, stock_qty, is_active } = req.body;
  try {
    // หา category_id (ถ้าเป็นชื่อให้ query ก่อน, ตัวอย่างนี้ assume มี category_id แล้ว)
    let category_id = null;
    if (category) {
      const cat = await db.query(
        "SELECT id FROM product_categories WHERE name = $1",
        [category]
      );
      if (cat.rows.length > 0) category_id = cat.rows[0].id;
    }
    const result = await db.query(
      `INSERT INTO products (name, category_id, sell_price, stock_qty, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, category_id, sell_price, stock_qty, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/products/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const { name, category, sell_price, stock_qty, is_active } = req.body;
  try {
    let category_id = null;
    if (category) {
      const cat = await db.query(
        "SELECT id FROM product_categories WHERE name = $1",
        [category]
      );
      if (cat.rows.length > 0) category_id = cat.rows[0].id;
    }
    const result = await db.query(
      `UPDATE products SET name=$1, category_id=$2, sell_price=$3, stock_qty=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, category_id, sell_price, stock_qty, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
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
