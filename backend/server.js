require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Login
const authRouter = require("./routes/auth/login");
app.use("/api/login", authRouter);

// Products CRUD
const productRouter = require("./routes/products");
app.use("/api/products", productRouter);

const categoriesRouter = require("./routes/categories");
app.use("/api/categories", categoriesRouter);

const pointsRouter = require("./routes/points");
app.use("/api/points", pointsRouter);

const customersRouter = require("./routes/customers");
app.use("/api/customers", customersRouter);

const promotionRouter = require("./routes/promotions");
app.use("/api/promotions", promotionRouter);

const salesRouter = require("./routes/sales");
app.use("/api/sales", salesRouter);

//  protected profile
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

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
