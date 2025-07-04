// models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed'] },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // Use timestamps for creation/update dates

module.exports = mongoose.model('Task', taskSchema);