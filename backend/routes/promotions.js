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

async function getPromotionDetail(promo) {
  const items = await db.query(
    `SELECT * FROM promotion_items WHERE promotion_id=$1`,
    [promo.id]
  );
  const rewards = await db.query(
    `SELECT * FROM promotion_rewards WHERE promotion_id=$1`,
    [promo.id]
  );
  return { ...promo, items: items.rows, rewards: rewards.rows };
}

// GET /api/promotions
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM promotions ORDER BY id DESC");
    const promos = await Promise.all(result.rows.map(getPromotionDetail));
    res.json({ promotions: promos });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// GET /api/promotions/:id/detail
router.get("/:id/detail", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    const promo = await db.query("SELECT * FROM promotions WHERE id=$1", [id]);
    if (!promo.rows.length)
      return res.status(404).json({ message: "ไม่พบโปรโมชั่นนี้" });
    const full = await getPromotionDetail(promo.rows[0]);
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

// POST /api/promotions
router.post("/", authGuard, async (req, res) => {
  const { name, detail, start_date, end_date, is_active, items, rewards } =
    req.body;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const promoResult = await client.query(
      `INSERT INTO promotions (name, detail, start_date, end_date, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [name, detail, start_date || null, end_date || null, is_active]
    );
    const promo = promoResult.rows[0];
    if (Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO promotion_items (promotion_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [promo.id, item.product_id, item.quantity || 1]
        );
      }
    }
    if (Array.isArray(rewards)) {
      for (const rw of rewards) {
        await client.query(
          `INSERT INTO promotion_rewards (promotion_id, reward_type, amount, product_id, quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            promo.id,
            rw.reward_type,
            rw.amount,
            rw.product_id || null,
            rw.quantity || null,
          ]
        );
      }
    }
    await client.query("COMMIT");
    const fullPromo = await getPromotionDetail(promo);
    res.json(fullPromo);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/promotions/:id
router.put("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  let { name, detail, start_date, end_date, is_active, items, rewards } =
    req.body;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const promoResult = await client.query(
      `UPDATE promotions SET name=$1, detail=$2, start_date=$3, end_date=$4, is_active=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *`,
      [name, detail, start_date || null, end_date || null, is_active, id]
    );
    if (!promoResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "ไม่พบโปรโมชั่นนี้" });
    }
    await client.query(`DELETE FROM promotion_items WHERE promotion_id=$1`, [
      id,
    ]);
    if (Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO promotion_items (promotion_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [id, item.product_id, item.quantity || 1]
        );
      }
    }
    await client.query(`DELETE FROM promotion_rewards WHERE promotion_id=$1`, [
      id,
    ]);
    if (Array.isArray(rewards)) {
      for (const rw of rewards) {
        await client.query(
          `INSERT INTO promotion_rewards (promotion_id, reward_type, amount, product_id, quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id,
            rw.reward_type,
            rw.amount,
            rw.product_id || null,
            rw.quantity || null,
          ]
        );
      }
    }
    await client.query("COMMIT");
    const fullPromo = await getPromotionDetail(promoResult.rows[0]);
    res.json(fullPromo);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/promotions/:id
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM promotion_items WHERE promotion_id=$1", [
      id,
    ]);
    await client.query("DELETE FROM promotion_rewards WHERE promotion_id=$1", [
      id,
    ]);
    await client.query("DELETE FROM promotions WHERE id=$1", [id]);
    await client.query("COMMIT");
    res.json({ message: "ลบโปรโมชั่นแล้ว" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
