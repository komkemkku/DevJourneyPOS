const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db");
const jwtUtil = require("../../jwt");

const router = express.Router();

// POST /api/login
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = TRUE",
      [username]
    );
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    // สร้าง JWT
    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
    const token = jwtUtil.sign(payload);
    res.json({ token, name: user.name, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

module.exports = router;
