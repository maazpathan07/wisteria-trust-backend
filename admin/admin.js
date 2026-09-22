/* Admin Dashboard Core Logic - Modernized with Toast Notifications & Extend Modal */

let ALL_VERIFICATIONS = []
let EDIT_ID = null
let EXTEND_ID = null
const SELECTED_IDS = new Set()

const API_BASE_URL =
  typeof WT_CONFIG !== "undefined" && WT_CONFIG.API_BASE_URL
    ? WT_CONFIG.API_BASE_URL
    : "https://wisteria-backend.onrender.com"

const token = localStorage.getItem("adminToken")
if (!token) {
  window.location.href = "login.html"
}

/* =====================================================
   TOAST NOTIFICATION ENGINE
===================================================== */
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer")
  if (!container) {
    container = document.createElement("div")
    container.id = "toastContainer"
    container.className = "toast-container"
    document.body.appendChild(container)
  }

  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`

  let icon = "ℹ️"
  if (type === "success") icon = "✅"
  if (type === "error") icon = "⚠️"

  toast.innerHTML = `<span style="font-size: 1.1rem;">${icon}</span> <span>${message}</span>`
  container.appendChild(toast)

  // Slide in
  setTimeout(() => toast.classList.add("show"), 20)

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 400)
  }, 3500)
}

document.addEventListener("DOMContentLoaded", () => {
  // Set minimum date for date inputs to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  const expiryDateInput = document.getElementById("expiryDate")
  if (expiryDateInput) {
    expiryDateInput.min = tomorrowStr
  }

  const newExpiryDateInput = document.getElementById("newExpiryDate")
  if (newExpiryDateInput) {
    newExpiryDateInput.min = tomorrowStr
  }

  // Mobile Menu Logic
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const adminNav = document.getElementById("adminNav")

  if (mobileMenuBtn && adminNav) {
    mobileMenuBtn.addEventListener("click", () => {
      adminNav.classList.toggle("active")
      mobileMenuBtn.classList.toggle("active")
      document.body.classList.toggle("menu-open")
    })

    document.addEventListener("click", (e) => {
      if (!adminNav.contains(e.target) && !mobileMenuBtn.contains(e.target) && adminNav.classList.contains("active")) {
        adminNav.classList.remove("active")
        mobileMenuBtn.classList.remove("active")
        document.body.classList.remove("menu-open")
      }
    })

    adminNav.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        adminNav.classList.remove("active")
        mobileMenuBtn.classList.remove("active")
        document.body.classList.remove("menu-open")
      })
    })
  }

  // Theme Switcher Logic
  const themeToggle = document.getElementById("themeToggle")
  const savedTheme = localStorage.getItem("admin-theme") || "dark"
  document.documentElement.setAttribute("data-theme", savedTheme)

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme")
      const newTheme = currentTheme === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("admin-theme", newTheme)
    })
  }

  const logoutBtns = document.querySelectorAll(".btn-logout")
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", logout)
  })

  const createForm = document.querySelector(".create-form")
  if (createForm) {
    createForm.addEventListener("submit", createVerification)
  }

  const editForm = document.querySelector(".modal-form:not(#extendForm)")
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveEdit()
    })
  }

  const extendForm = document.getElementById("extendForm")
  if (extendForm) {
    extendForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveExtend()
    })
  }

  const searchInput = document.getElementById("searchInput")
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  if (searchInput) {
    searchInput.addEventListener("input", filterTable)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterTable)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", filterTable)
  }

  const selectAllCheckbox = document.getElementById("selectAll")
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", toggleSelectAll)
  }

  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn")
  const bulkRevokeBtn = document.getElementById("bulkRevokeBtn")
  const exportBtn = document.getElementById("exportBtn")

  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", bulkDelete)
  }

  if (bulkRevokeBtn) {
    bulkRevokeBtn.addEventListener("click", bulkRevoke)
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportToCSV)
  }

  // Load verifications if on dashboard
  if (document.getElementById("verificationsTable")) {
    loadVerifications()
  }
})

function logout() {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminInfo")
  window.location.href = "login.html"
}

/* ===============================
   CREATE VERIFICATION
================================ */
async function createVerification(e) {
  e.preventDefault()

  const sellerName = document.getElementById("sellerName")
  const businessName = document.getElementById("businessName")
  const email = document.getElementById("email")
  const city = document.getElementById("city")
  const expiryDate = document.getElementById("expiryDate")

  const payload = {
    sellerName: sellerName.value.trim(),
    businessName: businessName.value.trim(),
    email: email.value.trim(),
    city: city.value.trim(),
    expiryDate: expiryDate.value,
  }

  if (!payload.sellerName || !payload.businessName || !payload.email || !payload.city || !payload.expiryDate) {
    showToast("All fields are required", "error")
    return
  }

  const submitBtn = document.querySelector(".create-submit-btn")
  if (submitBtn) {
    submitBtn.disabled = true
    submitBtn.querySelector("span").textContent = "Creating..."
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.message || "Failed to create verification", "error")
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.querySelector("span").textContent = "Create Verification"
      }
      return
    }

    showToast(`Verification created! ID: ${data.data?.verificationId || "Success"}`, "success")

    sellerName.value = ""
    businessName.value = ""
    email.value = ""
    city.value = ""
    expiryDate.value = ""

    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1200)
  } catch (err) {
    console.error(err)
    showToast("Server connection error. Please try again.", "error")
    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.querySelector("span").textContent = "Create Verification"
    }
  }
}

/* ===============================
   LOAD VERIFICATIONS
================================ */
async function loadVerifications() {
  const tbody = document.getElementById("verificationsTable")
  if (tbody && ALL_VERIFICATIONS.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          Loading official verifications from registry...
        </td>
      </tr>
    `
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      showToast("Session expired. Please login again.", "error")
      setTimeout(logout, 1500)
      return
    }

    const data = await res.json()

    if (data.success && data.data) {
      ALL_VERIFICATIONS = data.data
      renderTable(ALL_VERIFICATIONS)
      updateStats(ALL_VERIFICATIONS)
    }
  } catch (err) {
    console.error("Load failed", err)
    showToast("Failed to load verifications from server", "error")
  }
}

/* ===============================
   UPDATE STATS
================================ */
function updateStats(list) {
  const total = list.length
  const active = list.filter((v) => v.status === "ACTIVE").length
  const expired = list.filter((v) => v.status === "EXPIRED").length
  const revoked = list.filter((v) => v.status === "REVOKED").length

  const statTotal = document.getElementById("statTotal")
  const statActive = document.getElementById("statActive")
  const statExpired = document.getElementById("statExpired")
  const statRevoked = document.getElementById("statRevoked")

  if (statTotal) statTotal.textContent = total
  if (statActive) statActive.textContent = active
  if (statExpired) statExpired.textContent = expired
  if (statRevoked) statRevoked.textContent = revoked
}

/* ===============================
   TABLE RENDER
================================ */
function renderTable(list) {
  const tbody = document.getElementById("verificationsTable")
  if (!tbody) return

  tbody.innerHTML = ""

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No verifications found
        </td>
      </tr>
    `
    return
  }

  list.forEach((v) => {
    const sellerLink =
      typeof WT_CONFIG !== "undefined" && WT_CONFIG.getSellerProfileLink
        ? WT_CONFIG.getSellerProfileLink(v.verificationId)
        : `https://wisteriatrust.com/seller/?id=${encodeURIComponent(v.verificationId)}`
    
    const isSelected = SELECTED_IDS.has(v.verificationId)

    let statusActions = ""
    if (v.status === "ACTIVE") {
      statusActions = `
        <button class="btn-action btn-revoke" onclick="revokeVerification('${v.verificationId}')">Revoke</button>
      `
    } else {
      statusActions = `
        <button class="btn-action btn-extend" onclick="openExtendModal('${v.verificationId}')">Extend</button>
      `
    }

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td class="checkbox-cell">
        <input type="checkbox" class="table-checkbox row-checkbox" data-id="${v.verificationId}" ${isSelected ? "checked" : ""}>
      </td>
      <td><span class="id-badge">${v.verificationId}</span></td>
      <td>${v.sellerName}</td>
      <td>${v.businessName}</td>
      <td>${v.city}</td>
      <td>${v.email}</td>
      <td><span class="status-badge status-${v.status.toLowerCase()}">${v.status}</span></td>
      <td>${new Date(v.expiryDate).toLocaleDateString()}</td>
      <td>${new Date(v.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-icons">
          <button class="icon-btn" title="Open" onclick="window.open('${sellerLink}', '_blank')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <button class="icon-btn" title="Copy" onclick="copyLink('${sellerLink}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="openEditModal('${v.verificationId}')">Edit</button>
          ${statusActions}
          <button class="btn-action btn-delete" onclick="deleteVerification('${v.verificationId}')">Delete</button>
        </div>
      </td>
    `

    tbody.appendChild(tr)
  })

  document.querySelectorAll(".row-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange)
  })
}

/* ===============================
   SEARCH AND FILTER
================================ */
function filterTable() {
  const searchInput = document.getElementById("searchInput")
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
  const statusValue = statusFilter ? statusFilter.value : ""
  const dateValue = dateFilter ? dateFilter.value : ""

  let filtered = ALL_VERIFICATIONS.filter((v) => {
    const matchesSearch =
      v.verificationId.toLowerCase().includes(searchTerm) ||
      v.sellerName.toLowerCase().includes(searchTerm) ||
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.email.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusValue || v.status === statusValue

    return matchesSearch && matchesStatus
  })

  if (dateValue) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter((v) => {
      const createdDate = new Date(v.createdAt)
      const expiryDate = new Date(v.expiryDate)

      switch (dateValue) {
        case "today":
          return createdDate >= today
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate >= weekAgo
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return createdDate >= monthAgo
        case "expiring":
          const sevenDaysLater = new Date(today)
          sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
          return expiryDate <= sevenDaysLater && expiryDate >= today && v.status === "ACTIVE"
        default:
          return true
      }
    })
  }

  renderTable(filtered)
  updateStats(filtered)
}

/* ===============================
   BULK SELECTION
================================ */
function toggleSelectAll(e) {
  const checked = e.target.checked
  const checkboxes = document.querySelectorAll(".row-checkbox")

  if (checked) {
    checkboxes.forEach((cb) => {
      cb.checked = true
      SELECTED_IDS.add(cb.dataset.id)
    })
  } else {
    checkboxes.forEach((cb) => {
      cb.checked = false
    })
    SELECTED_IDS.clear()
  }

  updateBulkButtons()
}

function handleCheckboxChange(e) {
  const id = e.target.dataset.id
  if (e.target.checked) {
    SELECTED_IDS.add(id)
  } else {
    SELECTED_IDS.delete(id)
    const selectAll = document.getElementById("selectAll")
    if (selectAll) selectAll.checked = false
  }
  updateBulkButtons()
}

function updateBulkButtons() {
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn")
  const bulkRevokeBtn = document.getElementById("bulkRevokeBtn")

  const hasSelection = SELECTED_IDS.size > 0

  if (bulkDeleteBtn) {
    bulkDeleteBtn.disabled = !hasSelection
  }

  if (bulkRevokeBtn) {
    bulkRevokeBtn.disabled = !hasSelection
  }
}

/* ===============================
   BULK OPERATIONS
================================ */
async function bulkDelete() {
  if (SELECTED_IDS.size === 0) return

  if (!confirm(`Are you sure you want to delete ${SELECTED_IDS.size} verification(s)? This action cannot be undone.`)) {
    return
  }

  const promises = Array.from(SELECTED_IDS).map((id) =>
    fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  )

  try {
    await Promise.all(promises)
    showToast(`Successfully deleted ${SELECTED_IDS.size} verification(s)`, "success")
    SELECTED_IDS.clear()
    const selectAll = document.getElementById("selectAll")
    if (selectAll) selectAll.checked = false
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Some deletions failed. Please try again.", "error")
    loadVerifications()
  }
}

async function bulkRevoke() {
  if (SELECTED_IDS.size === 0) return

  if (!confirm(`Are you sure you want to revoke ${SELECTED_IDS.size} verification(s)?`)) {
    return
  }

  const promises = Array.from(SELECTED_IDS).map((id) =>
    fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(id)}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),
  )

  try {
    await Promise.all(promises)
    showToast(`Successfully revoked ${SELECTED_IDS.size} verification(s)`, "success")
    SELECTED_IDS.clear()
    const selectAll = document.getElementById("selectAll")
    if (selectAll) selectAll.checked = false
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Some revocations failed. Please try again.", "error")
    loadVerifications()
  }
}

/* ===============================
   EXPORT TO CSV
================================ */
function exportToCSV() {
  if (ALL_VERIFICATIONS.length === 0) {
    showToast("No data to export", "info")
    return
  }

  const headers = ["ID", "Seller Name", "Business Name", "City", "Email", "Status", "Expiry Date", "Created Date"]
  const csvRows = [headers.join(",")]

  ALL_VERIFICATIONS.forEach((v) => {
    const row = [
      v.verificationId,
      `"${v.sellerName}"`,
      `"${v.businessName}"`,
      `"${v.city}"`,
      v.email,
      v.status,
      new Date(v.expiryDate).toLocaleDateString(),
      new Date(v.createdAt).toLocaleDateString(),
    ]
    csvRows.push(row.join(","))
  })

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `wisteria-verifications-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)

  showToast("CSV exported successfully", "success")
}

/* ===============================
   COPY LINK
================================ */
function copyLink(link) {
  navigator.clipboard.writeText(link)
  showToast("Verification link copied to clipboard!", "success")
}

/* ===============================
   EDIT MODAL
================================ */
function openEditModal(id) {
  const v = ALL_VERIFICATIONS.find((x) => x.verificationId === id)
  if (!v) return

  EDIT_ID = id

  const editSeller = document.getElementById("editSeller")
  const editBusiness = document.getElementById("editBusiness")
  const editCity = document.getElementById("editCity")
  const editEmail = document.getElementById("editEmail")
  const editExpiry = document.getElementById("editExpiry")

  if (editSeller) editSeller.value = v.sellerName
  if (editBusiness) editBusiness.value = v.businessName
  if (editCity) editCity.value = v.city
  if (editEmail) editEmail.value = v.email

  if (editExpiry) {
    const dateObj = new Date(v.expiryDate)
    const formattedDate = dateObj.toISOString().split("T")[0]
    editExpiry.value = formattedDate
  }

  const modal = document.getElementById("editModal")
  if (modal) modal.classList.add("active")
}

function closeEditModal() {
  const modal = document.getElementById("editModal")
  if (modal) modal.classList.remove("active")
  EDIT_ID = null
}

async function saveEdit() {
  if (!EDIT_ID) return

  const sellerName = document.getElementById("editSeller").value.trim()
  const businessName = document.getElementById("editBusiness").value.trim()
  const city = document.getElementById("editCity").value.trim()
  const email = document.getElementById("editEmail").value.trim()
  const expiryDate = document.getElementById("editExpiry").value

  if (!sellerName || !businessName || !city || !email || !expiryDate) {
    showToast("All fields are required", "error")
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(EDIT_ID)}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sellerName,
        businessName,
        city,
        email,
        expiryDate,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.message || "Update failed", "error")
      return
    }

    showToast("Verification updated successfully!", "success")
    closeEditModal()
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Update error. Please try again.", "error")
  }
}

/* ===============================
   EXTEND MODAL (REPLACES PROMPT)
================================ */
function openExtendModal(id) {
  const v = ALL_VERIFICATIONS.find((x) => x.verificationId === id)
  if (!v) return

  EXTEND_ID = id

  const subtitle = document.getElementById("extendSubtitle")
  if (subtitle) {
    subtitle.textContent = `Extending verification for ${v.businessName || v.sellerName} (${v.verificationId})`
  }

  const dateInput = document.getElementById("newExpiryDate")
  if (dateInput) {
    // Default to +1 year from current expiry or today
    const baseDate = new Date(v.expiryDate) > new Date() ? new Date(v.expiryDate) : new Date()
    baseDate.setFullYear(baseDate.getFullYear() + 1)
    dateInput.value = baseDate.toISOString().split("T")[0]
  }

  const modal = document.getElementById("extendModal")
  if (modal) modal.classList.add("active")
}

function closeExtendModal() {
  const modal = document.getElementById("extendModal")
  if (modal) modal.classList.remove("active")
  EXTEND_ID = null
}

async function saveExtend() {
  if (!EXTEND_ID) return

  const dateInput = document.getElementById("newExpiryDate")
  const newDate = dateInput ? dateInput.value : ""

  if (!newDate) {
    showToast("Please select a new expiry date", "error")
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(EXTEND_ID)}/extend`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expiryDate: newDate }),
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.message || "Extend failed", "error")
      return
    }

    showToast("Expiry date extended & verification activated!", "success")
    closeExtendModal()
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Failed to extend expiry date", "error")
  }
}

/* ===============================
   DELETE & STATUS ACTIONS
================================ */
async function deleteVerification(id) {
  if (!confirm(`Are you sure you want to delete verification ${id}? This action cannot be undone.`)) {
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.message || "Delete failed", "error")
      return
    }

    showToast("Verification deleted successfully!", "success")
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Delete error. Please try again.", "error")
  }
}

async function revokeVerification(id) {
  if (!confirm(`Are you sure you want to revoke verification ${id}?`)) {
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${encodeURIComponent(id)}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      showToast(data.message || "Revoke failed", "error")
      return
    }

    showToast("Verification revoked successfully!", "success")
    loadVerifications()
  } catch (err) {
    console.error(err)
    showToast("Revoke error. Please try again.", "error")
  }
}

/* ===============================
   KEYBOARD SHORTCUTS
================================ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEditModal()
    closeExtendModal()
  }
})
