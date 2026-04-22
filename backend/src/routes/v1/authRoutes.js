const express = require("express");
const { body } = require("express-validator");
const { login, me, register } = require("../../controllers/authController");
const validateRequest = require("../../middlewares/validateRequest");
const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register user
 */
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["user", "admin"]),
  ],
  validateRequest,
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 */
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 })],
  validateRequest,
  login
);

router.get("/me", protect, me);

module.exports = router;
