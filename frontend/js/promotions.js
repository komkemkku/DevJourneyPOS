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

  // Elements
  const promotionTableBody = document.getElementById("promotionTableBody");
  const emptyPromotionAlert = document.getElementById("emptyPromotionAlert");
  const promotionForm = document.getElementById("promotionForm");
  const addPromotionModal = new bootstrap.Modal(
    document.getElementById("addPromotionModal")
  );
  const deletePromotionModal = new bootstrap.Modal(
    document.getElementById("deletePromotionModal")
  );
  let promotions = [];
  let promoToDeleteId = null;

  // Load promotions
  async function loadPromotions() {
    promotionTableBody.innerHTML = "";
    emptyPromotionAlert.classList.add("d-none");
    try {
      const res = await fetch("http://localhost:3000/api/promotions", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      promotions = data.promotions || data;
      renderTable();
    } catch {
      emptyPromotionAlert.classList.remove("d-none");
      emptyPromotionAlert.innerText = "เกิดข้อผิดพลาดในการโหลดโปรโมชั่น";
    }
  }

  function renderTable() {
    promotionTableBody.innerHTML = "";
    if (!promotions.length) {
      emptyPromotionAlert.classList.remove("d-none");
      emptyPromotionAlert.innerHTML =
        '<i class="bi bi-info-circle"></i> ยังไม่มีโปรโมชั่นในระบบ';
      return;
    }
    promotions.forEach((promo, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${promo.name}</td>
        <td>${promo.detail || "-"}</td>
        <td>${
          promo.start_date
            ? new Date(promo.start_date).toLocaleDateString("th-TH")
            : "-"
        }</td>
        <td>${
          promo.end_date
            ? new Date(promo.end_date).toLocaleDateString("th-TH")
            : "-"
        }</td>
        <td>
          <span class="badge ${
            promo.is_active ? "bg-success" : "bg-secondary"
          }">
            ${promo.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-warning me-2 editBtn"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger deleteBtn"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tr.querySelector(".editBtn").onclick = function () {
        openEditPromotionModal(promo);
      };
      tr.querySelector(".deleteBtn").onclick = function () {
        promoToDeleteId = promo.id;
        deletePromotionModal.show();
      };
      promotionTableBody.appendChild(tr);
    });
  }

  // Modal เพิ่ม/แก้ไข
  document.getElementById("addPromotionBtn").onclick = function () {
    promotionForm.reset();
    document.getElementById("promoId").value = "";
    document.getElementById("addPromotionModalLabel").innerText =
      "เพิ่มโปรโมชั่นใหม่";
    addPromotionModal.show();
  };

  promotionForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("promoId").value;
    const body = {
      name: document.getElementById("promoName").value.trim(),
      detail: document.getElementById("promoDetail").value.trim(),
      start_date: document.getElementById("promoStart").value,
      end_date: document.getElementById("promoEnd").value,
      is_active: document.getElementById("promoStatus").value === "true",
    };
    try {
      let url = "http://localhost:3000/api/promotions";
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
      addPromotionModal.hide();
      promotionForm.reset();
      loadPromotions();
    } catch (err) {
      alert(err.message);
    }
  });

  function openEditPromotionModal(promo) {
    document.getElementById("addPromotionModalLabel").innerText =
      "แก้ไขโปรโมชั่น";
    document.getElementById("promoId").value = promo.id;
    document.getElementById("promoName").value = promo.name;
    document.getElementById("promoDetail").value = promo.detail || "";
    document.getElementById("promoStart").value = promo.start_date
      ? promo.start_date.split("T")[0]
      : "";
    document.getElementById("promoEnd").value = promo.end_date
      ? promo.end_date.split("T")[0]
      : "";
    document.getElementById("promoStatus").value = promo.is_active
      ? "true"
      : "false";
    addPromotionModal.show();
  }

  document
    .getElementById("addPromotionModal")
    .addEventListener("hidden.bs.modal", function () {
      promotionForm.reset();
      document.getElementById("promoId").value = "";
      document.getElementById("addPromotionModalLabel").innerText =
        "เพิ่มโปรโมชั่นใหม่";
    });

  document.getElementById("confirmDeleteBtn").onclick = async function () {
    if (!promoToDeleteId) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/promotions/${promoToDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (!res.ok) throw new Error("ลบโปรโมชั่นไม่สำเร็จ");
      deletePromotionModal.hide();
      promoToDeleteId = null;
      loadPromotions();
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  // โหลดครั้งแรก
  loadPromotions();
});
