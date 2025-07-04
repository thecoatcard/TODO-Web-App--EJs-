const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

exports.displayTasks = asyncHandler(async (req, res) => {
    let query = { owner: req.user.id };
    const { search } = req.query;

    if (search && search.trim()) {
        const searchQuery = new RegExp(search.trim(), 'i'); // Case-insensitive regex
        query.$or = [{ title: searchQuery }, { description: searchQuery }];
    }

    const tasks = await Task.find(query).sort({ status: 1, deadline: 1 });
    res.render('index', { tasks, search: search || '' });
});
exports.getTaskDetails = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) {
        req.flash('error', 'Task not found or you do not have permission to view it.');
        return res.redirect('/');
    }
    res.render('task-detail', { task });
});
exports.createTask = asyncHandler(async (req, res) => {
    const { title, description, deadline } = req.body;
    if (!title || !description || !deadline) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/');
    }
    await Task.create({ title, description, deadline, owner: req.user.id });
    req.flash('success', 'Task Added Successfully');
    res.redirect('/');
});
exports.updateTaskStatus = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (task) {
        task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
        await task.save();
        req.flash('info', `Task marked as ${task.status}`);
    }
    res.redirect(req.get('referer') || '/'); // Redirect back to the previous page
});


exports.getDeleteConfirmation = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) {
        req.flash('error', 'Task not found.');
        return res.redirect('/');
    }
    res.render('delete-confirm', { task });
});

exports.deleteTask = asyncHandler(async (req, res) => {
    const result = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!result) {
        req.flash('error', 'Task not found.');
    } else {
        req.flash('success', 'Task Deleted Successfully');
    }
    res.redirect('/');
});