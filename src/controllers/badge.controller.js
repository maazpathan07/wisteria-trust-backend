import Verification from "../models/verification.model.js";

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates an ultra-crisp luxury SVG badge for a given status
 */
function renderBadgeSvg({ status, verificationId, businessName, sellerName }) {
  const safeBusiness = escapeXml(businessName || sellerName || "Registered Member");
  const safeId = escapeXml(verificationId || "WT-REGISTRY");

  // Status-specific themes
  let statusColor = "#10B981"; // Emerald
  let statusBg = "rgba(16, 185, 129, 0.15)";
  let statusText = "VERIFIED • ACTIVE";
  let borderColor = "url(#gold-border)";
  let shieldGradient = "url(#gold-grad)";
  let iconPath = `<path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="url(#gold-grad)"/>`;

  if (status === "EXPIRED") {
    statusColor = "#F59E0B"; // Amber
    statusBg = "rgba(245, 158, 11, 0.15)";
    statusText = "STATUS • EXPIRED";
    borderColor = "rgba(245, 158, 11, 0.4)";
    shieldGradient = "url(#amber-grad)";
    iconPath = `<path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="#F59E0B"/>`;
  } else if (status === "REVOKED") {
    statusColor = "#EF4444"; // Red
    statusBg = "rgba(239, 68, 68, 0.15)";
    statusText = "REVOKED • INVALID";
    borderColor = "rgba(239, 68, 68, 0.5)";
    shieldGradient = "url(#red-grad)";
    iconPath = `<path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm1 13h-2v-2h2v2zm0-4h-2V7h2v4z" fill="#EF4444"/>`;
  } else if (status === "NOT_FOUND") {
    statusColor = "#94A3B8"; // Slate
    statusBg = "rgba(148, 163, 184, 0.15)";
    statusText = "UNVERIFIED RECORD";
    borderColor = "rgba(148, 163, 184, 0.3)";
    iconPath = `<path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm1 13h-2v-2h2v2zm0-4h-2V7h2v4z" fill="#94A3B8"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 92" width="340" height="92" fill="none">
  <defs>
    <linearGradient id="card-bg" x1="0" y1="0" x2="340" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#141820"/>
      <stop offset="100%" stop-color="#0b0d12"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E5C77A"/>
      <stop offset="50%" stop-color="#C5A059"/>
      <stop offset="100%" stop-color="#8E6D2F"/>
    </linearGradient>
    <linearGradient id="gold-border" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#C5A059" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#8E6D2F" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#C5A059" stop-opacity="0.6"/>
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#C5A059" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Container Box -->
  <rect x="1" y="1" width="338" height="90" rx="14" fill="url(#card-bg)" stroke="${borderColor}" stroke-width="1.5" filter="url(#glow)"/>

  <!-- Left Shield Icon -->
  <g transform="translate(18, 20) scale(1.8)">
    ${iconPath}
  </g>

  <!-- Text Details -->
  <!-- Brand Label -->
  <text x="76" y="27" fill="#C5A059" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="9" font-weight="700" letter-spacing="1.8">WISTERIA TRUST • OFFICIAL</text>

  <!-- Business / Seller Name -->
  <text x="76" y="47" fill="#F8FAFC" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="0.2">
    ${safeBusiness.length > 24 ? safeBusiness.slice(0, 22) + "..." : safeBusiness}
  </text>

  <!-- Status Pill -->
  <g transform="translate(76, 56)">
    <rect width="136" height="20" rx="10" fill="${statusBg}" stroke="${statusColor}" stroke-opacity="0.3"/>
    <circle cx="10" cy="10" r="3.5" fill="${statusColor}"/>
    <text x="20" y="14" fill="${statusColor}" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="9" font-weight="700" letter-spacing="0.8">${statusText}</text>
  </g>

  <!-- WTID Right Tag -->
  <text x="322" y="70" fill="#64748B" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="9" font-weight="600" text-anchor="end" letter-spacing="0.5">${safeId}</text>
</svg>`;
}

/**
 * @route   GET /api/badge/:id.svg
 * @route   GET /api/badge/:id
 * @desc    Generate dynamic real-time SVG trust badge
 * @access  Public
 */
export const getDynamicBadgeSvg = async (req, res) => {
  try {
    let { id } = req.params;

    if (id && id.endsWith(".svg")) {
      id = id.slice(0, -4);
    }

    if (!id || typeof id !== "string" || !id.trim()) {
      const svg = renderBadgeSvg({ status: "NOT_FOUND", verificationId: "INVALID" });
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).send(svg);
    }

    const cleanId = id.trim().toUpperCase();

    const verification = await Verification.findOne({
      verificationId: cleanId
    }).lean();

    let status = "ACTIVE";
    let businessName = "Wisteria Verified Entity";
    let sellerName = "";

    if (!verification) {
      status = "NOT_FOUND";
    } else {
      businessName = verification.businessName;
      sellerName = verification.sellerName;

      const now = new Date();
      const expiry = new Date(verification.expiryDate);

      if (expiry < now) {
        status = "EXPIRED";
      } else if (verification.status !== "ACTIVE") {
        status = verification.status; // REVOKED or EXPIRED
      }
    }

    const svg = renderBadgeSvg({
      status,
      verificationId: cleanId,
      businessName,
      sellerName
    });

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(svg);

  } catch (error) {
    console.error("Dynamic badge SVG error:", error);
    const svg = renderBadgeSvg({ status: "NOT_FOUND", verificationId: "ERROR" });
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    return res.status(200).send(svg);
  }
};
