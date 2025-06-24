document.addEventListener("DOMContentLoaded", function () {
  // Check auth
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
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Backoffice button
  const backBtn = document.getElementById("backBtn");
  if (role === "admin" || role === "manager") {
    backBtn.style.display = "block";
    backBtn.addEventListener("click", function () {
      window.location.href = "backoffice.html";
    });
  } else {
    backBtn.style.display = "none";
  }

  // === POS Logic ===
  let products = []; // product list loaded from API
  let cart = []; // cart [{id, name, sell_price, qty, ...}]

  // --- โหลดสินค้าทั้งหมดเมื่อเริ่ม
  async function loadProducts(keyword = "") {
    document.getElementById("productList").innerHTML = "";
    document.getElementById("productLoading").classList.remove("d-none");
    document.getElementById("productNotFound").classList.add("d-none");
    try {
      // TODO: เปลี่ยน URL api ให้ตรง backend จริง!
      let url = "http://localhost:3000/api/products";
      if (keyword.trim() !== "") {
        url += "?search=" + encodeURIComponent(keyword);
      }
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลดสินค้าล้มเหลว");
      products = data.products || data; // รองรับทั้ง {products:[]} หรือ []
      renderProductList();
    } catch (err) {
      document.getElementById("productNotFound").innerText = err.message;
      document.getElementById("productNotFound").classList.remove("d-none");
    } finally {
      document.getElementById("productLoading").classList.add("d-none");
    }
  }

  // --- Render product list
  function renderProductList() {
    const listDiv = document.getElementById("productList");
    listDiv.innerHTML = "";
    if (!products.length) {
      document.getElementById("productNotFound").classList.remove("d-none");
      return;
    }
    products.forEach((prod) => {
      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <div class="product-card p-2 text-center h-100 d-flex flex-column align-items-center justify-content-between">
          <img src="${
            prod.image_url || "https://img.icons8.com/fluency/96/barcode.png"
          }" class="product-img mb-2" alt="${prod.name}">
          <div class="fw-semibold small">${prod.name}</div>
          <div class="text-primary fw-bold mb-2">฿${(+prod.sell_price).toFixed(
            2
          )}</div>
          <button class="btn btn-sm btn-main rounded-pill w-100" ${
            prod.stock_qty <= 0 ? "disabled" : ""
          }>
            <i class="bi bi-plus-lg"></i> ${
              prod.stock_qty > 0 ? "ใส่ตะกร้า" : "หมด"
            }
          </button>
        </div>
      `;
      // Add to cart button
      col.querySelector("button").addEventListener("click", function () {
        addToCart(prod);
      });
      listDiv.appendChild(col);
    });
  }

  // --- Add to cart logic
  function addToCart(prod) {
    const idx = cart.findIndex((c) => c.id === prod.id);
    if (idx >= 0) {
      if (cart[idx].qty < prod.stock_qty) {
        cart[idx].qty++;
      }
    } else {
      cart.push({ ...prod, qty: 1 });
    }
    renderCart();
  }

  // --- Render cart
  function renderCart() {
    const cartDiv = document.getElementById("cartList");
    cartDiv.innerHTML = "";
    if (!cart.length) {
      cartDiv.innerHTML =
        '<div class="text-center text-muted">ยังไม่มีสินค้าในบิล</div>';
      document.getElementById("cartTotal").innerText = "฿0.00";
      document.getElementById("changeAmount").innerText = "฿0.00";
      return;
    }
    cart.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className =
        "cart-item d-flex align-items-center justify-content-between";
      div.innerHTML = `
        <div class="flex-grow-1">
          <span class="fw-semibold">${item.name}</span>
          <div class="text-secondary small">฿${(+item.sell_price).toFixed(
            2
          )} × </div>
        </div>
        <div class="quantity-control">
          <button class="btn btn-outline-secondary btn-sm" ${
            item.qty <= 1 ? "disabled" : ""
          }><i class="bi bi-dash"></i></button>
          <span class="mx-1">${item.qty}</span>
          <button class="btn btn-outline-secondary btn-sm" ${
            item.qty >= item.stock_qty ? "disabled" : ""
          }><i class="bi bi-plus"></i></button>
          <button class="btn btn-outline-danger btn-sm ms-2"><i class="bi bi-trash"></i></button>
        </div>
        <div class="ms-2 fw-bold text-success">฿${(
          item.qty * item.sell_price
        ).toFixed(2)}</div>
      `;
      // - ปุ่มลด
      div.querySelectorAll("button")[0].addEventListener("click", function () {
        if (item.qty > 1) {
          item.qty--;
          renderCart();
        }
      });
      // - ปุ่มเพิ่ม
      div.querySelectorAll("button")[1].addEventListener("click", function () {
        if (item.qty < item.stock_qty) {
          item.qty++;
          renderCart();
        }
      });
      // - ปุ่มลบ
      div.querySelectorAll("button")[2].addEventListener("click", function () {
        cart.splice(idx, 1);
        renderCart();
      });
      cartDiv.appendChild(div);
    });
    // Update total
    const total = cart.reduce((sum, it) => sum + it.qty * it.sell_price, 0);
    document.getElementById("cartTotal").innerText = `฿${total.toFixed(2)}`;
    calcChange();
  }

  // --- Search products
  document
    .getElementById("searchForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const kw = document.getElementById("searchInput").value;
      loadProducts(kw);
    });

  // --- Payment logic
  document
    .getElementById("paymentAmount")
    .addEventListener("input", calcChange);
  function calcChange() {
    const total = cart.reduce((sum, it) => sum + it.qty * it.sell_price, 0);
    const paid = +document.getElementById("paymentAmount").value || 0;
    const change = paid - total;
    document.getElementById("changeAmount").innerText = `฿${
      change >= 0 ? change.toFixed(2) : "0.00"
    }`;
  }

  // --- ยืนยันขาย
  document
    .getElementById("checkoutForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!cart.length) return;

      const total = cart.reduce((sum, it) => sum + it.qty * it.sell_price, 0);
      const paid = +document.getElementById("paymentAmount").value || 0;
      if (paid < total) {
        showSaleError("จำนวนเงินรับน้อยกว่าราคาสินค้า");
        return;
      }
      // ส่งข้อมูลไป backend
      try {
        const res = await fetch("http://localhost:3000/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              product_id: item.id,
              quantity: item.qty,
              unit_price: item.sell_price,
            })),
            total_amount: total,
            payment_method: "cash",
            received_amount: paid,
            change_amount: paid - total,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "ขายสินค้าไม่สำเร็จ");
        document.getElementById("saleSuccess").classList.remove("d-none");
        setTimeout(() => {
          document.getElementById("saleSuccess").classList.add("d-none");
        }, 2000);
        // Reset cart
        cart = [];
        renderCart();
        document.getElementById("paymentAmount").value = "";
        document.getElementById("changeAmount").innerText = "฿0.00";
        loadProducts(""); // reload stock
      } catch (err) {
        showSaleError(err.message);
      }
    });
  function showSaleError(msg) {
    const alertDiv = document.getElementById("saleError");
    alertDiv.innerText = msg;
    alertDiv.classList.remove("d-none");
    setTimeout(() => alertDiv.classList.add("d-none"), 3000);
  }

  // --- โหลดสินค้าแรกเข้า
  loadProducts("");
  renderCart();
});
