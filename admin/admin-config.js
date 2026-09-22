/**
 * Wisteria Trust - Admin Suite Configuration Engine
 * Automatically detects whether running on Localhost or Live Production
 */
(function (global) {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "" ||
      window.location.protocol === "file:");

  const CONFIG = {
    // Backend API Base URL
    API_BASE_URL: isLocal
      ? "http://localhost:5000"
      : "https://wisteria-backend.onrender.com",

    // Frontend Website Domain
    FRONTEND_URL:
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin !== "null" &&
      !isLocal
        ? window.location.origin
        : "https://wisteriatrust.com",

    // Central API Endpoints
    ENDPOINTS: {
      LOGIN: "/api/admin/login",
      VERIFICATION_CREATE: "/api/admin/verification",
      VERIFICATIONS_LIST: "/api/admin/verifications",
      VERIFY_PUBLIC: (id) => `/api/verify/${encodeURIComponent(id)}`,
      BADGE_SVG: (id) => `/api/badge/${encodeURIComponent(id)}.svg`,
      VERIFICATION_ACTION: (id, action) =>
        `/api/admin/verification/${encodeURIComponent(id)}/${action}`,
      VERIFICATION_DELETE: (id) =>
        `/api/admin/verification/${encodeURIComponent(id)}`,
    },

    getApiUrl(endpoint) {
      return `${this.API_BASE_URL}${endpoint}`;
    },

    getSellerProfileLink(id) {
      return `${this.FRONTEND_URL}/seller/?id=${encodeURIComponent(id)}`;
    },
  };

  if (typeof localStorage !== "undefined") {
    const override = localStorage.getItem("WT_API_OVERRIDE");
    if (override) {
      CONFIG.API_BASE_URL = override;
    }
  }

  global.WT_CONFIG = CONFIG;
})(typeof window !== "undefined" ? window : globalThis);
