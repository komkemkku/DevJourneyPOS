document.addEventListener("DOMContentLoaded", function () {
  // --- Security ---
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
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

  // --- Elements ---
  const productTableBody = document.getElementById("productTableBody");
  const emptyProductAlert = document.getElementById("emptyProductAlert");
  const productForm = document.getElementById("productForm");
  const addProductModal = new bootstrap.Modal(
    document.getElementById("addProductModal")
  );
  const deleteProductModal = new bootstrap.Modal(
    document.getElementById("deleteProductModal")
  );
  let products = [];
  let productToDeleteId = null;

  // --- โหลดสินค้าจาก API ---
  async function loadProducts() {
    productTableBody.innerHTML = "";
    emptyProductAlert.classList.add("d-none");
    try {
      const res = await fetch("http://localhost:3000/api/products", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      products = data.products || data; // รองรับทั้ง {products:[]} หรือ []
      renderTable();
    } catch (err) {
      emptyProductAlert.classList.remove("d-none");
      emptyProductAlert.innerText = "เกิดข้อผิดพลาดในการโหลดสินค้า";
    }
  }

  function renderTable() {
    productTableBody.innerHTML = "";
    if (!products.length) {
      emptyProductAlert.classList.remove("d-none");
      emptyProductAlert.innerHTML =
        '<i class="bi bi-info-circle"></i> ยังไม่มีสินค้าในระบบ';
      return;
    }
    products.forEach((prod, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${prod.name}</td>
        <td>${prod.category_name || "-"}</td>
        <td>฿${(+prod.sell_price).toFixed(2)}</td>
        <td>${prod.stock_qty}</td>
        <td>
          <span class="badge ${
            prod.is_active ? "bg-success" : "bg-secondary"
          }">${prod.is_active ? "เปิดขาย" : "ปิดขาย"}</span>
        </td>
        <td>
          <button class="btn btn-sm btn-warning me-2 editBtn"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i></button>
        </td>
      `;
      // --- Edit ---
      tr.querySelector(".editBtn").addEventListener("click", function () {
        openEditProductModal(prod);
      });
      // --- Delete ---
      tr.querySelector(".deleteBtn").addEventListener("click", function () {
        productToDeleteId = prod.id;
        deleteProductModal.show();
      });
      productTableBody.appendChild(tr);
    });
  }

  // --- เพิ่ม/แก้ไข สินค้า ---
  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("prodId").value;
    const body = {
      name: document.getElementById("prodName").value.trim(),
      category: document.getElementById("prodCategory").value.trim(),
      sell_price: +document.getElementById("prodPrice").value,
      stock_qty: +document.getElementById("prodStock").value,
      is_active: document.getElementById("prodStatus").value === "true",
    };
    try {
      let url = "http://localhost:3000/api/products";
      let method = "POST";
      if (id) {
        url += "/" + id;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
      addProductModal.hide();
      productForm.reset();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  });

  // --- เปิด Modal แก้ไข ---
  function openEditProductModal(prod) {
    document.getElementById("addProductModalLabel").innerText = "แก้ไขสินค้า";
    document.getElementById("prodId").value = prod.id;
    document.getElementById("prodName").value = prod.name;
    document.getElementById("prodCategory").value = prod.category_name || "";
    document.getElementById("prodPrice").value = prod.sell_price;
    document.getElementById("prodStock").value = prod.stock_qty;
    document.getElementById("prodStatus").value = prod.is_active
      ? "true"
      : "false";
    addProductModal.show();
  }

  // --- Modal ปิด ต้อง reset form ---
  document
    .getElementById("addProductModal")
    .addEventListener("hidden.bs.modal", function () {
      productForm.reset();
      document.getElementById("prodId").value = "";
      document.getElementById("addProductModalLabel").innerText =
        "เพิ่มสินค้าใหม่";
    });

  // --- ลบสินค้า ---
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", async function () {
      if (!productToDeleteId) return;
      try {
        const res = await fetch(
          `http://localhost:3000/api/products/${productToDeleteId}`,
          {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          }
        );
        if (!res.ok) throw new Error("ลบสินค้าไม่สำเร็จ");
        deleteProductModal.hide();
        productToDeleteId = null;
        loadProducts();
      } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    });

  // --- โหลดสินค้าแรกเข้า ---
  loadProducts();
});
