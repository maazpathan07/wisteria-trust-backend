import Verification from "../models/verification.model.js";

/**
 * Generates a unique, collision-safe Verification ID
 * Format: WT-YYYY-001, WT-YYYY-002, ..., WT-YYYY-999, WT-YYYY-1000
 * 
 * @param {number} [customYear] - Optional year override for testing
 * @returns {Promise<string>} Generated unique verification ID
 */
export const generateVerificationId = async (customYear = null) => {
  const year = customYear || new Date().getFullYear();
  const yearPrefix = `WT-${year}-`;
  const regex = new RegExp(`^WT-${year}-(\\d+)$`);

  try {
    // 1. Find all records for the current year to accurately find the highest sequence
    const matchingDocs = await Verification.find(
      { verificationId: { $regex: `^WT-${year}-` } },
      { verificationId: 1 }
    ).lean();

    let maxNumber = 0;

    for (const doc of matchingDocs) {
      if (doc && doc.verificationId) {
        const match = doc.verificationId.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }

    let candidateNumber = maxNumber + 1;
    let candidateId = `${yearPrefix}${String(candidateNumber).padStart(3, "0")}`;

    // 2. Automated Collision-Prevention loop
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const exists = await Verification.exists({ verificationId: candidateId });
      if (!exists) {
        return candidateId;
      }
      candidateNumber++;
      candidateId = `${yearPrefix}${String(candidateNumber).padStart(3, "0")}`;
      attempts++;
    }

    return candidateId;

  } catch (error) {
    console.error("Verification ID generation error:", error);
    // Robust fallback
    const fallbackSuffix = String(Date.now()).slice(-4);
    return `${yearPrefix}${fallbackSuffix}`;
  }
};

export default generateVerificationId;
