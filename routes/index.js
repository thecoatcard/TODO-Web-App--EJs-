// routes/index.js (Handles the root URL)

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// The task routes are now handled here
router.get('/', ensureAuthenticated, taskController.displayTasks);
router.post('/submit', ensureAuthenticated, taskController.createTask);
router.get('/task/:id', ensureAuthenticated, taskController.getTaskDetails);
router.post('/status/:id', ensureAuthenticated, taskController.updateTaskStatus);
router.get('/delete/:id', ensureAuthenticated, taskController.getDeleteConfirmation);
router.post('/delete/:id', ensureAuthenticated, taskController.deleteTask);

module.exports = router;