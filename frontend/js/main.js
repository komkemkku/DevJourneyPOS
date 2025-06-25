document.addEventListener("DOMContentLoaded", function () {
  // ------------------- Auth -------------------
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
    window.location.href = "/index.html";
  };
  const backofficeBtn = document.getElementById("backBtn");
  if (role === "admin" || role === "manager") {
    backofficeBtn.style.display = "";
    backofficeBtn.onclick = function () {
      window.location.href = "backoffice.html";
    };
  } else {
    backofficeBtn.style.display = "none";
  }

  // ------------------- Elements -------------------
  const productList = document.getElementById("productList");
  const productLoading = document.getElementById("productLoading");
  const productNotFound = document.getElementById("productNotFound");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const cartList = document.getElementById("cartList");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartDiscount = document.getElementById("cartDiscount");
  const cartTotal = document.getElementById("cartTotal");
  const promotionBox = document.getElementById("promotionBox");
  const discountRow = document.getElementById("discountRow");
  const memberInput = document.getElementById("memberInput");
  const paymentAmount = document.getElementById("paymentAmount");
  const changeAmount = document.getElementById("changeAmount");
  const paymentMethod = document.getElementById("paymentMethod");
  const checkoutForm = document.getElementById("checkoutForm");
  const saleSuccess = document.getElementById("saleSuccess");
  const saleError = document.getElementById("saleError");
  const receiptModal = document.getElementById("receiptModal");
  const receiptContent = document.getElementById("receiptContent");

  // ------------------- State -------------------
  let products = [];
  let categories = [];
  let cart = [];
  let member = null;

  // ------------------- Load Categories -------------------
  async function loadCategories() {
    categoryFilter.disabled = true;
    categoryFilter.innerHTML = `<option value="">กำลังโหลด...</option>`;
    try {
      const res = await fetch(
        "http://localhost:3000/api/categories?is_active=true",
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
      const data = await res.json();
      let cats = [];
      if (Array.isArray(data)) cats = data;
      else if (Array.isArray(data.categories)) cats = data.categories;
      cats = cats.filter((c) => c.is_active === true || c.is_active === 1);
      categories = cats;
      if (cats.length === 0) throw new Error("ไม่มีหมวดหมู่ที่ใช้งานได้");
      categoryFilter.innerHTML =
        `<option value="">ทุกหมวดหมู่</option>` +
        cats.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
    } catch (err) {
      categoryFilter.innerHTML = `<option value="">โหลดหมวดหมู่ไม่ได้</option>`;
    } finally {
      categoryFilter.disabled = false;
    }
  }

  // ------------------- Load Products -------------------
  async function loadProducts(keyword = "", cat = "") {
    productList.innerHTML = "";
    productLoading.classList.remove("d-none");
    productNotFound.classList.add("d-none");
    try {
      let url = "http://localhost:3000/api/products";
      let param = [];
      if (keyword && keyword.trim() !== "")
        param.push(`q=${encodeURIComponent(keyword)}`);
      if (cat) param.push(`category_id=${cat}`);
      if (param.length) url += "?" + param.join("&");
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลดสินค้าล้มเหลว");
      products = (data.products || data).filter(
        (prod) => prod.is_active !== false
      );
      renderProductList();
    } catch (err) {
      productNotFound.innerText = err.message;
      productNotFound.classList.remove("d-none");
    } finally {
      productLoading.classList.add("d-none");
    }
  }

  // ------------------- Render Products -------------------
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
            }>
              <i class="bi bi-cart-plus"></i> หยิบใส่ตะกร้า
            </button>
          </div>
        </div>
      `;
      card.querySelector(".addToCartBtn").onclick = function () {
        addToCart(prod.id);
      };
      productList.appendChild(card);
    });
  }

  // ------------------- Cart Functions -------------------
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

  // ------------------- Render Cart -------------------
  function renderCart() {
    cartList.innerHTML = "";
    if (!cart.length) {
      cartList.innerHTML = `<div class="alert alert-info text-center">ยังไม่มีสินค้าในตะกร้า</div>`;
      setCartTotal(0, 0, 0);
      promotionBox.innerHTML = "";
      discountRow.style.display = "none";
      return;
    }
    cart.forEach((item) => {
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
      row.querySelector(".minusBtn").onclick = () =>
        updateCartQty(item.id, item.qty - 1);
      row.querySelector(".plusBtn").onclick = () =>
        updateCartQty(item.id, item.qty + 1);
      row.querySelector(".qtyInput").onchange = (e) =>
        updateCartQty(item.id, +e.target.value);
      row.querySelector(".removeBtn").onclick = () => removeCartItem(item.id);
      cartList.appendChild(row);
    });
    updateCartSummary();
    updateChange();
  }

  function updateCartSummary() {
    let subtotal = cart.reduce((sum, i) => sum + i.qty * i.sell_price, 0);
    setCartTotal(subtotal, 0, subtotal); // discount 0 (ยังไม่มี promotion)
    discountRow.style.display = "none";
  }
  function setCartTotal(subtotal, discount, total) {
    cartSubtotal.innerText = `฿${(+subtotal).toFixed(2)}`;
    cartDiscount.innerText = `-฿${(+discount).toFixed(2)}`;
    cartTotal.innerText = `฿${(+total).toFixed(2)}`;
  }

  // ------------------- สมาชิก/แต้ม (ค้นหาสมาชิกจากเบอร์) -------------------
  memberInput.onblur = async function () {
    const search = memberInput.value.trim();
    if (!search) {
      member = null;
      memberInput.classList.remove("is-valid", "is-invalid");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/api/customers?search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const data = await res.json();
      if (Array.isArray(data.customers) && data.customers.length) {
        member = data.customers[0];
        memberInput.classList.add("is-valid");
        memberInput.classList.remove("is-invalid");
      } else {
        member = null;
        memberInput.classList.add("is-invalid");
        memberInput.classList.remove("is-valid");
      }
    } catch {
      member = null;
      memberInput.classList.add("is-invalid");
      memberInput.classList.remove("is-valid");
    }
  };

  // ------------------- Update Change Amount -------------------
  paymentAmount.oninput = updateChange;
  function updateChange() {
    let total = getCartTotal();
    let paid = +paymentAmount.value || 0;
    let change = paid - total;
    changeAmount.innerText = change >= 0 ? `฿${change.toFixed(2)}` : "฿0.00";
  }
  function getCartTotal() {
    return parseFloat(cartTotal.innerText.replace(/[^\d\.]/g, "")) || 0;
  }

  // ------------------- Search/Filter Events -------------------
  searchForm.onsubmit = function (e) {
    e.preventDefault();
    loadProducts(searchInput.value.trim(), categoryFilter.value);
  };
  categoryFilter.onchange = function () {
    loadProducts(searchInput.value.trim(), categoryFilter.value);
  };

  // ------------------- Checkout / Sale -------------------
  checkoutForm.onsubmit = async function (e) {
    e.preventDefault();
    if (!cart.length) return;
    let total = getCartTotal();
    let paid = +paymentAmount.value || 0;
    if (paymentMethod.value === "cash" && paid < total) {
      showAlert(saleError, "รับเงินน้อยกว่าราคาสินค้า");
      return;
    }
    saleError.classList.add("d-none");

    try {
      // 1. Save sale
      const saleRes = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          customer_id: member ? member.id : null,
          payment_method: paymentMethod.value,
          received_amount: paid,
          change_amount: paid - total,
          total_amount: total,
          remark: "",
          sale_items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            unit_price: i.sell_price,
            cost_price: i.cost_price,
            total_price: i.qty * i.sell_price,
          })),
        }),
      });
      const sale = await saleRes.json();
      if (!saleRes.ok) throw new Error(sale.message || "เกิดข้อผิดพลาด");
      if (!sale.id && !sale.sale_id) throw new Error("ไม่ได้ sale_id กลับมา");

      // 2. Show receipt modal (ดึงข้อมูลใบเสร็จจริง)
      await showReceiptFromBackend(sale.id || sale.sale_id);

      showAlert(saleSuccess, "ขายสินค้าสำเร็จ!");
      resetSale();
      loadProducts(searchInput.value.trim(), categoryFilter.value);
    } catch (err) {
      showAlert(saleError, err.message);
    }
  };

  async function showReceiptFromBackend(sale_id) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/sales/${sale_id}/receipt`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (!res.ok) throw new Error("ดึงข้อมูลใบเสร็จล้มเหลว");
      const data = await res.json();
      const sale = data.sale || {};
      const items = data.items || [];
      let storeTitle = "Dev Journey POS";
      if (data.settings && data.settings.store_name)
        storeTitle = data.settings.store_name;

      let itemsHtml = items
        .map(
          (item) => `
      <tr>
        <td>${item.product_name || item.name}</td>
        <td>${item.quantity || item.qty}</td>
        <td>฿${(+item.unit_price).toFixed(2)}</td>
        <td>฿${(
          (item.unit_price || item.price) * (item.quantity || item.qty)
        ).toFixed(2)}</td>
      </tr>
    `
        )
        .join("");

      let content = `
      <div class="modal-header"><h5 class="modal-title">ใบเสร็จรับเงิน</h5></div>
      <div class="modal-body">
        <div class="mb-2 text-center fw-bold">${storeTitle}</div>
        <table class="table table-sm">
          <thead>
            <tr><th>สินค้า</th><th>จำนวน</th><th>ราคา/ชิ้น</th><th>รวม</th></tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div>รวม: ฿${(+sale.total_amount || 0).toFixed(2)}</div>
        <div>ช่องทางชำระ: ${sale.payment_method}</div>
        <div>รับเงิน: ฿${(+sale.received_amount || 0).toFixed(2)}</div>
        <div>เงินทอน: ฿${(+sale.change_amount || 0).toFixed(2)}</div>
        <div class="text-end text-muted small mt-2">เวลา: ${
          sale.created_at ? new Date(sale.created_at).toLocaleString() : ""
        }</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
      </div>
    `;
      receiptContent.innerHTML = content;
      new bootstrap.Modal(receiptModal).show();
    } catch (err) {
      alert("แสดงใบเสร็จล้มเหลว: " + err.message);
    }
  }

  function showAlert(el, msg) {
    el.innerText = msg;
    el.classList.remove("d-none");
    setTimeout(() => el.classList.add("d-none"), 3000);
  }
  function resetSale() {
    cart = [];
    member = null;
    memberInput.value = "";
    paymentAmount.value = "";
    paymentMethod.value = "cash";
    changeAmount.innerText = "฿0.00";
    renderCart();
  }

  // ------------------- Initial load -------------------
  loadCategories();
  loadProducts();
  renderCart();
});
