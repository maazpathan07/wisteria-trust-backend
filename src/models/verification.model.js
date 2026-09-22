import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const verificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: [true, "Verification ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    sellerName: {
      type: String,
      required: [true, "Seller Name is required"],
      trim: true
    },

    businessName: {
      type: String,
      required: [true, "Business Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [emailRegex, "Please enter a valid email address"]
    },

    website: {
      type: String,
      trim: true,
      default: ""
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED", "EXPIRED"],
      default: "ACTIVE",
      index: true
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for checking if currently expired
verificationSchema.methods.isCurrentlyExpired = function () {
  return new Date(this.expiryDate) < new Date();
};

export default mongoose.model("Verification", verificationSchema);
