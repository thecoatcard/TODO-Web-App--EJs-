

const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Wraps content in a styled HTML email template.
 * @param {string} title - The title of the email.
 * @param {string} content - The main HTML content of the email.
 * @param {string} [button] - Optional HTML for a call-to-action button.
 * @returns {string} The full HTML email.
 */
const getHtmlTemplate = (title, content, button = '') => {

    const colors = {
        primary: '#A78BFA',
        background: '#F3F4F6',
        text: '#374151',
        card: '#FFFFFF',
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: ${colors.background}; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: ${colors.card}; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { color: ${colors.primary}; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .content { color: ${colors.text}; font-size: 16px; line-height: 1.6; }
            .button-container { text-align: center; margin-top: 30px; }
            .button { display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff !important; text-decoration: none; background-color: ${colors.primary}; border-radius: 6px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9CA3AF; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">${title}</div>
            <div class="content">
                ${content}
            </div>
            ${button ? `<div class="button-container">${button}</div>` : ''}
            <div class="footer">
                <p>You received this email from the Task Manager App.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { transporter, getHtmlTemplate };