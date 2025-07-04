// C:\Users\...\Node js\routes\task.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// @desc    Display task dashboard
// @route   GET /
router.get('/', ensureAuthenticated, taskController.displayTasks);

// @desc    Process new task form
// @route   POST /submit
router.post('/submit', ensureAuthenticated, taskController.createTask);

// @desc    Show details for a single task
// @route   GET /task/:id
router.get('/task/:id', ensureAuthenticated, taskController.getTaskDetails);

// @desc    Update task status (complete/pending)
// @route   POST /status/:id
router.post('/status/:id', ensureAuthenticated, taskController.updateTaskStatus);

// @desc    Show delete confirmation page
// @route   GET /delete/:id
router.get('/delete/:id', ensureAuthenticated, taskController.getDeleteConfirmation);

// @desc    Process task deletion
// @route   POST /delete/:id
router.post('/delete/:id', ensureAuthenticated, taskController.deleteTask);

module.exports = router;