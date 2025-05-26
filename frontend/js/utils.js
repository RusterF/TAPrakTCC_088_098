// frontend/js/utils.js
const API_BASE_URL = "http://localhost:5000/api"; // Your backend API URL

function getAuthToken() {
  return localStorage.getItem("authToken");
}

function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}

function removeAuthToken() {
  localStorage.removeItem("authToken");
}

async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  requiresAuth = true
) {
  const headers = {}; // Default headers

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (endpoint !== "/auth/login" && endpoint !== "/auth/register") {
      console.warn("No auth token found for protected route:", endpoint);
      // window.location.href = 'index.html'; // Optional: redirect
      // return Promise.reject({ message: 'Not authorized, no token' });
    }
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (body) {
    if (body instanceof FormData) {
      // Don't set Content-Type for FormData, browser will do it
      config.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    }
  }
  // Re-assign headers to config in case they were modified
  config.headers = headers;


  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      console.error(
        `API Error (${response.status}) on ${method} ${endpoint}:`,
        data.message || response.statusText
      );
      displayMessage(data.message || `Error: ${response.statusText}`, "error", endpoint.includes('pesawat') ? 'pesawat-message-container' : 'global-message');
      return Promise.reject(data);
    }
    return data;
  } catch (error) {
    console.error("Network or other error:", error);
    displayMessage("Network error or server is unreachable.", "error", endpoint.includes('pesawat') ? 'pesawat-message-container' : 'global-message');
    return Promise.reject(error);
  }
}

function displayMessage(
  message,
  type = "info",
  containerId = "message-container" // Default was 'message-container'
) {
  // Try to find a specific message container first (e.g., for pesawat page)
  let container = document.getElementById(containerId);

  // If specific container not found, try a global one for auth pages
  if (!container && (containerId === 'message-container' || containerId.includes('auth'))) {
    container = document.getElementById("message-container"); // For login/register page
  }
  // If still not found, try the global message container in the navbar
  if (!container) {
    container = document.getElementById("global-message");
  }


  if (container) {
    const messageTypeClass =
      type === "error" ? "text-red-500" : "text-green-500";
    container.innerHTML = `<p class="${messageTypeClass} p-2">${message}</p>`; // Added padding for visibility
    setTimeout(() => {
      if (container.innerHTML.includes(message)) { // Clear only if it's the same message
        container.innerHTML = "";
      }
    }, 5000);
  } else {
      console.warn(`Message container with ID '${containerId}' not found. Message: ${message}`);
  }
}


function checkAuth(redirectIfUnauthenticated = true) {
  const token = getAuthToken();
  if (!token && redirectIfUnauthenticated) {
    if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/")) {
      window.location.href = "index.html";
    }
    return false;
  }
  return !!token; // Returns true if token exists, false otherwise
}

function logoutUser() {
  apiRequest("/auth/logout", "POST", null, true) // Pass null for body, true for requiresAuth
    .then((response) => {
      displayMessage(
        response.message || "Logged out successfully.",
        "info",
        "global-message"
      );
    })
    .catch((error) => {
      console.error(
        "Logout API call failed (token will still be removed client-side):",
        error
      );
      displayMessage(
        error.message ||
          "Logout failed on server, but session cleared locally.",
        "error",
        "global-message"
      );
    })
    .finally(() => {
      removeAuthToken();
      // Ensure redirection to index.html or root
      if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
          window.location.href = "index.html";
      } else if (window.location.pathname.endsWith('index.html') && window.location.search.includes('auth_error')) {
          // If already on index.html due to an auth error, maybe refresh to clear state or remove query param
          window.location.href = "index.html";
      }
    });
}