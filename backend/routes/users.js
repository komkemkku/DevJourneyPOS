// backend/routes/users.js
const express = require("express");
const db = require("../db");
const jwtUtil = require("../jwt");
const bcrypt = require("bcryptjs");
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

// GET /api/users
router.get("/", authGuard, async (req, res) => {
  const users = await db.query(
    "SELECT id, username, name, role, is_active, created_at FROM users ORDER BY id"
  );
  res.json({ users: users.rows });
});

// POST /api/users
router.post("/", authGuard, async (req, res) => {
  const { username, password, name, role, is_active } = req.body;
  if (!username || !password || !name || !role)
    return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
  // Check duplicate
  const exist = await db.query("SELECT id FROM users WHERE username=$1", [
    username,
  ]);
  if (exist.rows.length > 0)
    return res.status(400).json({ message: "username ซ้ำ" });
  const hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (username, password_hash, name, role, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, username, name, role, is_active, created_at`,
    [username, hash, name, role, is_active ?? true]
  );
  res.json(result.rows[0]);
});

// PUT /api/users/:id
router.put("/:id", authGuard, async (req, res) => {
  const { name, role, is_active, password } = req.body;
  const { id } = req.params;
  let query = `UPDATE users SET name=$1, role=$2, is_active=$3`;
  let params = [name, role, is_active, id];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    query = `UPDATE users SET name=$1, role=$2, is_active=$3, password_hash=$4 WHERE id=$5 RETURNING id, username, name, role, is_active, created_at`;
    params = [name, role, is_active, hash, id];
  } else {
    query = `UPDATE users SET name=$1, role=$2, is_active=$3 WHERE id=$4 RETURNING id, username, name, role, is_active, created_at`;
    params = [name, role, is_active, id];
  }
  const result = await db.query(query, params);
  if (result.rows.length === 0)
    return res.status(404).json({ message: "ไม่พบผู้ใช้" });
  res.json(result.rows[0]);
});

// DELETE /api/users/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM users WHERE id=$1", [id]);
  res.json({ message: "ลบแล้ว" });
});

module.exports = router;
