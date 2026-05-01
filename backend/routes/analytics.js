const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

router.get("/", protect, controller.getAnalytics);

module.exports = router;
