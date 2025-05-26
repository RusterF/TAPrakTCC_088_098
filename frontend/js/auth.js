// frontend/js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to dashboard
  if (
    checkAuth(false) &&
    !window.location.pathname.endsWith("dashboard.html")
  ) {
    // Allow staying on index.html if not specifically trying to access other protected pages
    // This prevents redirect loop if dashboard itself has an issue.
    // For a stricter approach, always redirect if on index.html and logged in:
    // window.location.href = 'dashboard.html';
  }

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register-form");
  const showLoginLink = document.getElementById("show-login-form");
  const loginFormContainer = document.getElementById("login-form-container");
  const registerFormContainer = document.getElementById(
    "register-form-container"
  );

  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginFormContainer.classList.add("hidden");
    registerFormContainer.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerFormContainer.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await apiRequest("/auth/login", "POST", data, false); //
        if (response.token) {
          setAuthToken(response.token);
          displayMessage("Login successful! Redirecting...", "info");
          window.location.href = "dashboard.html";
        } else {
          displayMessage(response.message || "Login failed.", "error");
        }
      } catch (error) {
        // displayMessage is called within apiRequest for server errors
        // console.error('Login failed:', error); // Already logged in apiRequest
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      // Basic client-side validation
      if (!data.nama_user || !data.email || !data.password) {
        displayMessage(
          "Full Name, Email, and Password are required for registration.",
          "error"
        );
        return;
      }

      try {
        const response = await apiRequest(
          "/auth/register",
          "POST",
          data,
          false
        ); //
        if (response.token) {
          setAuthToken(response.token);
          displayMessage("Registration successful! Redirecting...", "info");
          window.location.href = "dashboard.html";
        } else {
          // Error message might come from backend (e.g., user exists)
          displayMessage(response.message || "Registration failed.", "error");
        }
      } catch (error) {
        // displayMessage is called within apiRequest for server errors
        // console.error('Registration failed:', error); // Already logged in apiRequest
      }
    });
  }
});
