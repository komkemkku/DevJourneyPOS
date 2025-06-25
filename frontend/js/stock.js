document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  if (!token) window.location.href = "/index.html";
  document.getElementById("userGreeting").innerText = `👤 ${
    name || "ผู้ใช้งาน"
  }`;
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "/index.html";
  };
  document.getElementById("backofficeBtn").onclick = () => {
    window.location.href = "backoffice.html";
  };

  const productTableBody = document.getElementById("productTableBody");
  const stockProductSelect = document.getElementById("stockProductSelect");
  const stockForm = document.getElementById("stockForm");
  const addStockModal = new bootstrap.Modal(
    document.getElementById("addStockModal")
  );
  const addStockBtn = document.getElementById("addStockBtn");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const stockHistoryModal = new bootstrap.Modal(
    document.getElementById("stockHistoryModal")
  );
  const stockHistoryBody = document.getElementById("stockHistoryBody");

  let products = [];
  let categories = [];

  // โหลดหมวดหมู่
  async function loadCategories() {
    const res = await fetch("http://localhost:3000/api/categories", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    categories = data.categories || [];
    categoryFilter.innerHTML = `<option value="">ทุกหมวดหมู่</option>`;
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.text = cat.name;
      categoryFilter.appendChild(opt);
    });
  }

  // โหลดสินค้า
  async function loadProducts() {
    const res = await fetch("http://localhost:3000/api/products", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    products = data.products || [];
    renderProductTable();
    renderProductSelect();
  }

  // ตารางสินค้า
  function renderProductTable() {
    productTableBody.innerHTML = "";
    let q = searchInput.value.trim().toLowerCase();
    let catId = +categoryFilter.value;
    let filtered = products.filter(
      (prod) =>
        (!catId || prod.category_id == catId) &&
        (!q ||
          prod.name.toLowerCase().includes(q) ||
          (prod.barcode && prod.barcode.includes(q)))
    );
    filtered.forEach((prod, idx) => {
      const cat = categories.find((c) => c.id == prod.category_id);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${prod.barcode || "-"}</td>
        <td>${prod.name}</td>
        <td>${cat ? cat.name : "-"}</td>
        <td>${(+prod.cost_price).toFixed(2)}</td>
        <td>${(+prod.sell_price).toFixed(2)}</td>
        <td class="fw-bold text-primary">${prod.stock_qty}</td>
        <td>${prod.unit || ""}</td>
        <td><button class="btn btn-sm btn-info stockHistoryBtn"><i class="bi bi-clock-history"></i></button></td>
      `;
      tr.querySelector(".stockHistoryBtn").onclick = function () {
        openStockHistoryModal(prod);
      };
      productTableBody.appendChild(tr);
    });
  }

  // Product Select สำหรับ modal เพิ่มสต็อค
  function renderProductSelect() {
    stockProductSelect.innerHTML = "";
    products.forEach((prod) => {
      const opt = document.createElement("option");
      opt.value = prod.id;
      opt.text = `${prod.name} (${prod.barcode || "-"}) [เหลือ ${
        prod.stock_qty
      }]`;
      stockProductSelect.appendChild(opt);
    });
  }

  // เปิด modal เพิ่ม/ปรับสต็อค
  addStockBtn.onclick = function () {
    stockForm.reset();
    renderProductSelect();
    addStockModal.show();
  };

  // บันทึกการเพิ่ม/ปรับสต็อค
  stockForm.onsubmit = async function (e) {
    e.preventDefault();
    const prodId = +stockProductSelect.value;
    const qty = +document.getElementById("stockQtyInput").value;
    const changeType = document.getElementById("changeTypeSelect").value;
    const note = document.getElementById("stockNoteInput").value;
    if (!prodId || !qty) {
      alert("กรุณาระบุสินค้าและจำนวน");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          product_id: prodId,
          quantity: qty,
          change_type: changeType,
          note,
        }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      addStockModal.hide();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // ฟิลเตอร์ & search
  searchInput.oninput = categoryFilter.onchange = renderProductTable;

  // ดูประวัติ
  async function openStockHistoryModal(prod) {
    const res = await fetch(
      `http://localhost:3000/api/stock-movements?product_id=${prod.id}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    const data = await res.json();
    const movements = data.movements || [];
    stockHistoryBody.innerHTML = "";
    movements.forEach((mv) => {
      stockHistoryBody.innerHTML += `
        <tr>
          <td>${mv.created_at ? mv.created_at.split("T")[0] : ""}</td>
          <td>${mv.change_type}</td>
          <td class="fw-bold">${mv.quantity > 0 ? "+" : ""}${mv.quantity}</td>
          <td>${mv.user_name || "-"}</td>
          <td>${mv.note || ""}</td>
        </tr>
      `;
    });
    stockHistoryModal.show();
  }

  // โหลดเริ่มต้น
  loadCategories();
  loadProducts();
});
