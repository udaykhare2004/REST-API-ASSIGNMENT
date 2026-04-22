const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

const buildOwnerFilter = (req) =>
  req.user.role === "admin" ? {} : { createdBy: req.user._id };

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
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
    const tasks = await Task.find(buildOwnerFilter(req)).sort({ createdAt: -1 });
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
    const task = await Task.findOne({
      _id: req.params.id,
      ...buildOwnerFilter(req),
    });
    if (!task) {
      return next(new ApiError(404, "Task not found"));
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
    return res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTask, listTasks, getTaskById, updateTask, deleteTask };
