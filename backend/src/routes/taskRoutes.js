const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect); // All task routes require JWT authentication

router.route('/').post(createTask).get(getTasks);
router.route('/:id').get(getTaskById).delete(deleteTask);

module.exports = router;
