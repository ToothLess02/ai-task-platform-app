const Task = require('../models/Task');
const { pushTaskToQueue } = require('../config/redis');

// @desc    Create a new AI processing task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, inputText, operationType } = req.body;
    if (!title || !inputText || !operationType) {
      return res.status(400).json({ message: 'Title, inputText, and operationType are required' });
    }

    const validOperations = ['Uppercase', 'Lowercase', 'Reverse String', 'Word Count'];
    if (!validOperations.includes(operationType)) {
      return res.status(400).json({ message: `Invalid operationType. Must be one of: ${validOperations.join(', ')}` });
    }

    // 1. Create task record with status Pending
    const task = await Task.create({
      user: req.user._id,
      title,
      inputText,
      operationType,
      status: 'Pending',
      logs: [
        {
          timestamp: new Date(),
          message: 'Task created and queued for background worker',
          level: 'INFO',
        },
      ],
    });

    // 2. Push task ID & payload to Redis queue
    const queuePayload = {
      taskId: task._id.toString(),
      inputText,
      operationType,
      createdAt: task.createdAt,
    };
    await pushTaskToQueue(queuePayload);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task details with logs and result
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
};
