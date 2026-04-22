const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

const buildOwnerFilter = (req) =>
  req.user.role === "admin" ? {} : { createdBy: req.user._id };

const getListCacheKey = (req) =>
  req.user.role === "admin" ? "tasks:admin:all" : `tasks:user:${req.user._id}:all`;

const getTaskCacheKey = (req, taskId) =>
  req.user.role === "admin"
    ? `tasks:admin:item:${taskId}`
    : `tasks:user:${req.user._id}:item:${taskId}`;

const invalidateUserTaskCache = async (redisClient, userId, taskId) => {
  if (!redisClient) {
    return;
  }

  const keys = [
    `tasks:user:${userId}:all`,
    `tasks:user:${userId}:item:${taskId}`,
    "tasks:admin:all",
    `tasks:admin:item:${taskId}`,
  ];

  await redisClient.del(keys);
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await invalidateUserTaskCache(req.app.locals.redisClient, req.user._id, task._id);
    return res.status(201).json({
      success: true,
      message: "Task created",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const redisClient = req.app.locals.redisClient;
    const cacheKey = getListCacheKey(req);

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          meta: { cached: true },
        });
      }
    }

    const tasks = await Task.find(buildOwnerFilter(req)).sort({ createdAt: -1 });
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 120 });
    }

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const redisClient = req.app.locals.redisClient;
    const cacheKey = getTaskCacheKey(req, req.params.id);

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          meta: { cached: true },
        });
      }
    }

    const task = await Task.findOne({
      _id: req.params.id,
      ...buildOwnerFilter(req),
    });
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }

    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(task), { EX: 120 });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...buildOwnerFilter(req) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }
    await invalidateUserTaskCache(req.app.locals.redisClient, task.createdBy, task._id);
    return res.status(200).json({
      success: true,
      message: "Task updated",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      ...buildOwnerFilter(req),
    });
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }
    await invalidateUserTaskCache(req.app.locals.redisClient, task.createdBy, task._id);
    return res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTask, listTasks, getTaskById, updateTask, deleteTask };
