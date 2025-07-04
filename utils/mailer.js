const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * A helper function to generate the full HTML email body.
 * @param {string} title - The main title for the email body.
 * @param {string} content - The main HTML content block.
 * @param {string} [button=''] - Optional HTML for a call-to-action button.
 * @returns {string} The complete HTML email.
 */
function getHtmlTemplate(title, content, button = '') {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'); </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0d1117;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 20px; background-color: #161b22; border-bottom: 1px solid #30363d; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #c9d1d9; font-size: 24px; text-shadow: 0 1px 1px rgba(0,186,255,0.5);">Task Manager</h1>
                </td>
            </tr>
            <tr>
                <td bgcolor="#161b22" style="padding: 40px 30px; border-left: 1px solid #30363d; border-right: 1px solid #30363d;">
                    <h2 style="margin: 0 0 20px 0; color: #c9d1d9; font-size: 20px;">${title}</h2>
                    ${content}
                    ${button ? `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-top: 20px;">${button}</td></tr></table>` : ''}
                </td>
            </tr>
            <tr>
                <td bgcolor="#161b22" align="center" style="padding: 20px 30px; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; border-radius: 0 0 12px 12px;">
                    You are receiving this email as a notification regarding your tasks. You can manage your preferences in your account settings.
                    <br><br>&copy; ${new Date().getFullYear()} Task Manager
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

module.exports = { transporter, getHtmlTemplate };