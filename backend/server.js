require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Router (login)
const authRouter = require("./routes/auth");
app.use("/api", authRouter);

// ตัวอย่าง protected route (ต้องใช้ token)
const jwtUtil = require("./jwt");
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const user = jwtUtil.verify(token);
    res.json({ user });
  } catch (err) {
    res.sendStatus(403);
  }
});

// Default: SPA (frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
