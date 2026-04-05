// Load environment variables FIRST — use __dirname so it works from any working directory
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDatabase = require("./src/config/database");
const {
  GENERAL_RATE_LIMIT_WINDOW_MS,
  GENERAL_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
} = require("./src/utils/constants");

// Import route files
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const businessRoutes = require("./src/routes/business.routes");
const investmentRoutes = require("./src/routes/investment.routes");
const dividendRoutes = require("./src/routes/dividend.routes");
const adminRoutes = require("./src/routes/admin.routes");
const governanceRoutes = require("./src/routes/governance.routes");

// Import services
const {
  checkExpiredCampaigns,
} = require("./src/services/deadlineChecker.service");
const {
  checkAndFinalize,
} = require("./src/services/proposalFinalizer.service");
const {
  checkPendingBusinesses,
} = require("./src/services/proposalCreator.service");
const { sendVoteReminders } = require("./src/services/notification.service");

// Create Express app
const app = express();

// ──────────────────────────────────────────
// Connect to MongoDB
// ──────────────────────────────────────────
connectDatabase();

// ──────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────

// Security headers — relaxed for local dev so CORS isn't blocked by helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  }),
);

// CORS configuration — allow any localhost origin in development
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // In development allow any localhost / 127.0.0.1 origin on any port
      if (
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      // In production only allow the configured FRONTEND_URL
      const allowed = process.env.FRONTEND_URL || "http://localhost:3000";
      if (origin === allowed) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request logging (dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiting DISABLED for development — re-enable for production
// const generalLimiter = rateLimit({ ... });
// const authLimiter = rateLimit({ ... });
// const walletLimiter = rateLimit({ ... });

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "InvestX API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InvestX API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Public config — exposes wallet/contract addresses and conversion rates for frontend
app.get("/api/config/public", (req, res) => {
  const { XLM_INR_RATE } = require("./src/utils/constants");
  const { adminKeypair } = require("./src/config/stellar");
  const { DIVIDEND_DISTRIBUTOR_ADDRESS } = require("./src/config/governance");
  res.json({
    success: true,
    data: {
      adminWalletAddress: adminKeypair ? adminKeypair.publicKey() : null,
      dividendDistributorAddress: DIVIDEND_DISTRIBUTOR_ADDRESS,
      xlmInrRate: XLM_INR_RATE,
    },
  });
});

// Wallet-connect — direct route (no rate limit in dev)
const { walletConnect } = require("./src/controllers/auth.controller");
app.post("/api/auth/wallet-connect", walletConnect);

// Auth routes (no rate limit in dev)
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Business routes
app.use("/api/businesses", businessRoutes);

// Investment routes
app.use("/api/investments", investmentRoutes);

// Dividend routes
app.use("/api/dividends", dividendRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Governance routes
app.use("/api/governance", governanceRoutes);

// ──────────────────────────────────────────
// 404 Handler — Unknown routes
// ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ──────────────────────────────────────────
// Global Error Handler (must be LAST)
// ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}. This ${field} is already registered.`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please log in again.",
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 InvestX server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );

  // Run deadline checker on startup and every 6 hours
  checkExpiredCampaigns();
  setInterval(checkExpiredCampaigns, 6 * 60 * 60 * 1000);

  // Governance cron jobs — run on startup then on intervals
  checkAndFinalize();
  checkPendingBusinesses();
  sendVoteReminders();
  // Check for expired proposals every 5 minutes
  setInterval(checkAndFinalize, 5 * 60 * 1000);
  // Check for businesses needing proposals every 5 minutes (fallback for auto-create)
  setInterval(checkPendingBusinesses, 5 * 60 * 1000);
  // Send vote reminders every 30 minutes
  setInterval(sendVoteReminders, 30 * 60 * 1000);
  console.log(
    "⚖️  Governance cron jobs scheduled (finalize: 5min, proposals: 5min, reminders: 30min)",
  );
});

module.exports = app;
