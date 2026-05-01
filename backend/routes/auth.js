const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { protect, checkRole } = require("../middleware/auth");

router.get("/users", protect, checkRole("admin"), controller.getUsers);
router.post("/login", controller.login);

module.exports = router;
