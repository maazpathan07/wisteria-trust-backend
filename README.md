# 🏛️ Wisteria Trust — Backend Infrastructure & Admin Engine

Independent, luxury seller verification infrastructure built on **Node.js**, **Express**, and **MongoDB**. Provides RESTful verification APIs, dynamic real-time SVG badge generation, JWT authentication, and an administrative control panel.

---

## 🚀 Key Features

* **RESTful Verification Protocol:** Instant, public registry lookup by Verification ID (`WT-YYYY-XXX`).
* **Live Dynamic SVG Trust Badge (`/api/badge/:id.svg`):** Real-time vector badge generation for external website embeds.
* **Collision-Safe Sequential ID Generator:** Atomic year-based ID format (`WT-2025-001`).
* **JWT Admin Authentication:** Protected lifecycle management endpoints (Create, List, Revoke, Expire, Extend, Update, Delete).
* **Enterprise Security & Rate Limiting:** Global rate-limiting protection (100 req/15m) and strict regex validation.
* **Dual MongoDB URI Support:** Seamless compatibility with both `MONGO_URI` and `MONGODB_URI`.

---

## 🛠️ Technology Stack

* **Runtime:** Node.js (ES Modules `"type": "module"`)
* **Framework:** Express.js `4.19.2`
* **Database & ODM:** MongoDB, Mongoose `9.0.2`
* **Authentication:** JSON Web Tokens (`jsonwebtoken` `9.0.3`) & `bcryptjs` `3.0.3`
* **Protection:** `express-rate-limit` `8.2.1` & `cors` `2.8.5`

---

## 📦 Installation & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/maazpathan07/wisteria-trust-backend.git
cd wisteria-trust-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@wisteriatrust.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash
JWT_SECRET=your_secret_key
CORS_ORIGIN=*
```

> **Tip:** To generate a new password hash, run `node generateHash.js`.

### 3. Start the Server
```bash
# Start in development mode (with nodemon)
npm run dev

# Start in production mode
npm start
```

---

## 📡 API Reference

### 🌐 Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check |
| `GET` | `/api/status` | Infrastructure status |
| `GET` | `/api/verify/:id` | Lookup seller verification record |
| `GET` | `/api/badge/:id.svg` | **Live Dynamic SVG Trust Badge** for embeds |
| `GET` | `/api/verify/:id/badge.svg` | Alternate live SVG badge route |

### 🔒 Admin Protected Endpoints (`Authorization: Bearer <token>`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate admin & receive JWT |
| `POST` | `/api/admin/verification` | Create new seller verification |
| `GET` | `/api/admin/verifications` | Retrieve all registered verifications |
| `PATCH` | `/api/admin/verification/:id/revoke` | Revoke a verification standing |
| `PATCH` | `/api/admin/verification/:id/expire` | Mark a verification as expired |
| `PATCH` | `/api/admin/verification/:id/extend` | Extend validity & auto-reactivate |
| `PATCH` | `/api/admin/verification/:id/update` | Update seller / business metadata |
| `DELETE` | `/api/admin/verification/:id` | Permanently delete verification record |

---

## 🛡️ Dynamic SVG Badge Usage

External merchants can embed the live SVG badge on their storefront:

```html
<a href="https://wisteriatrust.com/?id=WT-2025-001" target="_blank" rel="noopener noreferrer">
  <img src="https://wisteria-backend.onrender.com/api/badge/WT-2025-001.svg" alt="Verified by Wisteria Trust" width="260">
</a>
```

The badge dynamically renders:
* 🟢 **ACTIVE:** Luxury Gold Shield with emerald verified status
* 🟠 **EXPIRED:** Amber status with expiration alert
* 🔴 **REVOKED:** Red high-priority revocation warning
* ⚪ **NOT_FOUND:** Neutral slate unverified record

---

## 👤 Author
**Maaz Pathan**  
GitHub: [@maazpathan07](https://github.com/maazpathan07)