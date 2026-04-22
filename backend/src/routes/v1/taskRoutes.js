const express = require("express");
const { body, param } = require("express-validator");
const Task = require("../../models/Task");
const {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} = require("../../controllers/taskController");
const { authorize, protect } = require("../../middlewares/authMiddleware");
const validateRequest = require("../../middlewares/validateRequest");

const router = express.Router();

const taskValidation = [
  body("title").optional().trim().isLength({ min: 3, max: 120 }),
  body("description").optional().trim().isLength({ max: 500 }),
  body("status").optional().isIn(["pending", "in_progress", "done"]),
];

const idValidation = [param("id").isMongoId()];

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: List tasks
 */
router.get("/", protect, listTasks);
router.post("/", protect, taskValidation, validateRequest, createTask);
router.get("/admin/all", protect, authorize("admin"), async (_req, res) => {
  const tasks = await Task.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: tasks });
});
router.get("/:id", protect, idValidation, validateRequest, getTaskById);
router.put("/:id", protect, idValidation, taskValidation, validateRequest, updateTask);
router.delete("/:id", protect, idValidation, validateRequest, deleteTask);

module.exports = router;
