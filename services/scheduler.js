const cron = require('node-cron');
const Task = require('../models/Task');
const { transporter, getHtmlTemplate } = require('./mailer');

const startScheduler = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily check for task deadlines...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            const upcomingTasks = await Task.find({
                deadline: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                status: 'Pending'
            }).populate('owner', 'email displayName'); // Only populate needed fields

            if (!upcomingTasks.length) return console.log('No tasks due tomorrow.');

            for (const task of upcomingTasks) {
                if (task.owner && task.owner.email) {
                    const htmlContent = `
                        <p style="color: #333; font-size: 16px;">
                            Hello ${task.owner.displayName},<br><br>
                            This is a friendly reminder that your task, "<b>${task.title}</b>", is due tomorrow.
                        </p>`;
                    const button = `<a href="http://${process.env.APP_URL}/task/${task._id}" ...>View Task</a>`;
                    
                    await transporter.sendMail({
                        to: task.owner.email,
                        from: `Task Manager <${process.env.EMAIL_USER}>`,
                        subject: `Reminder: Your task is due tomorrow!`,
                        html: getHtmlTemplate('Task Deadline Reminder', htmlContent, button)
                    });
                    console.log(`Sent reminder for "${task.title}" to ${task.owner.email}`);
                }
            }
        } catch (error) {
            console.error('Error sending deadline reminders:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

module.exports = startScheduler;