// js/main.js
document.addEventListener("DOMContentLoaded", function () {
  // --- Auth check ---
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  if (!token) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("userGreeting").innerText = `👤 ${
    name || "ผู้ใช้งาน"
  }`;
  document.getElementById("logoutBtn").onclick = function () {
    localStorage.clear();
    window.location.href = "index.html";
  };

  // --- Backoffice ---
  const backofficeBtn = document.getElementById("backBtn");
  if (role === "admin" || role === "manager") {
    backofficeBtn.style.display = "";
    backofficeBtn.onclick = function () {
      window.location.href = "backoffice.html";
    };
  } else {
    backofficeBtn.style.display = "none";
  }

  // --- Elements ---
  const productList = document.getElementById("productList");
  const productLoading = document.getElementById("productLoading");
  const productNotFound = document.getElementById("productNotFound");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const paymentAmount = document.getElementById("paymentAmount");
  const changeAmount = document.getElementById("changeAmount");
  const checkoutForm = document.getElementById("checkoutForm");
  const saleSuccess = document.getElementById("saleSuccess");
  const saleError = document.getElementById("saleError");
  const customerSelect = document.getElementById("customerSelect");

  let products = [];
  let cart = [];
  let customers = [];

  // --- Load customers ---
  async function loadCustomers() {
    try {
      const res = await fetch("http://localhost:3000/api/customers", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      customers = data.customers || [];
      customerSelect.innerHTML = '<option value="">- เลือกลูกค้า -</option>';
      customers.forEach((cust) => {
        const opt = document.createElement("option");
        opt.value = cust.id;
        opt.textContent = `${cust.name} (${cust.phone || ""})`;
        customerSelect.appendChild(opt);
      });
    } catch (e) {
      customerSelect.innerHTML = '<option value="">โหลดลูกค้าไม่ได้</option>';
    }
  }

  // --- Load products ---
  async function loadProducts(keyword = "") {
    productList.innerHTML = "";
    productLoading.classList.remove("d-none");
    productNotFound.classList.add("d-none");
    try {
      let url = "http://localhost:3000/api/products";
      if (keyword && keyword.trim() !== "")
        url += `?q=${encodeURIComponent(keyword)}`;
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลดสินค้าล้มเหลว");
      products = (data.products || data).filter(
        (prod) => prod.is_active !== false
      ); // เฉพาะที่เปิดขาย
      renderProductList();
    } catch (err) {
      productNotFound.innerText = err.message;
      productNotFound.classList.remove("d-none");
    } finally {
      productLoading.classList.add("d-none");
    }
  }

  function renderProductList() {
    productList.innerHTML = "";
    if (!products.length) {
      productNotFound.classList.remove("d-none");
      return;
    }
    productNotFound.classList.add("d-none");
    products.forEach((prod) => {
      const card = document.createElement("div");
      card.className = "col";
      card.innerHTML = `
        <div class="card h-100 shadow border-0 rounded-4">
          <div class="card-body d-flex flex-column align-items-center">
            <h5 class="card-title text-center">${prod.name}</h5>
            <p class="mb-2 small text-muted">${prod.category_name || "-"}</p>
            <div class="fw-bold text-success fs-5 mb-2">฿${(+prod.sell_price).toFixed(
              2
            )}</div>
            <div class="mb-2 small">คงเหลือ: ${prod.stock_qty}</div>
            <button class="btn btn-sm btn-primary addToCartBtn" ${
              prod.stock_qty <= 0 ? "disabled" : ""
            }><i class="bi bi-cart-plus"></i> หยิบใส่ตะกร้า</button>
          </div>
        </div>
      `;
      card.querySelector(".addToCartBtn").onclick = function () {
        addToCart(prod.id);
      };
      productList.appendChild(card);
    });
  }

  function addToCart(productId) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    let item = cart.find((c) => c.id === productId);
    if (item) {
      if (item.qty < prod.stock_qty) item.qty++;
    } else {
      cart.push({ ...prod, qty: 1 });
    }
    renderCart();
  }

  function renderCart() {
    cartList.innerHTML = "";
    if (!cart.length) {
      cartList.innerHTML = `<div class="alert alert-info text-center">ยังไม่มีสินค้าในตะกร้า</div>`;
      cartTotal.innerText = "฿0.00";
      changeAmount.innerText = "฿0.00";
      return;
    }
    cart.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "d-flex align-items-center mb-2";
      row.innerHTML = `
        <span class="flex-grow-1">${item.name}</span>
        <div class="input-group input-group-sm mx-2" style="width:110px;">
          <button class="btn btn-outline-secondary minusBtn" type="button"><i class="bi bi-dash"></i></button>
          <input type="number" class="form-control text-center qtyInput" min="1" max="${
            item.stock_qty
          }" value="${item.qty}">
          <button class="btn btn-outline-secondary plusBtn" type="button"><i class="bi bi-plus"></i></button>
        </div>
        <span style="width:60px;" class="text-end">฿${(
          +item.sell_price * item.qty
        ).toFixed(2)}</span>
        <button class="btn btn-sm btn-danger ms-2 removeBtn"><i class="bi bi-trash"></i></button>
      `;
      // Qty event
      row.querySelector(".minusBtn").onclick = () =>
        updateCartQty(item.id, item.qty - 1);
      row.querySelector(".plusBtn").onclick = () =>
        updateCartQty(item.id, item.qty + 1);
      row.querySelector(".qtyInput").onchange = (e) =>
        updateCartQty(item.id, +e.target.value);
      row.querySelector(".removeBtn").onclick = () => removeCartItem(item.id);
      cartList.appendChild(row);
    });
    cartTotal.innerText = `฿${cart
      .reduce((sum, i) => sum + i.qty * i.sell_price, 0)
      .toFixed(2)}`;
    updateChange();
  }

  function updateCartQty(productId, qty) {
    let item = cart.find((c) => c.id === productId);
    const prod = products.find((p) => p.id === productId);
    if (!item || !prod) return;
    if (qty <= 0) return removeCartItem(productId);
    if (qty > prod.stock_qty) qty = prod.stock_qty;
    item.qty = qty;
    renderCart();
  }

  function removeCartItem(productId) {
    cart = cart.filter((c) => c.id !== productId);
    renderCart();
  }

  function updateChange() {
    let total = cart.reduce((sum, i) => sum + i.qty * i.sell_price, 0);
    let paid = +paymentAmount.value || 0;
    let change = paid - total;
    changeAmount.innerText = change >= 0 ? `฿${change.toFixed(2)}` : "฿0.00";
  }

  paymentAmount.oninput = updateChange;

  searchForm.onsubmit = function (e) {
    e.preventDefault();
    loadProducts(searchInput.value.trim());
  };

  // --- ยืนยันขาย ---
  checkoutForm.onsubmit = async function (e) {
    e.preventDefault();
    if (!cart.length) return;
    let total = cart.reduce((sum, i) => sum + i.qty * i.sell_price, 0);
    let paid = +paymentAmount.value || 0;
    if (paid < total) {
      saleError.classList.remove("d-none");
      saleError.innerText = "รับเงินน้อยกว่าราคาสินค้า";
      setTimeout(() => saleError.classList.add("d-none"), 3000);
      return;
    }
    saleError.classList.add("d-none");
    try {
      const res = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          customer_id: customerSelect.value || null,
          cart: cart.map((i) => ({
            product_id: i.id,
            qty: i.qty,
            price: i.sell_price,
          })),
          total,
          paid,
          change: paid - total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
      saleSuccess.classList.remove("d-none");
      setTimeout(() => saleSuccess.classList.add("d-none"), 2000);
      cart = [];
      renderCart();
      paymentAmount.value = "";
      updateChange();
      loadProducts();
    } catch (err) {
      saleError.classList.remove("d-none");
      saleError.innerText = err.message;
      setTimeout(() => saleError.classList.add("d-none"), 3000);
    }
  };

  // --- Initial load ---
  loadProducts();
  loadCustomers();
  renderCart();
});
