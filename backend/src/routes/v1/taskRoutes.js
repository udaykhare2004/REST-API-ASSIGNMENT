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
 *     tags: [Tasks]
 *     summary: List tasks for current user (or all if admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, listTasks);
/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete assignment
 *               description:
 *                 type: string
 *                 example: Add all requested APIs
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation failed
 */
router.post("/", protect, taskValidation, validateRequest, createTask);
/**
 * @swagger
 * /api/v1/tasks/admin/all:
 *   get:
 *     tags: [Tasks]
 *     summary: Admin only - list all tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *       403:
 *         description: Forbidden
 */
router.get("/admin/all", protect, authorize("admin"), async (_req, res) => {
  const tasks = await Task.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: tasks });
});
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get("/:id", protect, idValidation, validateRequest, getTaskById);
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put("/:id", protect, idValidation, taskValidation, validateRequest, updateTask);
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete("/:id", protect, idValidation, validateRequest, deleteTask);

module.exports = router;
