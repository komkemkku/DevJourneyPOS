const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");

const router = express.Router();

// Auth guard
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

// routes/categories.js
router.get("/", authGuard, async (req, res) => {
  // กรณีรับ query ?activeOnly=true
  if (req.query.activeOnly === "true") {
    const result = await db.query(
      "SELECT id, name FROM product_categories WHERE is_active = TRUE ORDER BY name"
    );
    return res.json({ categories: result.rows });
  }
  // default: ทุกสถานะ (ใช้ในหน้าจัดการหมวดหมู่)
  const result = await db.query(
    "SELECT * FROM product_categories ORDER BY id DESC"
  );
  res.json({ categories: result.rows });
});

// POST /api/categories
router.post("/", authGuard, async (req, res) => {
  let { name, is_active } = req.body;
  is_active = is_active !== undefined ? is_active : true;
  try {
    // ตรวจสอบชื่อซ้ำ
    const dup = await db.query(
      "SELECT id FROM product_categories WHERE name = $1",
      [name]
    );
    if (dup.rows.length > 0) {
      return res.status(400).json({ message: "ชื่อหมวดหมู่นี้มีในระบบแล้ว" });
    }
    const result = await db.query(
      "INSERT INTO product_categories (name, is_active) VALUES ($1, $2) RETURNING *",
      [name, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/categories/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  let { name, is_active } = req.body;
  is_active = is_active !== undefined ? is_active : true;
  try {
    // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
    const dup = await db.query(
      "SELECT id FROM product_categories WHERE name = $1 AND id <> $2",
      [name, id]
    );
    if (dup.rows.length > 0) {
      return res.status(400).json({ message: "ชื่อหมวดหมู่นี้มีในระบบแล้ว" });
    }
    const result = await db.query(
      "UPDATE product_categories SET name=$1, is_active=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [name, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    // เช็คว่าหมวดหมู่ยังถูกใช้อยู่ใน products ไหม
    const prod = await db.query(
      "SELECT 1 FROM products WHERE category_id = $1 LIMIT 1",
      [id]
    );
    if (prod.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้" });
    }
    await db.query("DELETE FROM product_categories WHERE id=$1", [id]);
    res.json({ message: "ลบหมวดหมู่แล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;
