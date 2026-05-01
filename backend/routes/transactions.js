const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");
const { protect, checkRole } = require("../middleware/auth");

// Public, Auditor, and Admin can view
router.get("/", protect, controller.getAllTransactions);
router.get("/:id", protect, controller.getTransaction);

// Public verification (No Auth)
router.get("/verify/:id", controller.verifyTransaction);

// Only Admin can create (simulate)
router.post("/", protect, checkRole("admin"), controller.createTransaction);

module.exports = router;
