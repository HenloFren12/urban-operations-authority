function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin@urbanops.gov" && pass === "UOA@2026") {
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials");
  }
}
