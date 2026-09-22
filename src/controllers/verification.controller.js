import Verification from "../models/verification.model.js";
import generateVerificationId from "../utils/generateVerificationId.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ==========================================
 * 1️⃣ CREATE VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   POST /api/admin/verification
 * @access  Private (Admin)
 */
export const createVerification = async (req, res) => {
  try {
    const {
      sellerName,
      businessName,
      email,
      website = "",
      city,
      expiryDate
    } = req.body;

    // 1. Check required fields
    if (!sellerName || !businessName || !email || !city || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields (Seller Name, Business Name, Email, City, Expiry Date) must be provided"
      });
    }

    // 2. Validate email format
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // 3. Validate expiry date is valid & in the future
    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date format. Please use YYYY-MM-DD"
      });
    }

    if (parsedExpiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future"
      });
    }

    // 4. Generate unique verification ID
    const verificationId = await generateVerificationId();

    // 5. Create verification record
    const verification = await Verification.create({
      verificationId,
      sellerName: sellerName.trim(),
      businessName: businessName.trim(),
      email: cleanEmail,
      website: website.trim(),
      city: city.trim(),
      status: "ACTIVE",
      expiryDate: parsedExpiry
    });

    return res.status(201).json({
      success: true,
      message: "Verification created successfully",
      data: verification
    });

  } catch (error) {
    console.error("Create verification error:", error);

    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A verification with this ID already exists. Please try again."
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 2️⃣ PUBLIC VERIFY (NO AUTH)
 * ==========================================
 * @route   GET /api/verify/:id
 * @access  Public
 */
export const publicVerify = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Verification ID is required"
      });
    }

    const cleanId = id.trim().toUpperCase();

    const verification = await Verification.findOne({
      verificationId: cleanId
    }).lean();

    if (!verification) {
      return res.status(404).json({
        success: false,
        verified: false,
        status: "NOT_FOUND",
        message: "Verification record not found in official registry"
      });
    }

    const now = new Date();
    const expiry = new Date(verification.expiryDate);

    // ⏰ Check Expiry
    if (expiry < now) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: "EXPIRED",
        verificationId: verification.verificationId,
        sellerName: verification.sellerName,
        businessName: verification.businessName,
        validTill: verification.expiryDate,
        message: "This verification has expired"
      });
    }

    // 🚫 Check Status (e.g. REVOKED)
    if (verification.status !== "ACTIVE") {
      return res.status(200).json({
        success: true,
        verified: false,
        status: verification.status,
        verificationId: verification.verificationId,
        sellerName: verification.sellerName,
        businessName: verification.businessName,
        message: `This verification is currently ${verification.status.toLowerCase()}`
      });
    }

    // ✅ Verified & Active
    return res.status(200).json({
      success: true,
      verified: true,
      status: "ACTIVE",
      verificationId: verification.verificationId,
      sellerName: verification.sellerName,
      businessName: verification.businessName,
      website: verification.website,
      city: verification.city,
      validTill: verification.expiryDate,
      issuedAt: verification.createdAt,
      data: verification
    });

  } catch (error) {
    console.error("Public verify error:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 3️⃣ GET ALL VERIFICATIONS (ADMIN ONLY)
 * ==========================================
 * @route   GET /api/admin/verifications
 * @access  Private (Admin)
 */
export const getAllVerifications = async (req, res) => {
  try {
    const list = await Verification.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Get all verifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve verifications"
    });
  }
};

/**
 * ==========================================
 * 4️⃣ REVOKE VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   PATCH /api/admin/verification/:id/revoke
 * @access  Private (Admin)
 */
export const revokeVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const verification = await Verification.findOneAndUpdate(
      { verificationId: cleanId },
      { status: "REVOKED" },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification status revoked",
      data: verification
    });

  } catch (error) {
    console.error("Revoke error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 5️⃣ EXPIRE VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   PATCH /api/admin/verification/:id/expire
 * @access  Private (Admin)
 */
export const expireVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const verification = await Verification.findOneAndUpdate(
      { verificationId: cleanId },
      { status: "EXPIRED" },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification marked as expired",
      data: verification
    });

  } catch (error) {
    console.error("Expire error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 6️⃣ EXTEND VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   PATCH /api/admin/verification/:id/extend
 * @access  Private (Admin)
 */
export const extendVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: "New expiry date is required"
      });
    }

    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date format. Use YYYY-MM-DD"
      });
    }

    if (parsedExpiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "New expiry date must be in the future"
      });
    }

    const cleanId = id.trim().toUpperCase();

    // If extending an expired/revoked item, restore to ACTIVE if desired
    const verification = await Verification.findOneAndUpdate(
      { verificationId: cleanId },
      {
        expiryDate: parsedExpiry,
        status: "ACTIVE"
      },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expiry date extended & verification activated",
      data: verification
    });

  } catch (error) {
    console.error("Extend error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 7️⃣ UPDATE VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   PATCH /api/admin/verification/:id/update
 * @access  Private (Admin)
 */
export const updateVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerName, businessName, city, email, website, expiryDate } = req.body;

    const updateData = {};

    if (sellerName !== undefined) updateData.sellerName = sellerName.trim();
    if (businessName !== undefined) updateData.businessName = businessName.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (website !== undefined) updateData.website = website.trim();

    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }
      updateData.email = cleanEmail;
    }

    if (expiryDate !== undefined) {
      const parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format"
        });
      }
      updateData.expiryDate = parsedExpiry;
    }

    const cleanId = id.trim().toUpperCase();

    const updated = await Verification.findOneAndUpdate(
      { verificationId: cleanId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification details updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * ==========================================
 * 8️⃣ DELETE VERIFICATION (ADMIN ONLY)
 * ==========================================
 * @route   DELETE /api/admin/verification/:id
 * @access  Private (Admin)
 */
export const deleteVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const deleted = await Verification.findOneAndDelete({
      verificationId: cleanId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification deleted successfully",
      verificationId: cleanId
    });

  } catch (error) {
    console.error("Delete verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
