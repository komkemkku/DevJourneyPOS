document.addEventListener("DOMContentLoaded", function () {
  // แสดงชื่อ user
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  if (!token) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("userGreeting").innerText = `👤 ${
    name || "ผู้ใช้งาน"
  }`;

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // กลับหน้าขาย
  document.getElementById("posBtn").addEventListener("click", function () {
    window.location.href = "main.html";
  });
});
