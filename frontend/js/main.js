const API_URL = "http://localhost:3000/api";
let accessToken = localStorage.getItem("token") || "";

let products = [];
let categories = [];
let cart = [];
let promotions = [];
let customers = [];
let selectedPromotion = null;
let cartDiscount = 0;
let customer = null;
let userProfile = null;

// Loader (กรณีใส่ spinner ภายหลัง)
function showLoading(elId, show = true) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.classList.toggle("d-none", !show);
}

// ====== Init ======
document.addEventListener("DOMContentLoaded", async () => {
  await checkUserRole();
  await fetchCategories();
  await fetchProducts();
  await fetchPromotions();
  await fetchCustomers();
  renderCategoryButtons();
  renderProductList();
  renderCustomerSelect();
  renderPromotionSelect();
  renderCart();
  updateChange();

  // ค้นหาสินค้า
  const searchInput = document.getElementById("searchInput");
  if (searchInput)
    searchInput.addEventListener("input", debounce(searchProduct, 300));

  // คลิกหมวดหมู่
  document
    .getElementById("categoryList")
    .addEventListener("click", async (e) => {
      if (e.target.classList.contains("category-btn")) {
        // Active ปุ่มเดียว
        document
          .querySelectorAll(".category-btn")
          .forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
        const catId = e.target.getAttribute("data-id");
        await fetchProducts(catId);
        renderProductList();
      }
    });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn)
    logoutBtn.onclick = () => {
      localStorage.removeItem("token");
      window.location = "/login.html";
    };

  // Checkout
  document.getElementById("btnCheckout").onclick = checkout;

  // รับเงิน = เงินทอน
  document
    .getElementById("receivedAmount")
    .addEventListener("input", updateChange);

  // เลือกลูกค้า
  document
    .getElementById("customerSelect")
    .addEventListener("change", function () {
      const id = this.value;
      customer = customers.find((c) => String(c.id) === id) || null;
    });

  // เลือกโปรโมชัน
  document
    .getElementById("promotionSelect")
    .addEventListener("change", function () {
      const id = this.value;
      selectedPromotion = promotions.find((p) => String(p.id) === id) || null;
      calcCartTotal();
    });

  // Greeting
  if (userProfile) {
    document.getElementById("userGreeting").textContent = `สวัสดี! ${
      userProfile.name || ""
    } (${userProfile.role || ""})`;
  }
});

// ====== Check Token & Role ======
async function checkUserRole() {
  if (!accessToken) {
    window.location = "/login.html";
    return;
  }
  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    userProfile = data.user || {};
    // แสดงปุ่มหลังบ้าน ถ้า admin หรือ manager
    if (userProfile.role === "admin" || userProfile.role === "manager") {
      const backBtn = document.getElementById("backBtn");
      if (backBtn) {
        backBtn.classList.remove("d-none");
        backBtn.onclick = () => (window.location = "/frontend/backoffice.html");
      }
    }
    document.getElementById("userGreeting").innerText = `สวัสดี! ${
      userProfile.name || "ผู้ใช้งาน"
    } (${userProfile.role || ""})`;
  } catch {
    window.location = "/login.html";
  }
}

// ====== Debounce ======
function debounce(fn, ms = 500) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ======================== Category =========================
async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories?is_active=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  // filter ซ้ำ (กัน api bug)
  let arr = Array.isArray(data) ? data : data.categories || [];
  categories = arr.filter((c) => c.is_active);
  renderCategoryButtons();
}

function renderCategoryButtons() {
  const list = document.getElementById("categoryList");
  let html = `
    <button type="button"
      class="btn btn-lg btn-primary btn-category category-btn active me-2 mb-2"
      data-id="">
      <i class="bi bi-layers"></i> ทั้งหมด
    </button>
  `;
  categories.forEach((cat, idx) => {
    html += `
      <button type="button"
        class="btn btn-lg btn-outline-primary btn-category category-btn me-2 mb-2"
        data-id="${cat.id}">
        <i class="bi bi-folder${(idx % 4) + 1}"></i> ${cat.name}
      </button>
    `;
  });
  list.innerHTML = `<div class="d-flex flex-wrap">${html}</div>`;

  // Event: Active หมวดหมู่
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.onclick = async function () {
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active", "btn-primary"));
      this.classList.add("active", "btn-primary");
      this.classList.remove("btn-outline-primary");
      // เปลี่ยนปุ่มอื่นให้ outline
      document.querySelectorAll(".category-btn:not(.active)").forEach((b) => {
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline-primary");
      });
      await fetchProducts(this.getAttribute("data-id"));
    };
  });
}

// ======================== Product =========================
async function fetchProducts(categoryId = "", search = "") {
  let url = `${API_URL}/products?is_active=true`;
  if (categoryId) url += `&category_id=${categoryId}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  products = Array.isArray(data) ? data : data.products || [];
  renderProductList(); // สำคัญ! ต้อง render หลัง fetch เสมอ
}

function renderProductList() {
  const list = document.getElementById("productList");
  let html = "";
  if (!products.length) {
    html = `<div class="col-12 text-center text-danger py-4">ไม่พบสินค้า</div>`;
  } else {
    products.forEach((prod) => {
      html += `
        <div class="col">
          <div class="card product-card h-100 shadow-sm border-0" style="cursor:pointer;">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h6 class="card-title fw-bold text-dark">${prod.name}</h6>
                <div class="small text-secondary">${prod.barcode || ""}</div>
              </div>
              <div class="d-flex flex-row justify-content-between align-items-end mt-3">
                <span class="fw-bold fs-5 text-success">฿${prod.sell_price.toFixed(
                  2
                )}</span>
                <button class="btn btn-outline-success btn-sm rounded-pill px-3"
                  onclick="addToCart(${prod.id}); event.stopPropagation();">
                  <i class="bi bi-plus-circle"></i> เลือก
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }
  list.innerHTML = html;
}

// ======================== Search =========================
async function searchProduct() {
  const search = document.getElementById("searchInput").value.trim();
  let catBtn = document.querySelector(".category-btn.active");
  let catId = catBtn ? catBtn.getAttribute("data-id") : "";
  await fetchProducts(catId, search);
}

// ======= ใส่ event ให้ search =======
const searchInput = document.getElementById("searchInput");
if (searchInput)
  searchInput.addEventListener("input", debounce(searchProduct, 300));

// ========== Debounce Helper ==========
function debounce(fn, ms = 500) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ====== Cart Functions ======
function addToCart(productId) {
  const prod = products.find((p) => p.id === productId);
  if (!prod) return;
  let idx = cart.findIndex(
    (item) => item.product_id === productId && !item.remark
  );
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({
      product_id: prod.id,
      name: prod.name,
      price: prod.sell_price,
      qty: 1,
      remark: "",
    });
  }
  renderCart();
}

function removeCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function updateCartQty(idx, qty) {
  let q = parseInt(qty);
  if (isNaN(q) || q < 1) q = 1;
  cart[idx].qty = q;
  renderCart();
}

function updateCartRemark(idx, val) {
  cart[idx].remark = val;
}

function clearCart() {
  if (confirm("คุณต้องการยกเลิกบิลหรือไม่?")) {
    cart = [];
    renderCart();
  }
}

function renderCart() {
  const tbody = document.getElementById("cartTableBody");
  let html = "";
  cart.forEach((item, idx) => {
    html += `<tr>
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${
          item.qty
        }" class="form-control form-control-sm"
          onchange="updateCartQty(${idx}, this.value)">
      </td>
      <td>
        <input type="text" value="${
          item.remark || ""
        }" class="form-control form-control-sm"
          onchange="updateCartRemark(${idx}, this.value)">
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removeCart(${idx})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  });
  tbody.innerHTML = html;
  calcCartTotal();
}

// ====== Fetch Promotions/Customers ======
async function fetchPromotions() {
  const res = await fetch(`${API_URL}/promotions?is_active=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  promotions = Array.isArray(data) ? data : data.promotions || [];
}
async function fetchCustomers() {
  const res = await fetch(`${API_URL}/customers?is_active=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  customers = Array.isArray(data) ? data : data.customers || [];
}
function renderPromotionSelect() {
  const select = document.getElementById("promotionSelect");
  let html = `<option value="">-- ไม่ใช้โปรโมชัน --</option>`;
  promotions.forEach((p) => {
    html += `<option value="${p.id}">${p.name} (${
      p.amount ? "-" + p.amount : ""
    } บาท)</option>`;
  });
  select.innerHTML = html;
}
function renderCustomerSelect() {
  const select = document.getElementById("customerSelect");
  let html = `<option value="">ลูกค้าทั่วไป</option>`;
  customers.forEach((c) => {
    html += `<option value="${c.id}">${
      c.name || c.phone || "รหัส " + c.id
    }</option>`;
  });
  select.innerHTML = html;
}

// ====== Cart Summary ======
function calcCartTotal() {
  let subtotal = cart.reduce((a, b) => a + b.qty * b.price, 0);
  cartDiscount = selectedPromotion ? parseFloat(selectedPromotion.amount) : 0;
  let total = Math.max(0, subtotal - cartDiscount);
  document.getElementById("cartTotal").innerText = total.toFixed(2);
  updateChange();
}

// ====== เงินทอน ======
function updateChange() {
  let received =
    parseFloat(document.getElementById("receivedAmount").value) || 0;
  let total = parseFloat(document.getElementById("cartTotal").innerText) || 0;
  let change = received - total;
  document.getElementById("changeAmount").innerText =
    change >= 0 ? change.toFixed(2) : "0.00";
}

// ====== Checkout/บันทึกขาย ======
async function checkout() {
  if (!cart.length) return showAlert("saleError", "กรุณาเลือกสินค้า", true);
  const total = parseFloat(document.getElementById("cartTotal").innerText) || 0;
  const received =
    parseFloat(document.getElementById("receivedAmount").value) || 0;
  if (received < total)
    return showAlert("saleError", "รับเงินน้อยกว่ายอดสุทธิ", true);

  let payload = {
    items: cart.map((i) => ({
      product_id: i.product_id,
      qty: i.qty,
      unit_price: i.price,
      remark: i.remark,
    })),
    total_amount: total,
    received_amount: received,
    change_amount: received - total,
    promotion_id: selectedPromotion ? selectedPromotion.id : null,
    discount_amount: selectedPromotion
      ? parseFloat(selectedPromotion.amount)
      : 0,
    customer_id: customer ? customer.id : null,
    payment_method: "cash",
    remark: "",
  };

  // POST API /sales
  try {
    const res = await fetch(`${API_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      showAlert("saleSuccess", "ขายสินค้าเรียบร้อย! พิมพ์ใบเสร็จ...");
      fetchReceipt(data.sale_id);
      cart = [];
      renderCart();
      document.getElementById("receivedAmount").value = "";
      updateChange();
    } else {
      const data = await res.json();
      showAlert("saleError", data.message || "ผิดพลาด", true);
    }
  } catch (err) {
    showAlert("saleError", err.message || "เกิดข้อผิดพลาด", true);
  }
}

// ====== ใบเสร็จ Modal ======
async function fetchReceipt(sale_id) {
  const res = await fetch(`${API_URL}/sales/${sale_id}/receipt`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.ok) {
    const { sale, items, settings } = await res.json();
    showReceiptModal(sale, items, settings);
  }
}
function showReceiptModal(sale, items, settings) {
  let html = `
    <div class="modal-header">
        <h5 class="modal-title">ใบเสร็จรับเงิน</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
        <div class="text-center mb-2">
            <b>${settings?.shop_name || "ร้านค้า"}</b><br>
            <small>${settings?.shop_address || ""}</small>
        </div>
        <div class="mb-2">
            เลขที่บิล: <b>${sale.receipt_no}</b><br>
            วันที่: ${new Date(sale.sale_datetime).toLocaleString()}<br>
            พนักงาน: ${sale.user_name || ""}
        </div>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>สินค้า</th><th class="text-end">จำนวน</th><th class="text-end">ราคา</th>
                </tr>
            </thead>
            <tbody>
                ${items
                  .map(
                    (i) => `
                    <tr>
                        <td>${i.product_name}${
                      i.remark ? " (" + i.remark + ")" : ""
                    }</td>
                        <td class="text-end">${i.quantity}</td>
                        <td class="text-end">฿${i.unit_price.toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
        <div class="d-flex justify-content-between"><b>รวม</b><b>฿${sale.total_amount.toFixed(
          2
        )}</b></div>
        <div class="d-flex justify-content-between"><span>รับเงิน</span><span>฿${sale.received_amount.toFixed(
          2
        )}</span></div>
        <div class="d-flex justify-content-between"><span>เงินทอน</span><span>฿${sale.change_amount.toFixed(
          2
        )}</span></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
        <button class="btn btn-outline-dark" onclick="window.print()">พิมพ์</button>
    </div>
    `;
  document.getElementById("receiptContent").innerHTML = html;
  new bootstrap.Modal(document.getElementById("receiptModal")).show();
}

// ====== Alert Helper ======
function showAlert(elId, msg, isError = false) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.classList.toggle("d-none", false);
  el.classList.toggle("alert-danger", isError);
  el.classList.toggle("alert-success", !isError);
  setTimeout(() => el.classList.add("d-none"), 2500);
}

// สำหรับ event ใน HTML
window.addToCart = addToCart;
window.removeCart = removeCart;
window.updateCartQty = updateCartQty;
window.updateCartRemark = updateCartRemark;
window.clearCart = clearCart;
