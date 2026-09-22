import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_EXPIRES_IN = "12h";

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin & issue JWT
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPasswordHash || !jwtSecret) {
      console.error("❌ Admin credentials or JWT_SECRET are missing in .env");
      return res.status(500).json({
        success: false,
        message: "Admin authentication service configuration error"
      });
    }

    // 2️⃣ Email check (trimmed, case-insensitive)
    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 3️⃣ Password compare
    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 4️⃣ JWT generate
    const token = jwt.sign(
      { role: "admin", email: adminEmail.trim().toLowerCase() },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        email: adminEmail,
        role: "admin"
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
