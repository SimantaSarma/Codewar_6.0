// Toggle between Login and Register forms
document.getElementById("login-toggle").addEventListener("click", () => {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-toggle").classList.add("active");
  document.getElementById("register-toggle").classList.remove("active");
});

document.getElementById("register-toggle").addEventListener("click", () => {
  document.getElementById("register-form").classList.remove("hidden");
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-toggle").classList.add("active");
  document.getElementById("login-toggle").classList.remove("active");
});

// Switch forms via text link
document.getElementById("switch-to-register").addEventListener("click", () => {
  document.getElementById("register-toggle").click();
});

document.getElementById("switch-to-login").addEventListener("click", () => {
  document.getElementById("login-toggle").click();
});
