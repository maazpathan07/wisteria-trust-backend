// Admin Login Handler for Wisteria Trust

document.addEventListener("DOMContentLoaded", () => {
  const getApiBaseUrl = () => {
    if (typeof WT_CONFIG !== "undefined" && WT_CONFIG.API_BASE_URL) {
      return WT_CONFIG.API_BASE_URL
    }
    return "https://wisteria-backend.onrender.com"
  }

  // Check if already logged in
  const token = localStorage.getItem("adminToken")
  if (token) {
    window.location.href = "dashboard.html"
  }

  // Handle login form submission
  const loginForm = document.getElementById("loginForm")
  const loginBtn = document.getElementById("loginBtn")
  const errorMessage = document.getElementById("errorMessage")

  if (!loginForm) return

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value

    // Clear previous error
    if (errorMessage) {
      errorMessage.textContent = ""
      errorMessage.style.display = "none"
    }

    // Disable button during login
    if (loginBtn) {
      loginBtn.disabled = true
      loginBtn.textContent = "Signing in..."
    }

    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Store token
        localStorage.setItem("adminToken", data.token)

        // Store admin info if provided
        if (data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(data.admin))
        }

        // Redirect to dashboard
        window.location.href = "dashboard.html"
      } else {
        // Show error message
        if (errorMessage) {
          errorMessage.textContent = data.message || "Invalid credentials"
          errorMessage.style.display = "block"
        }
        if (loginBtn) {
          loginBtn.disabled = false
          loginBtn.textContent = "Sign In →"
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      if (errorMessage) {
        errorMessage.textContent = "Unable to connect to authentication server. Please check your connection."
        errorMessage.style.display = "block"
      }
      if (loginBtn) {
        loginBtn.disabled = false
        loginBtn.textContent = "Sign In →"
      }
    }
  })
})
