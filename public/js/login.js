document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        window.location.href = "/main.html";
      } else {
        document.getElementById("loginAlert").classList.remove("d-none");
        document.getElementById("password").value = "";
        document.getElementById("password").focus();
      }
    } catch (error) {
      document.getElementById("loginAlert").innerText =
        "เกิดข้อผิดพลาด กรุณาลองใหม่";
      document.getElementById("loginAlert").classList.remove("d-none");
    }
  });

["username", "password"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    document.getElementById("loginAlert").classList.add("d-none");
  });
});
